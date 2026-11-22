import React, { useState, useMemo } from 'react';
import {
  FolderPlus,
  Folder,
  Upload,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Home,
  Image as ImageIcon,
  Play,
  Youtube,
  Plus,
  GripVertical,
} from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';
import { uploadMediaToCloud } from '../../config/cloudinary';
import {
  extractYouTubeId,
  isYouTubeUrl,
  getYouTubeThumbnailUrl,
} from '../../config/youtube';

export default function ManageFoldersAndMedia({ section, sectionLabel }) {
  const {
    data,
    addFolder,
    reorderFolders,
    deleteFolder,
    addMediaItems,
    deleteMediaItem,
  } = useCollegeData();

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    data.academicYears[0] || '2025-2026'
  );
  const [caption, setCaption] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Drag-and-drop state for folder reordering
  const [draggedFolderId, setDraggedFolderId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);

  const sectionFolders = useMemo(
    () => data.folders.filter((f) => f.section === section),
    [data.folders, section]
  );

  const breadcrumbs = useMemo(() => {
    const trail = [];
    const map = new Map(data.folders.map((f) => [f.id, f]));
    let cursor = currentFolderId ? map.get(currentFolderId) : null;
    while (cursor) {
      trail.unshift(cursor);
      cursor = cursor.parentId ? map.get(cursor.parentId) : null;
    }
    return trail;
  }, [currentFolderId, data.folders]);

  const childFolders = useMemo(() => {
    return sectionFolders
      .filter((f) => (f.parentId || null) === currentFolderId)
      .sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
  }, [sectionFolders, currentFolderId]);

  const folderMedia = useMemo(() => {
    if (!currentFolderId) return [];
    return data.mediaItems
      .filter((m) => m.section === section && m.folderId === currentFolderId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [data.mediaItems, section, currentFolderId]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    addFolder({
      section,
      parentId: currentFolderId,
      name: newFolderName,
      academicYear: selectedAcademicYear,
    });
    setNewFolderName('');
  };

  const moveFolderToIndex = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= childFolders.length ||
      toIndex >= childFolders.length
    ) {
      return;
    }
    const updated = [...childFolders];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    reorderFolders(updated.map((f) => f.id));
  };

  const handleFolderDragStart = (e, folderId) => {
    setDraggedFolderId(folderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folderId);
  };

  const handleFolderDragOver = (e, targetFolderId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== targetFolderId) {
      setDragOverFolderId(targetFolderId);
    }
  };

  const handleFolderDrop = (e, targetFolderId) => {
    e.preventDefault();
    const sourceId = draggedFolderId || e.dataTransfer.getData('text/plain');
    setDraggedFolderId(null);
    setDragOverFolderId(null);

    if (!sourceId || sourceId === targetFolderId) return;

    const fromIndex = childFolders.findIndex((f) => f.id === sourceId);
    const toIndex = childFolders.findIndex((f) => f.id === targetFolderId);
    moveFolderToIndex(fromIndex, toIndex);
  };

  const handleFolderDragEnd = () => {
    setDraggedFolderId(null);
    setDragOverFolderId(null);
  };

  const handleBulkPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !currentFolderId) return;

    setUploading(true);
    try {
      const uploadedItems = [];
      for (const file of files) {
        const url = await uploadMediaToCloud(file, 'image');
        uploadedItems.push({
          id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          folderId: currentFolderId,
          section,
          mediaType: 'image',
          url,
          caption: caption.trim(),
          uploadedAt: new Date().toISOString(),
        });
      }
      addMediaItems(uploadedItems);
      setCaption('');
    } catch (err) {
      alert('Failed uploading images: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddYouTubeVideo = (e) => {
    e.preventDefault();
    if (!currentFolderId || !youtubeUrl.trim()) return;

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      alert(
        'Please enter a valid YouTube video URL (e.g., https://youtu.be/... or https://www.youtube.com/watch?v=...).'
      );
      return;
    }

    addMediaItems([
      {
        id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        folderId: currentFolderId,
        section,
        mediaType: 'video',
        url: `https://youtu.be/${videoId}`,
        caption: caption.trim(),
        uploadedAt: new Date().toISOString(),
      },
    ]);

    setYoutubeUrl('');
    setCaption('');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className="inline-flex items-center gap-1.5 font-bold text-aditya-blue hover:text-amber-600"
        >
          <Home className="w-4 h-4" />
          <span>{sectionLabel} Root</span>
        </button>

        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setCurrentFolderId(crumb.id)}
              className="font-bold text-amber-600 hover:underline"
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Create Folder / Subfolder Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-aditya-navy mb-3 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-amber-600" />
          <span>
            {currentFolderId
              ? `Create Subfolder inside "${breadcrumbs[breadcrumbs.length - 1]?.name}"`
              : `Create New Main Folder in ${sectionLabel}`}
          </span>
        </h3>

        <form onSubmit={handleCreateFolder} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            required
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder={
              currentFolderId ? 'e.g. 25 NOV 2026' : 'e.g. NSS or AI Expo'
            }
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm flex-1 min-w-[200px]"
          />

          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            title="Select Academic Year"
          >
            {data.academicYears.map((yr) => (
              <option key={yr} value={yr}>
                AY {yr}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-aditya-navy hover:bg-aditya-blue text-amber-400 font-bold text-sm"
          >
            + Create Folder
          </button>
        </form>
      </div>

      {/* Subfolders List (Drag & Drop Reorderable) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Folders ({childFolders.length}) — Click to open, or drag & drop to reorder
          </h3>
          {childFolders.length > 1 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Drag any folder card to change its public display order
            </span>
          )}
        </div>

        {childFolders.length === 0 ? (
          <p className="text-sm text-slate-500">No folders inside this level yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {childFolders.map((folder, index) => {
              const isDragging = draggedFolderId === folder.id;
              const isDragOver =
                dragOverFolderId === folder.id && draggedFolderId !== folder.id;

              return (
                <div
                  key={folder.id}
                  draggable
                  onDragStart={(e) => handleFolderDragStart(e, folder.id)}
                  onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                  onDragLeave={() => {
                    if (dragOverFolderId === folder.id) setDragOverFolderId(null);
                  }}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  onDragEnd={handleFolderDragEnd}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all select-none ${
                    isDragging
                      ? 'opacity-50 border-amber-500 bg-amber-50 scale-[0.98]'
                      : isDragOver
                      ? 'border-2 border-dashed border-aditya-blue bg-blue-50/70 shadow-md scale-[1.01]'
                      : 'border-slate-200 hover:border-amber-400 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 rounded"
                      title="Drag to reorder folder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <Folder className="w-6 h-6 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                            #{index + 1}
                          </span>
                          <p className="font-bold text-slate-900 truncate">
                            {folder.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          AY {folder.academicYear}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {childFolders.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveFolderToIndex(index, index - 1)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Earlier"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === childFolders.length - 1}
                          onClick={() => moveFolderToIndex(index, index + 1)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Later"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete folder "${folder.name}" and all media/subfolders inside it?`
                          )
                        ) {
                          deleteFolder(folder.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-100"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photos & YouTube Video Adder (Active when inside a folder) */}
      {currentFolderId && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-aditya-navy flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-aditya-blue" />
              <span>
                Add Photos or YouTube Videos to "{breadcrumbs[breadcrumbs.length - 1]?.name}"
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload photos to Cloudinary or paste a YouTube video link so visitors can watch it directly on the site.
            </p>
          </div>

          {/* Shared Caption Input */}
          <div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional title / caption for photo or YouTube video..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* Option A: Bulk Image Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-800">Upload Event Photos</p>
              <p className="text-xs text-slate-500">
                Select one or multiple images (JPG, PNG, WebP)
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-aditya-navy font-bold text-sm cursor-pointer shadow">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading Photos...' : 'Select & Upload Images'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleBulkPhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option B: Paste YouTube Video Link */}
          <form
            onSubmit={handleAddYouTubeVideo}
            className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-red-50/50 border border-red-200/70"
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <Youtube className="w-5 h-5 shrink-0" />
              <span>YouTube Link:</span>
            </div>

            <input
              type="url"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Paste YouTube URL (e.g. https://youtu.be/...)"
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm flex-1 min-w-[220px]"
            />

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add YouTube Video</span>
            </button>
          </form>

          {/* Existing Photos & Videos in this Folder */}
          {folderMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {folderMedia.map((item) => {
                const isVideo = item.mediaType === 'video' || isYouTubeUrl(item.url);
                const thumbSrc = isYouTubeUrl(item.url)
                  ? getYouTubeThumbnailUrl(item.url)
                  : item.url;

                return (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]"
                  >
                    <img
                      src={thumbSrc}
                      alt={item.caption || 'Event media'}
                      className="w-full h-full object-cover"
                    />
                    {isVideo && (
                      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold shadow">
                        <Play className="w-3 h-3 fill-current" />
                        YouTube Video
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMediaItem(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 shadow"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}