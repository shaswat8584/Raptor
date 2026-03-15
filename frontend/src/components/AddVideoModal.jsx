import { useState, useEffect } from 'react';
import { addVideo, fetchYouTubeMeta, extractYouTubeId, getYouTubeThumbnail } from '../lib/api.js';

export default function AddVideoModal({ shelves, onClose, onAdded, defaultShelfId }) {
  const [url, setUrl] = useState('');
  const [shelfId, setShelfId] = useState(defaultShelfId || shelves[0]?._id || '');
  const [notes, setNotes] = useState('');
  const [meta, setMeta] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleUrlBlur = async () => {
    if (!url.trim()) return;
    const id = extractYouTubeId(url.trim());
    if (!id) { setFetchError('Invalid YouTube URL'); return; }
    setFetching(true);
    setFetchError('');
    setMeta(null);
    try {
      const data = await fetchYouTubeMeta(url.trim());
      setMeta({
        youtubeId: id,
        title: data.title,
        channelName: data.author_name,
        thumbnail: getYouTubeThumbnail(id),
      });
    } catch (err) {
      setFetchError('Could not fetch video info. Check the URL and try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!meta) { setError('Please enter a valid YouTube URL first'); return; }
    if (!shelfId) { setError('Please select a shelf'); return; }
    setLoading(true);
    try {
      const video = await addVideo({ ...meta, shelf: shelfId, notes });
      onAdded(video);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '520px' }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono-body text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              Add to Collection
            </p>
            <h2 className="font-display text-3xl mt-1" style={{ color: 'var(--text)', fontWeight: 500 }}>
              Add Video
            </h2>
          </div>
          <button onClick={onClose} className="font-mono-body text-xs" style={{ color: 'var(--muted)', marginTop: '4px' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* URL Input */}
          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--muted)' }}>
              YouTube URL
            </label>
            <input
              className="raptor-input"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={e => { setUrl(e.target.value); setMeta(null); setFetchError(''); }}
              onBlur={handleUrlBlur}
              autoFocus
            />
            {fetchError && (
              <p className="font-mono-body text-xs mt-1" style={{ color: 'var(--red)' }}>{fetchError}</p>
            )}
            {fetching && (
              <div className="flex items-center gap-2 mt-2">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
                <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>Fetching video info...</span>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {meta && (
            <div
              className="flex gap-3 p-3 animate-fade-in"
              style={{ border: '1px solid var(--line)', background: 'var(--bg)' }}
            >
              <img
                src={meta.thumbnail}
                alt={meta.title}
                className="flex-shrink-0 object-cover"
                style={{ width: '80px', height: '56px' }}
              />
              <div className="overflow-hidden">
                <p className="font-display text-base truncate" style={{ color: 'var(--text)', fontWeight: 500 }}>
                  {meta.title}
                </p>
                <p className="font-mono-body text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {meta.channelName}
                </p>
              </div>
            </div>
          )}

          {/* Shelf Select */}
          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--muted)' }}>
              Shelf
            </label>
            {shelves.length === 0 ? (
              <p className="font-mono-body text-xs" style={{ color: 'var(--red)' }}>
                No shelves yet. Create a shelf first.
              </p>
            ) : (
              <select
                className="raptor-input"
                style={{ appearance: 'none', cursor: 'pointer' }}
                value={shelfId}
                onChange={e => setShelfId(e.target.value)}
              >
                {shelves.map(s => (
                  <option key={s._id} value={s._id} style={{ background: 'var(--surface)' }}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--muted)' }}>
              Notes <span style={{ color: 'var(--dim)' }}>(optional)</span>
            </label>
            <input
              className="raptor-input"
              placeholder="Why are you saving this?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="font-mono-body text-xs" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          <hr className="geo-line" style={{ margin: '4px 0' }} />

          <div className="flex gap-3 justify-end">
            <button type="button" className="raptor-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="raptor-btn primary" disabled={loading || !meta}>
              {loading ? 'Adding...' : 'Add to Shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
