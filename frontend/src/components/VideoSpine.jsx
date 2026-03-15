import { useState } from 'react';
import VideoPlayer from './VideoPlayer.jsx';

export default function VideoSpine({ video, accentColor, index, onDelete }) {
  const [playing, setPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const spineColor = accentColor || '#F0EDE8';

  return (
    <>
      <div
        className="book-spine group"
        style={{
          background: 'var(--surface)',
          borderLeft: `3px solid ${spineColor}`,
        }}
        title={video.title}
      >
        {/* Spine view — title rotated vertically */}
        <div className="spine-text">
          <span
            className="font-display text-sm select-none"
            style={{
              color: 'var(--text)',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              maxHeight: '160px',
              overflow: 'hidden',
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'horizontal',
            }}
          >
            {video.title}
          </span>
        </div>

        {/* Expanded card view */}
        <div className="spine-card flex flex-col h-full">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0" style={{ height: '112px', overflow: 'hidden' }}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              draggable="false"
            />
            {/* Play overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              style={{ background: 'rgba(8,8,8,0.65)' }}
              onClick={() => setPlaying(true)}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13.5" stroke="var(--text)" strokeWidth="1" />
                <polygon points="11,9 21,14 11,19" fill="var(--text)" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div
            className="flex-1 flex flex-col justify-between p-2"
            style={{ overflow: 'hidden' }}
          >
            <div>
              <p
                className="font-display text-sm leading-tight"
                style={{
                  color: 'var(--text)',
                  fontWeight: 500,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {video.title}
              </p>
              <p className="font-mono-body text-xs mt-1 truncate" style={{ color: 'var(--muted)' }}>
                {video.channelName}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-2">
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
                <div className="flex gap-1">
                  <button
                    className="font-mono-body text-xs"
                    style={{ color: 'var(--red)' }}
                    onClick={() => onDelete(video._id)}
                  >
                    yes
                  </button>
                  <span className="font-mono-body text-xs" style={{ color: 'var(--muted)' }}>/</span>
                  <button
                    className="font-mono-body text-xs"
                    style={{ color: 'var(--muted)' }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    no
                  </button>
                </div>
              ) : (
                <button
                  className="font-mono-body text-xs transition-colors"
                  style={{ color: 'var(--dim)' }}
                  onClick={() => setConfirmDelete(true)}
                  onMouseEnter={e => e.target.style.color = 'var(--red)'}
                  onMouseLeave={e => { setConfirmDelete(false); e.target.style.color = 'var(--dim)'; }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '2px', background: spineColor, opacity: 0.6 }}
        />
      </div>

      {/* Video Player Modal */}
      {playing && (
        <VideoPlayer video={video} onClose={() => setPlaying(false)} />
      )}
    </>
  );
}
