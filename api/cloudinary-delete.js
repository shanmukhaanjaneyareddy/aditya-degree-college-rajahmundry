import crypto from 'node:crypto';
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

function extractCloudinaryPublicId(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin session.' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary server credentials are missing.' });
  }

  const { url } = req.body || {};
  const publicId = typeof url === 'string' ? extractCloudinaryPublicId(url) : '';
  if (!publicId) {
    return res.status(400).json({ error: 'Valid Cloudinary URL is required.' });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error?.message || 'Cloudinary delete failed.');
    }

    return res.status(200).json({ deleted: true, result });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete image.' });
  }
}