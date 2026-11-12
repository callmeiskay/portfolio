import React, { useEffect, useState, useCallback } from 'react';
import { X, ArrowRight } from 'lucide-react';

// Chấp nhận cả link thư mục Drive lẫn mã ID trần.
export function extractDriveId(input: string): string {
  const s = (input || '').trim();
  const m = s.match(/\/folders\/([A-Za-z0-9_-]+)/) || s.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{10,100}$/.test(s) ? s : '';
}

type Photo = { id: string; name: string; w: number; h: number; thumb: string; full: string };

export default function ProjectGallery({ folder, isDark }: { folder: string; isDark: boolean }) {
  const id = extractDriveId(folder);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(-1);

  useEffect(() => {
    if (!id) {
      setState('error');
      setError('Link thư mục Drive chưa đúng.');
      return;
    }
    let dead = false;
    setState('loading');
    setOpen(-1);
    fetch('/api/gallery?folder=' + encodeURIComponent(id))
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (dead) return;
        if (!ok) throw new Error(d.error || 'Không tải được ảnh.');
        setPhotos(d.files || []);
        setState('ok');
      })
      .catch((e) => {
        if (dead) return;
        setError(e.message || 'Không tải được ảnh.');
        setState('error');
      });
    return () => {
      dead = true;
    };
  }, [id]);

  const step = useCallback(
    (d: number) => setOpen((i) => (photos.length ? (i + d + photos.length) % photos.length : -1)),
    [photos.length]
  );

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(-1);
      }
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, step]);

  const muted = isDark ? 'text-neutral-400' : 'text-neutral-500';
  const border = isDark ? 'border-white/10' : 'border-black/10';

  return (
    <section className="space-y-4" aria-label="Ảnh của dự án">
      <div className={`font-mono text-xs uppercase flex justify-between ${muted}`}>
        <span>Gallery</span>
        {state === 'ok' && <span>{photos.length} ảnh</span>}
      </div>

      {state === 'loading' && (
        <div className="columns-2 sm:columns-3 gap-2 [&>div]:mb-2" aria-busy="true">
          {[0.75, 1.3, 1, 1.4, 0.8, 1.1].map((r, i) => (
            <div key={i} className={`${isDark ? 'bg-white/5' : 'bg-black/5'} animate-pulse`} style={{ aspectRatio: String(1 / r) }} />
          ))}
        </div>
      )}

      {state === 'error' && (
        <p className={`text-sm border ${border} p-4 ${muted}`}>{error}</p>
      )}

      {state === 'ok' && photos.length === 0 && (
        <p className={`text-sm border ${border} p-4 ${muted}`}>Thư mục này chưa có ảnh.</p>
      )}

      {state === 'ok' && photos.length > 0 && (
        <div className="columns-2 sm:columns-3 gap-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(i)}
              className="block w-full mb-2 overflow-hidden group focus-visible:outline focus-visible:outline-2"
              aria-label={'Xem lớn ' + p.name}
            >
              <img
                src={p.thumb}
                alt={p.name}
                loading="lazy"
                width={p.w || undefined}
                height={p.h || undefined}
                referrerPolicy="no-referrer"
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>
      )}

      {open >= 0 && photos[open] && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
          onClick={() => setOpen(-1)}
        >
          <button
            type="button"
            onClick={() => setOpen(-1)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-3"
            aria-label="Ảnh trước"
          >
            <ArrowRight size={24} className="rotate-180" />
          </button>
          <img
            src={photos[open].full}
            alt={photos[open].name}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-3"
            aria-label="Ảnh sau"
          >
            <ArrowRight size={24} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-white/60">
            {photos[open].name} · {open + 1}/{photos.length}
          </div>
        </div>
      )}
    </section>
  );
}
