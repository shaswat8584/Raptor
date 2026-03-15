import { useEffect } from 'react';

export default function VideoPlayer({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const dateAdded = new Date(video.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="modal-overlay items-end md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full"
        style={{
          maxWidth: '860px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-4 overflow-hidden">
            <div
              className="w-1 flex-shrink-0"
              style={{ height: '32px', background: 'var(--muted)' }}
            />
            <div className="overflow-hidden">
              <p className="font-display text-xl truncate" style={{ color: 'var(--text)', fontWeight: 500 }}>
                {video.title}
              </p>
              <p className="font-mono-body text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {video.channelName} · Added {dateAdded}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 font-mono-body text-xs ml-4 transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >
            ✕ close
          </button>
        </div>

        {/* Video */}
        <div className="video-player-wrapper">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        {/* Footer */}
        {video.notes && (
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid var(--line)' }}
          >
            <span className="font-mono-body text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              Notes —&nbsp;
            </span>
            <span className="font-mono-body text-xs" style={{ color: 'var(--text)' }}>
              {video.notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
