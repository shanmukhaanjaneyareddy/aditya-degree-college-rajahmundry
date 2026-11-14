import { supabase, isSupabaseConfigured } from './firebase';

export async function uploadMediaToCloud(file, resourceType = 'auto') {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    );
  }

  const folderPrefix = resourceType === 'video' ? 'videos' : 'images';
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folderPrefix}/${Date.now()}_${Math.random()
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