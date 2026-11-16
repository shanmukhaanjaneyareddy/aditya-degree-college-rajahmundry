import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

const ADMIN_SLUG = import.meta.env.VITE_ADMIN_ROUTE_SLUG || 'aditya-admin-portal-2026';

export default function AnnouncementPopup() {
  const { data, isLoading } = useCollegeData();
  const location = useLocation();
  const popup = data.announcementPopup;

  const [dismissedKey, setDismissedKey] = useState(() => {
    try {
      return sessionStorage.getItem('aditya_popup_dismissed_key') || '';
    } catch {
      return '';
    }
  });

  const [animateIn, setAnimateIn] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isAdminRoute = location.pathname.includes(ADMIN_SLUG);
  const currentPopupKey = `${popup?.imageUrl || ''}::${popup?.updatedAt || ''}`;

  const shouldRender =
    !isLoading &&
    !isAdminRoute &&
    Boolean(popup?.isActive) &&
    Boolean(popup?.imageUrl) &&
    (dismissedKey !== currentPopupKey || isClosing);

  // Trigger smooth entrance animation once mounted
  useEffect(() => {
    if (!shouldRender || isClosing) return;
    const frame = requestAnimationFrame(() => {
      setAnimateIn(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [shouldRender, isClosing]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setAnimateIn(false);

    setTimeout(() => {
      setDismissedKey(currentPopupKey);
      setIsClosing(false);
      try {
        sessionStorage.setItem('aditya_popup_dismissed_key', currentPopupKey);
      } catch {
        // Ignore storage errors
      }
    }, 280);
  }, [currentPopupKey, isClosing]);

  useEffect(() => {
    if (!shouldRender) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shouldRender, handleClose]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        animateIn
          ? 'bg-black/75 backdrop-blur-sm opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-2xl w-auto max-h-[90vh] flex items-center justify-center transition-all duration-300 ease-out ${
          animateIn
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-slate-900 hover:bg-amber-400 hover:rotate-90 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={popup.imageUrl}
          alt=""
          className="max-h-[85vh] max-w-full w-auto h-auto rounded-2xl shadow-2xl object-contain"
        />
      </div>
    </div>
  );
}