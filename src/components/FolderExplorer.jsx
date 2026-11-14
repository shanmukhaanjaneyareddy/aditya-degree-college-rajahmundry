import React, { useState, useMemo } from 'react';
import {
  Folder,
  ChevronRight,
  Home,
  Image as ImageIcon,
  Download,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';
import ImageLightbox from './ImageLightbox';

export default function FolderExplorer({
  section,
  title,
  subtitle,
  filterAcademicYear = null,
}) {
  const { data } = useCollegeData();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const sectionFolders = useMemo(() => {
    return data.folders.filter((f) => {
      if (f.section !== section) return false;
      if (filterAcademicYear && f.academicYear !== filterAcademicYear) return false;
      return true;
    });
  }, [data.folders, section, filterAcademicYear]);

  // Build breadcrumb trail from root down to currentFolderId
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
    return sectionFolders.filter((f) => (f.parentId || null) === currentFolderId);
  }, [sectionFolders, currentFolderId]);

  const currentPhotos = useMemo(() => {
    if (!currentFolderId) return [];
    return data.mediaItems
      .filter((m) => m.section === section && m.folderId === currentFolderId)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [data.mediaItems, section, currentFolderId]);

  // Collect a folder's ID and all of its nested subfolder IDs
  const getDescendantFolderIds = (rootId) => {
    const ids = new Set([rootId]);
    let added = true;
    while (added) {
      added = false;
      for (const f of sectionFolders) {
        if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
          ids.add(f.id);
          added = true;
        }
      }
    }
    return ids;
  };

  // Count total photos across a folder and all its subfolders
  const countItemsRecursive = (folderId) => {
    const ids = getDescendantFolderIds(folderId);
    return data.mediaItems.filter((m) => ids.has(m.folderId)).length;
  };

  // Get the most recently uploaded image across a folder and all its subfolders
  const getLatestCoverUrl = (folderId) => {
    const ids = getDescendantFolderIds(folderId);
    let latestItem = null;
    let latestTime = -Infinity;

    for (const item of data.mediaItems) {
      if (!ids.has(item.folderId) || !item.url) continue;
      const t = item.uploadedAt ? new Date(item.uploadedAt).getTime() : 0;
      if (t >= latestTime) {
        latestTime = t;
        latestItem = item;
      }
    }

    return latestItem?.url || null;
  };

  const handleDownload = async (e, url, filename) => {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'aditya-event-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const activeBreadcrumbTitle =
    breadcrumbs.length > 0
      ? breadcrumbs.map((b) => b.name).join(': ')
      : title;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-aditya-navy">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-slate-600 text-sm sm:text-base">{subtitle}</p>}
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm mb-8 text-sm">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
            currentFolderId === null
              ? 'text-aditya-navy'
              : 'text-aditya-blue hover:text-amber-600'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>All {title} Folders</span>
        </button>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`font-semibold transition-colors ${
                  isLast
                    ? 'text-amber-600'
                    : 'text-aditya-blue hover:text-amber-600'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Subfolders Grid */}
      {childFolders.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Folders ({childFolders.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {childFolders.map((folder) => {
              const subCount = sectionFolders.filter(
                (f) => f.parentId === folder.id
              ).length;
              const totalPhotos = countItemsRecursive(folder.id);
              const coverUrl = getLatestCoverUrl(folder.id);

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Folder Cover Preview (Last Uploaded Image in Folder/Subfolders) */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={folder.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Folder className="w-9 h-9" />
                      </div>
                    )}

                    {/* Academic Year Badge */}
                    {folder.academicYear && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-sm text-white text-xs font-semibold shadow-sm">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {folder.academicYear}
                      </span>
                    )}

                    {/* Folder Indicator Badge when Cover Image is Shown */}
                    {coverUrl && (
                      <span className="absolute bottom-2.5 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/95 text-aditya-navy text-[11px] font-bold shadow-sm">
                        <Folder className="w-3 h-3" />
                        Folder
                      </span>
                    )}
                  </div>

                  {/* Folder Title & Counts */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-aditya-blue transition-colors line-clamp-1">
                      {folder.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {subCount > 0 ? `${subCount} Subfolder(s) • ` : ''}
                      {totalPhotos} Photo(s)
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Photos Inside Current Folder */}
      {currentFolderId && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Gallery Photos ({currentPhotos.length})
          </h2>

          {currentPhotos.length === 0 && childFolders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">
                No photos uploaded in this folder yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || activeBreadcrumbTitle}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Preview
                    </span>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleDownload(
                          e,
                          photo.url,
                          `${activeBreadcrumbTitle.replace(/[^a-z0-9]/gi, '_')}_${
                            idx + 1
                          }.jpg`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-aditya-navy font-bold text-xs shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>

                  {photo.caption && (
                    <div className="p-3 border-t border-slate-100">
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty Root State */}
      {!currentFolderId && childFolders.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Folder className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            No {title} Folders Available Yet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Folders and event galleries added by the administration will appear here.
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightbox
        items={currentPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
        folderTitle={activeBreadcrumbTitle}
      />
    </div>
  );
}