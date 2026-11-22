export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return '';
  const match = url.trim().match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

export function isYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url));
}

export function getYouTubeThumbnailUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

export function getYouTubeEmbedUrl(url, autoplay = true) {
  const id = extractYouTubeId(url);
  if (!id) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}