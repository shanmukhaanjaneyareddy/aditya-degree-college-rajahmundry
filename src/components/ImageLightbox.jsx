import React from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageLightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
  folderTitle,
}) {
  if (activeIndex === null || !items[activeIndex]) return null;

  const current = items[activeIndex];

  const handleDownload = async () => {
    try {
      const res = await fetch(current.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${(folderTitle || 'aditya_photo').replace(/[^a-z0-9]/gi, '_')}_${
        activeIndex + 1
      }.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(current.url, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Top Controls */}
      <div
        className="flex items-center justify-between text-white max-w-6xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            {folderTitle}
          </p>
          <p className="text-sm text-slate-300">
            Photo {activeIndex + 1} of {items.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-aditya-navy font-bold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewer */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 max-w-6xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {items.length > 1 && (
          <button
            type="button"
            onClick={() =>
              onNavigate((activeIndex - 1 + items.length) % items.length)
            }
            className="absolute left-2 sm:left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.caption || folderTitle}
          className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((activeIndex + 1) % items.length)}
            className="absolute right-2 sm:right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      <div
        className="text-center text-sm text-slate-300 max-w-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {current.caption || ''}
      </div>
    </div>
  );
}