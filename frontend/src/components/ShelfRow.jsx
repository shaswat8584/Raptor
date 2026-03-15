import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoSpine from './VideoSpine.jsx';
import AddVideoModal from './AddVideoModal.jsx';
import { deleteVideo, deleteShelf } from '../lib/api.js';

export default function ShelfRow({ shelf, shelves, onVideoAdded, onVideoDeleted, onShelfDeleted, index }) {
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [confirmDeleteShelf, setConfirmDeleteShelf] = useState(false);
  const [videos, setVideos] = useState(shelf.videos || []);

  useEffect(() => {
    if (shelf.videos && shelf.videos.length > 0) {
      setVideos(shelf.videos);
    }
  }, [shelf.videos]);

  const handleDeleteVideo = async (videoId) => {
    await deleteVideo(videoId);
    setVideos(prev => prev.filter(v => v._id !== videoId));
    onVideoDeleted?.(videoId);
  };

  const handleVideoAdded = (video) => {
    if (video.shelf === shelf._id) {
      setVideos(prev => [video, ...prev]);
    }
    setShowAddVideo(false);
    onVideoAdded?.(video);
  };

  const handleDeleteShelf = async () => {
    await deleteShelf(shelf._id);
    onShelfDeleted?.(shelf._id);
  };

  const animDelay = `${index * 0.12}s`;

  return (
    <>
      <div
        className="stagger-item"
        style={{ animationDelay: animDelay, marginBottom: '48px' }}
      >
        {/* Shelf header */}
        <div className="flex items-baseline justify-between px-8 mb-4">
          <div className="flex items-baseline gap-4">
            <div
              className="w-2 h-2 flex-shrink-0"
              style={{ background: shelf.accentColor || '#F0EDE8', marginBottom: '3px' }}
            />
            <Link to={`/shelf/${shelf._id}`}>
              <h2
                className="font-display text-2xl transition-colors"
                style={{
                  color: 'var(--text)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => e.target.style.color = shelf.accentColor || 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text)'}
              >
                {shelf.name}
              </h2>
            </Link>
            {shelf.description && (
              <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>
                {shelf.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>
              {videos.length} {videos.length === 1 ? 'title' : 'titles'}
            </span>
            <button
              className="font-mono-body text-xs transition-colors"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              onClick={() => setShowAddVideo(true)}
            >
              + add
            </button>
            {confirmDeleteShelf ? (
              <div className="flex items-center gap-1">
                <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>delete shelf?</span>
                <button
                  className="font-mono-body text-xs"
                  style={{ color: 'var(--red)' }}
                  onClick={handleDeleteShelf}
                >yes</button>
                <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>/</span>
                <button
                  className="font-mono-body text-xs"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => setConfirmDeleteShelf(false)}
                >no</button>
              </div>
            ) : (
              <button
                className="font-mono-body text-xs transition-colors"
                style={{ color: 'var(--dim)' }}
                onMouseEnter={e => e.target.style.color = 'var(--red)'}
                onMouseLeave={e => { setConfirmDeleteShelf(false); e.target.style.color = 'var(--dim)'; }}
                onClick={() => setConfirmDeleteShelf(true)}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Shelf body */}
        <div
          className="relative mx-8"
          style={{
            border: '1px solid var(--line)',
            borderBottom: 'none',
            background: 'var(--surface)',
          }}
        >
          {videos.length === 0 ? (
            /* Empty shelf */
            <div
              className="flex items-center justify-center"
              style={{ height: '200px' }}
            >
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex items-center justify-center"
                  style={{ width: '40px', height: '40px', border: '1px solid var(--line)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="var(--muted)" strokeWidth="1" />
                  </svg>
                </div>
                <p className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>
                  Empty shelf
                </p>
                <button
                  className="font-mono-body text-xs mt-2 transition-colors"
                  style={{ color: 'var(--dim)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--dim)'}
                  onClick={() => setShowAddVideo(true)}
                >
                  Add a video →
                </button>
              </div>
            </div>
          ) : (
            /* Video spines */
            <div className="shelf-scroll">
              <div className="flex items-end" style={{ minHeight: '200px', padding: '16px 16px 0 16px', gap: '0' }}>
                {videos.map((video, i) => (
                  <VideoSpine
                    key={video._id}
                    video={video}
                    accentColor={shelf.accentColor}
                    index={i}
                    onDelete={handleDeleteVideo}
                  />
                ))}
                {/* Add more button at the end of spine row */}
                <div
                  className="flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                  style={{
                    width: '44px',
                    height: '180px',
                    border: '1px dashed var(--line)',
                    marginLeft: '8px',
                    color: 'var(--dim)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                  onClick={() => setShowAddVideo(true)}
                >
                  <span className="font-mono-body text-xs" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}>
                    + add
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shelf plank */}
        <div className="mx-8 shelf-plank" />
      </div>

      {showAddVideo && (
        <AddVideoModal
          shelves={shelves}
          defaultShelfId={shelf._id}
          onClose={() => setShowAddVideo(false)}
          onAdded={handleVideoAdded}
        />
      )}
    </>
  );
}
