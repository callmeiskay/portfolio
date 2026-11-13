// Phát video gốc từ Google Drive ngay trong trang (thẻ <video>), hỗ trợ tua và xem trên iPhone.
// Địa chỉ: /api/video?id=ID_FILE   (file phải chia sẻ "Bất kỳ ai có đường liên kết")
// Dùng khóa DRIVE_API_KEY có sẵn trong Cloudflare Pages.

const FILE_ID = /^[A-Za-z0-9_-]{10,100}$/;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!FILE_ID.test(id)) return new Response('Mã file không hợp lệ.', { status: 400 });
  if (!env.DRIVE_API_KEY) return new Response('Thiếu biến DRIVE_API_KEY.', { status: 500 });

  // Chỉ phục vụ cho chính trang web này, tránh bị trang khác nhúng video để dùng ké băng thông
  const ref = request.headers.get('Referer');
  if (ref) {
    let host = '';
    try { host = new URL(ref).host; } catch { /* bỏ qua */ }
    if (host && host !== url.host) return new Response('Không được phép.', { status: 403 });
  }

  const headers = new Headers();
  const range = request.headers.get('Range');
  if (range) headers.set('Range', range);

  const upstream = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${env.DRIVE_API_KEY}`,
    { headers }
  );
  if (!upstream.ok) {
    return new Response('Không đọc được video từ Google Drive.', { status: upstream.status === 404 ? 404 : 502 });
  }

  const out = new Headers();
  for (const h of ['content-length', 'content-range', 'etag', 'last-modified']) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  let type = upstream.headers.get('content-type') || '';
  if (!type.startsWith('video/')) type = 'video/mp4';
  out.set('Content-Type', type);
  out.set('Accept-Ranges', 'bytes');
  out.set('Cache-Control', 'public, max-age=3600');
  return new Response(upstream.body, { status: upstream.status, headers: out });
}
