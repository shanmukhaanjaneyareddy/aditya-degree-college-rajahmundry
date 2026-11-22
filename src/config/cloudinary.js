import { supabase, isSupabaseConfigured } from './firebase';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function getAdminAccessToken() {
  if (!isSupabaseConfigured || !supabase) return '';
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || '';
}

export async function uploadMediaToCloud(file, resourceType = 'auto', videoTarget = 'youtube') {
  const isVideo =
    resourceType === 'video' || (file?.type && file.type.startsWith('video/'));

  // 1. Route all images to Cloudinary
  if (!isVideo) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      throw new Error(data?.error?.message || 'Failed to upload image to Cloudinary.');
    }

    return data.secure_url;
  }

  // 2. Route Drone Video to Supabase Storage (works with existing Home.jsx <video>)
  if (videoTarget === 'supabase') {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
      );
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `videos/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}_${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('college-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from('college-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // 3. Route all other videos directly to YouTube
  const token = await getAdminAccessToken();
  const initRes = await fetch('/api/youtube-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      title: file.name.replace(/\.[^/.]+$/, ''),
      mimeType: file.type || 'video/mp4',
      fileSize: file.size,
    }),
  });

  const initData = await initRes.json();
  if (!initRes.ok || !initData.uploadUrl) {
    throw new Error(initData.error || 'Failed to initialize YouTube upload.');
  }

  const uploadRes = await fetch(initData.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'video/mp4',
    },
    body: file,
  });

  const videoData = await uploadRes.json();
  if (!uploadRes.ok || !videoData.id) {
    throw new Error(videoData?.error?.message || 'YouTube video upload failed.');
  }

  return `https://youtu.be/${videoData.id}`;
}

export async function deleteMediaFromCloud(url) {
  if (!url || typeof url !== 'string') return;

  try {
    // Delete from Cloudinary if URL belongs to Cloudinary
    if (url.includes('res.cloudinary.com/')) {
      const token = await getAdminAccessToken();
      const res = await fetch('/api/cloudinary-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Cloudinary delete API failed:', res.status, body);
      }
      return;
    }

    // Fallback: Delete Supabase Storage object if URL is from Supabase
    const marker = '/storage/v1/object/public/college-media/';
    const idx = url.indexOf(marker);
    if (idx !== -1 && isSupabaseConfigured && supabase) {
      const filePath = decodeURIComponent(url.slice(idx + marker.length));
      if (filePath) {
        await supabase.storage.from('college-media').remove([filePath]);
      }
    }
  } catch (err) {
    console.error('Cloud storage cleanup failed:', err);
  }
}