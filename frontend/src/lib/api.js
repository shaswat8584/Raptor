import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// --- Shelves ---
export const getShelves = () => api.get('/shelves').then(r => r.data);
export const getShelf = (id) => api.get(`/shelves/${id}`).then(r => r.data);
export const createShelf = (data) => api.post('/shelves', data).then(r => r.data);
export const updateShelf = (id, data) => api.patch(`/shelves/${id}`, data).then(r => r.data);
export const deleteShelf = (id) => api.delete(`/shelves/${id}`).then(r => r.data);

// --- Videos ---
export const getVideos = (shelfId) => api.get('/videos', { params: { shelf: shelfId } }).then(r => r.data);
export const addVideo = (data) => api.post('/videos', data).then(r => r.data);
export const updateVideo = (id, data) => api.patch(`/videos/${id}`, data).then(r => r.data);
export const deleteVideo = (id) => api.delete(`/videos/${id}`).then(r => r.data);

// --- YouTube oEmbed (no API key needed) ---
export const fetchYouTubeMeta = async (url) => {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oEmbedUrl);
  if (!res.ok) throw new Error('Could not fetch video info');
  const data = await res.json();
  return data;
};

export const extractYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

export const getYouTubeThumbnail = (id) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
