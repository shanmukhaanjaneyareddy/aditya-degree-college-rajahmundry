import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Download, FolderOpen } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

/**
 * Displays up to 4 slides of the most recently uploaded activity photos
 * across distinct folders, formatted as "MainFolder: SubFolder".
 * - If 4+ folders have uploads: 1 latest photo from each of the 4 most recent folders.
 * - If 2 folders have uploads: 2 latest photos from each of the 2 folders (4 slides total).
 * - If 1 folder has uploads: up to 4 latest photos from that folder.
 */
export default function RecentActivitiesCarousel() {
  const { data } = useCollegeData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = useMemo(() => {
    const activityItems = [...data.mediaItems]
      .filter((m) => m.section === 'activities')
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    if (activityItems.length === 0) return [];

    const folderMap = new Map(data.folders.map((f) => [f.id, f]));

    const buildFolderTitle = (folderId) => {
      const folder = folderMap.get(folderId);
      if (!folder) return 'Campus Activity';
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) return `${parent.name}: ${folder.name}`;
      }
      return folder.name;
    };

    // Group items by folderId while preserving recency order
    const byFolder = new Map();
    for (const item of activityItems) {
      if (!byFolder.has(item.folderId)) {
        byFolder.set(item.folderId, []);
      }
      byFolder.get(item.folderId).push(item);
    }

    const folderQueues = Array.from(byFolder.entries()).map(([folderId, items]) => ({
      folderId,
      title: buildFolderTitle(folderId),
      items,
    }));

    // Round-robin pick across distinct folders up to 4 slides total
    const selected = [];
    let round = 0;
    while (selected.length < 4 && round < 4) {
      let addedInRound = false;
      for (const fq of folderQueues) {
        if (selected.length >= 4) break;
        if (fq.items[round]) {
          selected.push({
            ...fq.items[round],
            displayTitle: fq.title,
          });
          addedInRound = true;
        }
      }
      if (!addedInRound) break;
      round += 1;
    }

    return selected;
  }, [data.mediaItems, data.folders]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'aditya-activity.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (slides.length === 0) {
    return (
      <section className="bg-gradient-to-r from-aditya-navy via-aditya-blue to-aditya-navy text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Recent Campus Activities</h2>
              <p className="text-sm text-slate-300">
                Latest highlights from NSS, Cultural, and Departmental events will appear here automatically.
              </p>
            </div>
          </div>
          <Link
            to="/activities"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Explore Activity Folders</span>
          </Link>
        </div>
      </section>
    );
  }

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <section className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Recent Activities
            </span>
            <span className="text-xs text-slate-400">
              Slide {currentIndex + 1} of {slides.length}
            </span>
          </div>

          <Link
            to="/activities"
            className="text-xs sm:text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View All Activity Folders →
          </Link>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-white/10">
          <div className="relative h-[300px] sm:h-[420px] w-full">
            <img
              src={activeSlide.url}
              alt={activeSlide.displayTitle}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Bottom Overlay with Folder Title (e.g. "NSS: 25 NOV 2026") & Download */}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">
                  Newly Updated Event
                </p>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeSlide.displayTitle}
                </h2>
                {activeSlide.caption && (
                  <p className="text-sm text-slate-200 mt-1 max-w-2xl">
                    {activeSlide.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      activeSlide.url,
                      `${activeSlide.displayTitle.replace(/[^a-z0-9]/gi, '_')}.jpg`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Photo</span>
                </button>
              </div>
            </div>

            {/* Prev / Next Controls */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
                  }
                  aria-label="Previous Slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
                  aria-label="Next Slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Slide Dots */}
          {slides.length > 1 && (
            <div className="bg-slate-950/90 px-6 py-3 flex items-center justify-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-amber-400'
                      : 'w-2.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}