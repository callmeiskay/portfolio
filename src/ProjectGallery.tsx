import React, { useEffect, useState, useCallback } from 'react';
import { X, ArrowRight, Play } from 'lucide-react';

// Chấp nhận cả link thư mục Drive lẫn mã ID trần.
export function extractDriveId(input: string): string {
  const s = (input || '').trim();
  const m = s.match(/\/folders\/([A-Za-z0-9_-]+)/) || s.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{10,100}$/.test(s) ? s : '';
}

type Photo = { id: string; name: string; kind?: 'image' | 'video'; mime?: string; processing?: boolean; w: number; h: number; thumb: string; full: string };

// Danh sách ảnh được nhớ trong tab trình duyệt: mở lại dự án là hiện ngay,
// đồng thời vẫn hỏi lại máy chủ để cập nhật nếu thư mục Drive có thay đổi.
const KEY = (id: string) => 'gallery:' + id;
function readCache(id: string): Photo[] | null {
  try {
    const raw = sessionStorage.getItem(KEY(id));
    if (!raw) return null;
    const { t, files } = JSON.parse(raw);
    // Link ảnh của Google hết hạn sau vài giờ, nên chỉ dùng bản nhớ trong 30 phút
    if (Date.now() - t > 30 * 60 * 1000 || !Array.isArray(files)) return null;
    return files;
  } catch {
    return null;
  }
}
function writeCache(id: string, files: Photo[]) {
  try {
    sessionStorage.setItem(KEY(id), JSON.stringify({ t: Date.now(), files }));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn: bỏ qua */
  }
}

function preload(src?: string) {
  if (!src) return;
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.src = src;
}

export default function ProjectGallery({ folder, isDark }: { folder: string; isDark: boolean }) {
  const id = extractDriveId(folder);
  const cached = id ? readCache(id) : null;
  const [photos, setPhotos] = useState<Photo[]>(cached || []);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(cached ? 'ok' : 'loading');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(-1);
  const [fullReady, setFullReady] = useState(false);
  const [nativeFailed, setNativeFailed] = useState(false);

  useEffect(() => {
    if (!id) {
      setState('error');
      setError('Link thư mục Drive chưa đúng.');
      return;
    }
    let dead = false;
    const hasCache = !!readCache(id);
    if (!hasCache) setState('loading');
    setOpen(-1);
    fetch('/api/gallery?folder=' + encodeURIComponent(id))
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (dead) return;
        if (!ok) throw new Error(d.error || 'Không tải được ảnh.');
        setPhotos(d.files || []);
        writeCache(id, d.files || []);
        setState('ok');
      })
      .catch((e) => {
        if (dead) return;
        if (hasCache) return; // đã có bản nhớ để hiển thị, bỏ qua lỗi mạng thoáng qua
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

  // Khi mở ảnh lớn: hiện ngay bản nhỏ (đã tải sẵn) rồi thay bằng bản lớn khi tải xong,
  // và tải trước ảnh kế tiếp để bấm chuyển ảnh không phải chờ.
  useEffect(() => {
    if (open < 0) return;
    setFullReady(false);
    setNativeFailed(false);
    const n = photos.length;
    const nextImg = photos[(open + 1) % n];
    const prevImg = photos[(open - 1 + n) % n];
    if (nextImg?.kind !== 'video') preload(nextImg?.full);
    if (prevImg?.kind !== 'video') preload(prevImg?.full);
  }, [open, photos]);

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
  const cur = open >= 0 ? photos[open] : null;

  return (
    <section className="space-y-4" aria-label="Ảnh của dự án">
      <div className={`font-mono text-xs uppercase flex justify-between ${muted}`}>
        <span>Gallery</span>
        {state === 'ok' && <span>{photos.length} {photos.some((p) => p.kind === 'video') ? 'ảnh & video' : 'ảnh'}</span>}
      </div>

      {state === 'loading' && (
        <div className="columns-2 sm:columns-3 gap-2 [&>div]:mb-2" aria-busy="true">
          {[0.75, 1.3, 1, 1.4, 0.8, 1.1].map((r, i) => (
            <div key={i} className={`${isDark ? 'bg-white/5' : 'bg-black/5'} animate-pulse`} style={{ aspectRatio: String(1 / r) }} />
          ))}
        </div>
      )}

      {state === 'error' && <p className={`text-sm border ${border} p-4 ${muted}`}>{error}</p>}

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
              className={`relative block w-full mb-2 overflow-hidden group focus-visible:outline focus-visible:outline-2 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
              style={
                p.w && p.h
                  ? { aspectRatio: `${p.w} / ${p.h}` }
                  : p.kind === 'video'
                    ? { aspectRatio: '16 / 9' }
                    : undefined
              }
              aria-label={(p.kind === 'video' ? 'Phát video ' : 'Xem lớn ') + p.name}
            >
              {p.thumb && (
                <img
                  src={p.thumb}
                  alt={p.name}
                  // 6 ảnh đầu tải ngay, các ảnh còn lại tải khi cuộn tới
                  loading={i < 6 ? 'eager' : 'lazy'}
                  fetchPriority={i < 3 ? 'high' : 'auto'}
                  decoding="async"
                  width={p.w || undefined}
                  height={p.h || undefined}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )}
              {p.kind === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <Play size={20} fill="currentColor" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {cur && (
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
            className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-3 z-10"
            aria-label="Ảnh trước"
          >
            <ArrowRight size={24} className="rotate-180" />
          </button>

          {cur.kind === 'video' ? (
            <div className="w-full max-w-5xl flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {nativeFailed ? (
                // Trình phát nhúng của Drive (dự phòng). Khung cao để video dọc hiện đủ hình.
                <div className="w-full h-[78vh] bg-black">
                  <iframe
                    key={cur.id}
                    src={`https://drive.google.com/file/d/${cur.id}/preview`}
                    title={cur.name}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Phát thẳng file gốc: video dọc hay ngang đều hiện đủ khung, chạy tốt trên iPhone
                <video
                  key={cur.id}
                  src={`/api/video?id=${cur.id}`}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setNativeFailed(true)}
                  className="w-full max-h-[78vh] bg-black object-contain"
                />
              )}
              <div className="text-xs text-white/70 text-center px-4 space-y-1">
                {(cur.processing || (cur.mime && cur.mime !== 'video/mp4')) && (
                  <p>
                    {cur.processing
                      ? 'Google có thể đang xử lý video này, thử lại sau vài phút. '
                      : 'Định dạng video này có thể không phát được. '}
                    Nếu không xem được, xuất lại thành MP4 (H.264).
                  </p>
                )}
                <p>
                  <button
                    type="button"
                    onClick={() => setNativeFailed((v) => !v)}
                    className="underline"
                  >
                    {nativeFailed ? 'Dùng trình phát gốc' : 'Hình đen hoặc lỗi? Dùng trình phát Drive'}
                  </button>
                  {' · '}
                  <a
                    href={`https://drive.google.com/file/d/${cur.id}/view`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Mở trong Google Drive ↗
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="relative max-w-full max-h-[88vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* Bản nhỏ đã có sẵn trong bộ nhớ nên hiện ngay, bản lớn phủ lên khi tải xong */}
              <img
                src={cur.thumb}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[88vh] object-contain"
                style={{ filter: fullReady ? 'none' : 'blur(1px)' }}
              />
              <img
                key={cur.id}
                src={cur.full}
                alt={cur.name}
                referrerPolicy="no-referrer"
                decoding="async"
                onLoad={() => setFullReady(true)}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
                style={{ opacity: fullReady ? 1 : 0 }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-3 z-10"
            aria-label="Ảnh sau"
          >
            <ArrowRight size={24} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-white/60">
            {cur.name} · {open + 1}/{photos.length}
          </div>
        </div>
      )}
    </section>
  );
}
