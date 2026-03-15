import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import ShelfRow from '../components/ShelfRow.jsx';
import CreateShelfModal from '../components/CreateShelfModal.jsx';
import { getShelves, getShelf } from '../lib/api.js';

export default function Home() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateShelf, setShowCreateShelf] = useState(false);

  useEffect(() => {
    loadShelves();
  }, []);

  const loadShelves = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getShelves();
      setShelves(data.map(s => ({ ...s, videos: [] })));
    } catch {
      setError('Failed to load library. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleShelfCreated = (shelf) => {
    setShelves(prev => [...prev, { ...shelf, videos: [], videoCount: 0 }]);
  };

  const handleShelfDeleted = (shelfId) => {
    setShelves(prev => prev.filter(s => s._id !== shelfId));
  };

  const totalVideos = shelves.reduce((acc, s) => acc + (s.videoCount || 0), 0);

  return (
    <>
      <Navbar
        shelves={shelves}
        onShelfCreated={handleShelfCreated}
        onVideoAdded={() => {}}
      />

      <main>
        {/* Hero */}
        <section
          className="relative px-8 pt-20 pb-16 overflow-hidden"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, var(--line) 1px, transparent 1px),
                linear-gradient(to bottom, var(--line) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              opacity: 0.4,
            }}
          />

          <div
            className="absolute right-8 bottom-4 font-display select-none pointer-events-none"
            style={{
              fontSize: 'clamp(100px, 20vw, 280px)',
              color: 'transparent',
              WebkitTextStroke: '1px var(--line)',
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: '-0.05em',
            }}
          >
            {String(shelves.length).padStart(2, '0')}
          </div>

          <div className="relative max-w-2xl">
            <div className="stagger-item" style={{ animationDelay: '0s' }}>
              <p className="font-mono-body text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--muted)', letterSpacing: '0.2em' }}>
                Your Video Library
              </p>
            </div>
            <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(48px, 8vw, 96px)',
                  lineHeight: 0.9,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                  marginBottom: '24px',
                }}
              >
                Every video,<br />
                <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>on a shelf.</em>
              </h1>
            </div>
            <div className="stagger-item flex items-center gap-8" style={{ animationDelay: '0.2s' }}>
              <div>
                <p className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>shelves</p>
                <p className="font-display text-3xl" style={{ color: 'var(--text)', fontWeight: 500 }}>{shelves.length}</p>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />
              <div>
                <p className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>videos saved</p>
                <p className="font-display text-3xl" style={{ color: 'var(--text)', fontWeight: 500 }}>{totalVideos}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Library */}
        <section className="pt-12 pb-24">
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="loading-dots"><span /><span /><span /></div>
            </div>
          )}

          {error && (
            <div className="px-8 py-12 text-center">
              <p className="font-mono-body text-sm" style={{ color: 'var(--red)' }}>{error}</p>
              <button className="raptor-btn mt-4" onClick={loadShelves}>Retry</button>
            </div>
          )}

          {!loading && !error && shelves.length === 0 && (
            <EmptyState onCreateShelf={() => setShowCreateShelf(true)} />
          )}

          {!loading && !error && shelves.map((shelf, i) => (
            <ShelfRowLoader
              key={shelf._id}
              shelf={shelf}
              shelves={shelves}
              index={i}
              onShelfDeleted={handleShelfDeleted}
            />
          ))}
        </section>
      </main>

      {showCreateShelf && (
        <CreateShelfModal
          onClose={() => setShowCreateShelf(false)}
          onCreated={(shelf) => {
            handleShelfCreated(shelf);
            setShowCreateShelf(false);
          }}
        />
      )}
    </>
  );
}

function ShelfRowLoader({ shelf, shelves, index, onShelfDeleted }) {
  const [shelfWithVideos, setShelfWithVideos] = useState(shelf);

  useEffect(() => {
    getShelf(shelf._id).then(data => {
      setShelfWithVideos(data);
    }).catch(() => {});
  }, [shelf._id]);

  return (
    <ShelfRow
      shelf={shelfWithVideos}
      shelves={shelves}
      index={index}
      onVideoAdded={() => {}}
      onVideoDeleted={() => {}}
      onShelfDeleted={onShelfDeleted}
    />
  );
}

function EmptyState({ onCreateShelf }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-8">
      <div className="mb-10">
        <svg width="160" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="64" width="160" height="6" fill="var(--dim)" />
          <rect x="0" y="63" width="160" height="1" fill="var(--muted)" />
          {[8, 28, 44, 62, 82, 100, 116, 136].map((x, i) => (
            <rect key={i} x={x} y={20 + (i % 3) * 6} width={14} height={44 - (i % 3) * 6}
              fill="var(--surface)" stroke="var(--line)" strokeWidth="1" />
          ))}
        </svg>
      </div>
      <p className="font-mono-body text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)', letterSpacing: '0.2em' }}>
        Empty Library
      </p>
      <h2 className="font-display text-4xl mb-4" style={{ color: 'var(--text)', fontWeight: 500 }}>
        No shelves yet
      </h2>
      <p className="font-mono-body text-sm mb-8 text-center max-w-xs" style={{ color: 'var(--muted)' }}>
        Create your first shelf to start organizing YouTube videos into your personal library.
      </p>
      <button className="raptor-btn primary" onClick={onCreateShelf}>
        Create First Shelf
      </button>
    </div>
  );
}
