import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import VideoSpine from '../components/VideoSpine.jsx';
import AddVideoModal from '../components/AddVideoModal.jsx';
import CreateShelfModal from '../components/CreateShelfModal.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { getShelf, getShelves, deleteVideo, deleteShelf, updateShelf } from '../lib/api.js';

export default function ShelfPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState(null);
  const [videos, setVideos] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showCreateShelf, setShowCreateShelf] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      getShelf(id),
      getShelves(),
    ]).then(([shelfData, shelvesData]) => {
      setShelf(shelfData);
      setVideos(shelfData.videos || []);
      setShelves(shelvesData.map(s => ({ ...s, videos: [] })));
      setLoading(false);
    }).catch(err => {
      setError('Failed to load shelf');
      setLoading(false);
    });
  }, [id]);

  const handleDeleteVideo = async (videoId) => {
    await deleteVideo(videoId);
    setVideos(prev => prev.filter(v => v._id !== videoId));
  };

  const handleVideoAdded = (video) => {
    if (video.shelf === id) {
      setVideos(prev => [video, ...prev]);
    }
    setShowAddVideo(false);
  };

  const handleDeleteShelf = async () => {
    await deleteShelf(id);
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Navbar shelves={[]} onShelfCreated={() => {}} onVideoAdded={() => {}} />
        <div className="flex items-center justify-center py-32">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </>
    );
  }

  if (error || !shelf) {
    return (
      <>
        <Navbar shelves={[]} onShelfCreated={() => {}} onVideoAdded={() => {}} />
        <div className="px-8 py-16 text-center">
          <p className="font-mono-body text-sm" style={{ color: 'var(--red)' }}>
            {error || 'Shelf not found'}
          </p>
          <Link to="/" className="raptor-btn inline-block mt-4">← Back to Library</Link>
        </div>
      </>
    );
  }

  const accentColor = shelf.accentColor || '#F0EDE8';

  return (
    <>
      <Navbar
        shelves={shelves}
        onShelfCreated={(s) => setShelves(prev => [...prev, s])}
        onVideoAdded={handleVideoAdded}
      />

      <main>
        {/* Shelf header */}
        <section
          className="relative px-8 pt-16 pb-12 overflow-hidden"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          {/* Accent stripe */}
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{ width: '3px', background: accentColor }}
          />

          {/* Grid bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
              opacity: 0.3,
            }}
          />

          <div className="relative">
            <Link
              to="/"
              className="font-mono-body text-xs tracking-widest uppercase inline-flex items-center gap-1 mb-6 transition-colors"
              style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              ← Library
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="font-display"
                  style={{
                    fontSize: 'clamp(36px, 6vw, 72px)',
                    lineHeight: 0.95,
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    color: 'var(--text)',
                  }}
                >
                  {shelf.name}
                </h1>
                {shelf.description && (
                  <p className="font-mono-body text-sm mt-3" style={{ color: 'var(--muted)' }}>
                    {shelf.description}
                  </p>
                )}
                <p className="font-mono-body text-xs mt-4" style={{ color: 'var(--muted)' }}>
                  {videos.length} {videos.length === 1 ? 'title' : 'titles'}
                  &emsp;·&emsp;
                  <span style={{ color: 'var(--dim)' }}>
                    Created {new Date(shelf.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  className="raptor-btn text-xs"
                  onClick={() => setShowAddVideo(true)}
                >
                  + Add Video
                </button>
                {confirmDelete ? (
                  <div className="flex gap-2 items-center">
                    <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>Delete shelf?</span>
                    <button className="raptor-btn danger text-xs" onClick={handleDeleteShelf}>Yes, delete</button>
                    <button className="raptor-btn text-xs" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                ) : (
                  <button
                    className="raptor-btn danger text-xs"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete Shelf
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className="py-12">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="font-mono-body text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                Empty Shelf
              </p>
              <p className="font-display text-3xl mb-6" style={{ color: 'var(--text)', fontWeight: 500 }}>
                No videos here yet
              </p>
              <button className="raptor-btn primary" onClick={() => setShowAddVideo(true)}>
                Add First Video
              </button>
            </div>
          ) : (
            <>
              {/* Shelf view */}
              <div className="mx-8" style={{ border: '1px solid var(--line)', borderBottom: 'none', background: 'var(--surface)' }}>
                <div className="shelf-scroll">
                  <div className="flex items-end" style={{ minHeight: '220px', padding: '24px 24px 0 24px', gap: '0' }}>
                    {videos.map((video, i) => (
                      <VideoSpine
                        key={video._id}
                        video={video}
                        accentColor={accentColor}
                        index={i}
                        onDelete={handleDeleteVideo}
                      />
                    ))}
                    <div
                      className="flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                      style={{ width: '44px', height: '196px', border: '1px dashed var(--line)', marginLeft: '8px', color: 'var(--dim)' }}
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
              </div>
              <div className="mx-8 shelf-plank" />

              {/* Grid view below */}
              <div className="px-8 mt-16">
                <p className="font-mono-body text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}>
                  All Titles — {videos.length}
                </p>
                <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', background: 'var(--line)' }}>
                  {videos.map((video, i) => (
                    <VideoGridCard
                      key={video._id}
                      video={video}
                      accentColor={accentColor}
                      index={i}
                      onDelete={handleDeleteVideo}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {showAddVideo && (
        <AddVideoModal
          shelves={shelves.length > 0 ? shelves : [shelf]}
          defaultShelfId={id}
          onClose={() => setShowAddVideo(false)}
          onAdded={handleVideoAdded}
        />
      )}
    </>
  );
}

function VideoGridCard({ video, accentColor, index, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const animDelay = `${index * 0.05}s`;

  return (
    <>
      <div
        className="stagger-item group relative"
        style={{
          background: 'var(--surface)',
          animationDelay: animDelay,
        }}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%', background: '#000' }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable="false"
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ background: 'rgba(8,8,8,0.7)' }}
            onClick={() => setPlaying(true)}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="21.5" stroke="var(--text)" strokeWidth="1" />
              <polygon points="18,14 34,22 18,30" fill="var(--text)" />
            </svg>
          </div>
          {/* Accent top line */}
          <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: accentColor }} />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3
            className="font-display text-lg leading-snug"
            style={{
              color: 'var(--text)',
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {video.title}
          </h3>
          <p className="font-mono-body text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {video.channelName}
          </p>
          {video.notes && (
            <p className="font-mono-body text-xs mt-2 truncate" style={{ color: 'var(--dim)' }}>
              "{video.notes}"
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <button
              className="font-mono-body text-xs transition-colors"
              style={{ color: 'var(--muted)' }}
              onClick={() => setPlaying(true)}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              ▷ play
            </button>
            {confirmDelete ? (
              <div className="flex gap-1 items-center">
                <button onClick={() => onDelete(video._id)} className="font-mono-body text-xs" style={{ color: 'var(--red)' }}>remove</button>
                <span className="font-mono-body text-xs" style={{ color: 'var(--dim)' }}>/</span>
                <button onClick={() => setConfirmDelete(false)} className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>cancel</button>
              </div>
            ) : (
              <button
                className="font-mono-body text-xs transition-colors"
                style={{ color: 'var(--dim)' }}
                onMouseEnter={e => e.target.style.color = 'var(--red)'}
                onMouseLeave={e => { e.target.style.color = 'var(--dim)'; }}
                onClick={() => setConfirmDelete(true)}
              >
                × remove
              </button>
            )}
          </div>
        </div>
      </div>

      {playing && <VideoPlayer video={video} onClose={() => setPlaying(false)} />}
    </>
  );
}
