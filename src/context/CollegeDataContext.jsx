import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../config/firebase';

const CollegeDataContext = createContext(null);

const CACHE_KEY = 'aditya_supabase_portal_cache_v2';

const DEFAULT_DATA = {
  droneVideo: {
    url: '',
    title: 'Welcome to Aditya Degree College',
    subtitle: 'Empowering Future Innovators & Leaders through Excellence in Education',
  },
  announcementPopup: {
    imageUrl: '',
    isActive: true,
    updatedAt: '',
  },
  topPackagesConfig: {
    mode: 'all_time', // 'all_time' | 'academic_year'
    selectedAcademicYear: '2025-2026',
  },
  management: [
    { id: 'mgmt-1', role: 'Chairman', name: 'Dr. N. Sesha Reddy', qualification: '', message: '', photo: '' },
    { id: 'mgmt-2', role: 'Secretary', name: 'Sri N. Krishna Deepak Reddy', qualification: '', message: '', photo: '' },
    { id: 'mgmt-3', role: 'Director', name: 'Smt. N. Suguna Reddy', qualification: '', message: '', photo: '' },
    { id: 'mgmt-4', role: 'Academic Director', name: 'Dr. B. E. V. L. Naidu', qualification: '', message: '', photo: '' },
    { id: 'mgmt-5', role: 'Principal', name: 'Dr. B. E. V. L. Naidu', qualification: '', message: '', photo: '' },
    { id: 'mgmt-6', role: 'Vice Principal', name: 'Vice Principal', qualification: '', message: '', photo: '' },
  ],
  academicYears: ['2025-2026', '2024-2025', '2023-2024'],
  placementYears: ['2026', '2025', '2024'],
  folders: [],
  mediaItems: [],
  placements: [],
};

const mergeWithDefaults = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULT_DATA;
  return {
    ...DEFAULT_DATA,
    ...raw,
    droneVideo: {
      ...DEFAULT_DATA.droneVideo,
      ...(raw.droneVideo || {}),
      url: raw.droneVideo?.url || raw.droneVideoUrl || '',
    },
    announcementPopup: {
      ...DEFAULT_DATA.announcementPopup,
      ...(raw.announcementPopup || {}),
    },
    topPackagesConfig: {
      ...DEFAULT_DATA.topPackagesConfig,
      ...(raw.topPackagesConfig || {}),
    },
    management: Array.isArray(raw.management)
      ? raw.management
      : DEFAULT_DATA.management,
    academicYears: Array.isArray(raw.academicYears)
      ? raw.academicYears
      : DEFAULT_DATA.academicYears,
    placementYears: Array.isArray(raw.placementYears)
      ? raw.placementYears
      : DEFAULT_DATA.placementYears,
    folders: Array.isArray(raw.folders) ? raw.folders : [],
    mediaItems: Array.isArray(raw.mediaItems) ? raw.mediaItems : [],
    placements: Array.isArray(raw.placements) ? raw.placements : [],
  };
};

export const CollegeDataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? mergeWithDefaults(JSON.parse(cached)) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });

  const dataRef = useRef(data);
  dataRef.current = data;

  const saveQueueRef = useRef(Promise.resolve());
  const pendingWritesRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);

  const fetchPortalData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: row, error } = await supabase
        .from('college_portal_state')
        .select('data')
        .eq('id', 1)
        .single();

      if (!error && row?.data && pendingWritesRef.current === 0) {
        const merged = mergeWithDefaults(row.data);
        dataRef.current = merged;
        setData(merged);
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      }
    } catch (err) {
      console.error('Error fetching college data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();

    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('college_portal_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'college_portal_state',
          filter: 'id=eq.1',
        },
        (payload) => {
          if (pendingWritesRef.current > 0) return;

          if (payload.new?.data) {
            const updated = mergeWithDefaults(payload.new.data);
            dataRef.current = updated;
            setData(updated);
            localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
          }
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingWritesRef.current === 0) {
        fetchPortalData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPortalData]);

  const persistNextData = useCallback((updater) => {
    const prev = dataRef.current;
    const computedNext = mergeWithDefaults(
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );

    dataRef.current = computedNext;
    setData(computedNext);

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(computedNext));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }

    if (!isSupabaseConfigured || !supabase) return Promise.resolve();

    pendingWritesRef.current += 1;

    const task = saveQueueRef.current
      .catch(() => {})
      .then(async () => {
        try {
          const { error } = await supabase
            .from('college_portal_state')
            .upsert({
              id: 1,
              data: dataRef.current,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Failed to sync changes to Supabase:', error);
            throw error;
          }
        } finally {
          pendingWritesRef.current = Math.max(0, pendingWritesRef.current - 1);
        }
      });

    saveQueueRef.current = task;
    return task;
  }, []);

  // 1. Drone Video, Announcement Popup & Home Config
  const updateDroneVideo = (droneVideoUpdates) =>
    persistNextData((prev) => ({
      ...prev,
      droneVideo: { ...prev.droneVideo, ...droneVideoUpdates },
    }));

  const updateAnnouncementPopup = (popupUpdates) =>
    persistNextData((prev) => ({
      ...prev,
      announcementPopup: {
        ...prev.announcementPopup,
        ...popupUpdates,
        updatedAt: new Date().toISOString(),
      },
    }));

  const updateTopPackagesConfig = (configUpdates) =>
    persistNextData((prev) => ({
      ...prev,
      topPackagesConfig: { ...prev.topPackagesConfig, ...configUpdates },
    }));

  // 2. Management
  const updateManagementMember = (id, updates) =>
    persistNextData((prev) => ({
      ...prev,
      management: prev.management.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));

  const addManagementMember = (member) => {
    const newMember = {
      id: `mgmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: member.role?.trim() || 'Leadership Member',
      name: member.name?.trim() || '',
      qualification: member.qualification?.trim() || '',
      message: member.message?.trim() || '',
      photo: member.photo || '',
    };
    return persistNextData((prev) => ({
      ...prev,
      management: [...prev.management, newMember],
    }));
  };

  const deleteManagementMember = (id) =>
    persistNextData((prev) => ({
      ...prev,
      management: prev.management.filter((m) => m.id !== id),
    }));

  // 3. Academic Years
  const addAcademicYear = (year) => {
    const trimmed = year.trim();
    if (!trimmed) return;
    return persistNextData((prev) => ({
      ...prev,
      academicYears: prev.academicYears.includes(trimmed)
        ? prev.academicYears
        : [trimmed, ...prev.academicYears],
    }));
  };

  const editAcademicYear = (oldYear, newYear) => {
    const trimmed = newYear.trim();
    if (!trimmed) return;
    return persistNextData((prev) => ({
      ...prev,
      academicYears: prev.academicYears.map((y) => (y === oldYear ? trimmed : y)),
      folders: prev.folders.map((f) =>
        f.academicYear === oldYear ? { ...f, academicYear: trimmed } : f
      ),
      placements: prev.placements.map((p) =>
        p.academicYear === oldYear ? { ...p, academicYear: trimmed } : p
      ),
    }));
  };

  const deleteAcademicYear = (year) =>
    persistNextData((prev) => ({
      ...prev,
      academicYears: prev.academicYears.filter((y) => y !== year),
    }));

  // 4. Folders & Media Items
  const addFolder = (folderObj) => {
    const newFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...folderObj,
    };
    return persistNextData((prev) => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }));
  };

  const deleteFolder = (folderId) =>
    persistNextData((prev) => {
      const idsToDelete = new Set([folderId]);
      let added = true;
      while (added) {
        added = false;
        for (const f of prev.folders) {
          if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
            idsToDelete.add(f.id);
            added = true;
          }
        }
      }
      return {
        ...prev,
        folders: prev.folders.filter((f) => !idsToDelete.has(f.id)),
        mediaItems: prev.mediaItems.filter((m) => !idsToDelete.has(m.folderId)),
      };
    });

  const addMediaItems = (items) => {
    const stamped = items.map((item, idx) => ({
      id: `media-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      uploadedAt: new Date().toISOString(),
      ...item,
    }));
    return persistNextData((prev) => ({
      ...prev,
      mediaItems: [...stamped, ...prev.mediaItems],
    }));
  };

  const deleteMediaItem = (mediaId) =>
    persistNextData((prev) => ({
      ...prev,
      mediaItems: prev.mediaItems.filter((m) => m.id !== mediaId),
    }));

  // 5. Placements & Placement Years
  const addPlacementYear = (year) => {
    const trimmed = year.trim();
    if (!trimmed) return;
    return persistNextData((prev) => ({
      ...prev,
      placementYears: prev.placementYears.includes(trimmed)
        ? prev.placementYears
        : [trimmed, ...prev.placementYears],
    }));
  };

  const editPlacementYear = (oldYear, newYear) => {
    const trimmed = newYear.trim();
    if (!trimmed) return;
    return persistNextData((prev) => ({
      ...prev,
      placementYears: prev.placementYears.map((y) => (y === oldYear ? trimmed : y)),
      placements: prev.placements.map((p) =>
        p.placementYear === oldYear ? { ...p, placementYear: trimmed } : p
      ),
    }));
  };

  const deletePlacementYear = (year) =>
    persistNextData((prev) => ({
      ...prev,
      placementYears: prev.placementYears.filter((y) => y !== year),
    }));

  const addPlacementRecord = (record) => {
    const newRecord = {
      id: `plc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...record,
    };
    return persistNextData((prev) => ({
      ...prev,
      placements: [newRecord, ...prev.placements],
    }));
  };

  const updatePlacementRecord = (id, updates) =>
    persistNextData((prev) => ({
      ...prev,
      placements: prev.placements.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));

  const deletePlacementRecord = (id) =>
    persistNextData((prev) => ({
      ...prev,
      placements: prev.placements.filter((p) => p.id !== id),
    }));

  const bulkImportPlacements = (records) =>
    persistNextData((prev) => {
      const updatedPlacementYears = [...prev.placementYears];
      const updatedAcademicYears = [...prev.academicYears];
      const stampedRecords = [];

      records.forEach((rec, idx) => {
        const pYear = String(rec.placementYear || '').trim();
        const aYear = String(rec.academicYear || '').trim();

        if (pYear && !updatedPlacementYears.includes(pYear)) {
          updatedPlacementYears.unshift(pYear);
        }
        if (aYear && !updatedAcademicYears.includes(aYear)) {
          updatedAcademicYears.unshift(aYear);
        }

        stampedRecords.push({
          id: `plc-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          studentName: rec.studentName || '',
          company: rec.company || '',
          packageLpa: rec.packageLpa ?? '',
          branch: rec.branch || '',
          placementYear: pYear,
          academicYear: aYear,
          photoId: rec.photoId || '',
          photo: rec.photo || '',
        });
      });

      return {
        ...prev,
        placementYears: updatedPlacementYears,
        academicYears: updatedAcademicYears,
        placements: [...stampedRecords, ...prev.placements],
      };
    });

  return (
    <CollegeDataContext.Provider
      value={{
        data,
        isLoading,
        refreshCollegeData: fetchPortalData,
        updateDroneVideo,
        updateAnnouncementPopup,
        updateTopPackagesConfig,
        updateManagementMember,
        addManagementMember,
        deleteManagementMember,
        addAcademicYear,
        editAcademicYear,
        deleteAcademicYear,
        addFolder,
        deleteFolder,
        addMediaItems,
        deleteMediaItem,
        addPlacementYear,
        editPlacementYear,
        deletePlacementYear,
        addPlacementRecord,
        updatePlacementRecord,
        deletePlacementRecord,
        bulkImportPlacements,
      }}
    >
      {children}
    </CollegeDataContext.Provider>
  );
};

export const useCollegeData = () => {
  const ctx = useContext(CollegeDataContext);
  if (!ctx) throw new Error('useCollegeData must be used inside CollegeDataProvider');
  return ctx;
};