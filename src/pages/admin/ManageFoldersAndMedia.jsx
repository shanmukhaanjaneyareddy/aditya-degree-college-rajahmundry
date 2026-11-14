import React, { useState, useMemo } from 'react';
import {
  FolderPlus,
  Folder,
  Upload,
  Trash2,
  ChevronRight,
  Home,
  Image as ImageIcon,
} from 'lucide-react';
import { useCollegeData } from '../../context/CollegeDataContext';
import { uploadMediaToCloud } from '../../config/cloudinary';

export default function ManageFoldersAndMedia({ section, sectionLabel }) {
  const { data, addFolder, deleteFolder, addMediaItems, deleteMediaItem } =
    useCollegeData();

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    data.academicYears[0] || '2025-26'
  );
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const childFolders = useMemo(
    () => sectionFolders.filter((f) => (f.parentId || null) === currentFolderId),
    [sectionFolders, currentFolderId]
  );

  const folderPhotos = useMemo(() => {
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

      {/* Subfolders List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Folders ({childFolders.length}) — Click a folder to open & add subfolders or photos
        </h3>

        {childFolders.length === 0 ? (
          <p className="text-sm text-slate-500">No folders inside this level yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {childFolders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <Folder className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">{folder.name}</p>
                    <p className="text-xs text-slate-500">AY {folder.academicYear}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete folder "${folder.name}" and all photos/subfolders inside it?`
                      )
                    ) {
                      deleteFolder(folder.id);
                    }
                  }}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-100"
                  title="Delete Folder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Image Uploader (Active when inside a folder) */}
      {currentFolderId && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-aditya-navy flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-aditya-blue" />
                <span>
                  Upload Photos to "{breadcrumbs[breadcrumbs.length - 1]?.name}"
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select multiple photos at once. Recent Activity uploads automatically update the Home page carousel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption for uploaded photos..."
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm flex-1 min-w-[220px]"
            />

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

          {/* Existing Photos in this Folder */}
          {folderPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {folderPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Event'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => deleteMediaItem(photo.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 shadow"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}