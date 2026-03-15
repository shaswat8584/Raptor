import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreateShelfModal from './CreateShelfModal.jsx';
import AddVideoModal from './AddVideoModal.jsx';

export default function Navbar({ onShelfCreated, onVideoAdded, shelves = [] }) {
  const [showCreateShelf, setShowCreateShelf] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid var(--line)', background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(8px)' }}
      >
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ border: '1px solid var(--muted)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="0" y="0" width="5" height="5" fill="var(--text)" />
              <rect x="7" y="0" width="5" height="5" fill="var(--text)" />
              <rect x="0" y="7" width="5" height="5" fill="var(--muted)" />
              <rect x="7" y="7" width="5" height="5" fill="var(--muted)" />
            </svg>
          </div>
          <span
            className="font-display tracking-widest text-lg"
            style={{ color: 'var(--text)', letterSpacing: '0.3em', fontWeight: 600 }}
          >
            RAPTOR
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="font-mono-body text-xs tracking-widest uppercase transition-colors"
            style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >
            Library
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            className="raptor-btn text-xs"
            onClick={() => setShowAddVideo(true)}
          >
            + Video
          </button>
          <button
            className="raptor-btn primary text-xs"
            onClick={() => setShowCreateShelf(true)}
          >
            New Shelf
          </button>
        </div>
      </header>

      {showCreateShelf && (
        <CreateShelfModal
          onClose={() => setShowCreateShelf(false)}
          onCreated={(shelf) => {
            setShowCreateShelf(false);
            onShelfCreated?.(shelf);
          }}
        />
      )}

      {showAddVideo && (
        <AddVideoModal
          shelves={shelves}
          onClose={() => setShowAddVideo(false)}
          onAdded={(video) => {
            setShowAddVideo(false);
            onVideoAdded?.(video);
          }}
        />
      )}
    </>
  );
}
