import { useState, useEffect } from 'react';
import { createShelf } from '../lib/api.js';

const ACCENT_COLORS = [
  '#F0EDE8', '#C0392B', '#2980B9', '#27AE60',
  '#F39C12', '#8E44AD', '#16A085', '#D35400',
];

export default function CreateShelfModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#F0EDE8');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Shelf name is required'); return; }
    setLoading(true);
    try {
      const shelf = await createShelf({ name: name.trim(), description: description.trim(), accentColor });
      onCreated(shelf);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shelf');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono-body text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              New Collection
            </p>
            <h2 className="font-display text-3xl mt-1" style={{ color: 'var(--text)', fontWeight: 500 }}>
              Create Shelf
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-mono-body text-xs"
            style={{ color: 'var(--muted)', marginTop: '4px' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--muted)' }}>
              Name
            </label>
            <input
              className="raptor-input"
              placeholder="e.g. Architecture Talks"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--muted)' }}>
              Description <span style={{ color: 'var(--dim)' }}>(optional)</span>
            </label>
            <input
              className="raptor-input"
              placeholder="What's this shelf about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="font-mono-body text-xs tracking-widest uppercase block mb-3" style={{ color: 'var(--muted)' }}>
              Accent Color
            </label>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-dot ${accentColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setAccentColor(color)}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="font-mono-body text-xs" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          <hr className="geo-line" style={{ margin: '4px 0' }} />

          <div className="flex gap-3 justify-end">
            <button type="button" className="raptor-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="raptor-btn primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
