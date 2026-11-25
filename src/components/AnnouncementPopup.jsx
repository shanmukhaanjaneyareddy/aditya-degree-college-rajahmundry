import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

export default function AnnouncementPopup() {
  const { data } = useCollegeData();
  const popup = data?.announcementPopup || {};
  const [dismissed, setDismissed] = useState(false);

  const isActive = Boolean(
    popup.enabled ?? popup.active ?? popup.isActive ?? popup.show ?? false
  );

  const imageSrc = popup.image || popup.imageUrl || popup.photo || popup.poster || '';

  useEffect(() => {
    setDismissed(false);
  }, [isActive, imageSrc]);

  if (!isActive || !imageSrc || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => setDismissed(true)}
    >
      <div
        className="relative z-[101] inline-block max-w-[92vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <img
          src={imageSrc}
          alt="Popup"
          className="block max-w-[92vw] max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}