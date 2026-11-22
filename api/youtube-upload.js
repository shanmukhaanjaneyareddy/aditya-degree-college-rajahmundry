import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'adityaadmin@aditya.ac.in';

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return false;

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return false;

  return data.user.email?.toLowerCase() === ADMIN_EMAIL;
}

async function getYouTubeAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'Failed to get YouTube access token.');
  }
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin session.' });
  }

  if (
    !process.env.YOUTUBE_CLIENT_ID ||
    !process.env.YOUTUBE_CLIENT_SECRET ||
    !process.env.YOUTUBE_REFRESH_TOKEN
  ) {
    return res.status(500).json({ error: 'YouTube API credentials are missing on server.' });
  }

  try {
    const { title, description, mimeType, fileSize } = req.body || {};
    const accessToken = await getYouTubeAccessToken();

    const metadata = {
      snippet: {
        title: title || 'Aditya Degree College Rajahmundry - Campus Drone Video',
        description: description || 'Uploaded via Aditya Degree College Admin Portal',
        categoryId: '27',
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    };

    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType || 'video/mp4',
          ...(fileSize ? { 'X-Upload-Content-Length': String(fileSize) } : {}),
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`YouTube upload init failed: ${errText}`);
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      throw new Error('YouTube did not return a resumable upload URL.');
    }

    return res.status(200).json({ uploadUrl });
  } catch (err) {
    console.error('YouTube upload init error:', err);
    return res.status(500).json({ error: err.message || 'Failed to initialize YouTube upload.' });
  }
}