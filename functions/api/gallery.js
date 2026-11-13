// Trả về danh sách ảnh trong một thư mục Google Drive (đã chia sẻ "Bất kỳ ai có đường liên kết").
// Địa chỉ: /api/gallery?folder=ID_THU_MUC
// Cần biến bí mật DRIVE_API_KEY trong Cloudflare Pages (Settings > Variables and Secrets).

const FOLDER_ID = /^[A-Za-z0-9_-]{10,100}$/;
const MAX_PAGES = 5; // tối đa 5 x 1000 ảnh mỗi thư mục

function json(body, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache
    }
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.DRIVE_API_KEY) {
    return json({ error: 'Thiếu biến DRIVE_API_KEY trong Cloudflare Pages.' }, 500);
  }

  const folder = new URL(request.url).searchParams.get('folder') || '';
  if (!FOLDER_ID.test(folder)) {
    return json({ error: 'Mã thư mục không hợp lệ.' }, 400);
  }

  // Cache 5 phút trên Cloudflare để không gọi Google liên tục
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).origin + '/api/gallery?folder=' + folder);
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const files = [];
  let pageToken = '';

  for (let i = 0; i < MAX_PAGES; i++) {
    const u = new URL('https://www.googleapis.com/drive/v3/files');
    u.searchParams.set('q', `'${folder}' in parents and mimeType contains 'image/' and trashed = false`);
    u.searchParams.set('fields', 'nextPageToken,files(id,name,thumbnailLink,imageMediaMetadata(width,height))');
    u.searchParams.set('orderBy', 'name_natural');
    u.searchParams.set('pageSize', '1000');
    u.searchParams.set('key', env.DRIVE_API_KEY);
    if (pageToken) u.searchParams.set('pageToken', pageToken);

    const res = await fetch(u.toString());
    if (!res.ok) {
      const status = res.status === 404 || res.status === 403 ? res.status : 502;
      const msg =
        res.status === 404
          ? 'Không tìm thấy thư mục. Kiểm tra lại link và quyền chia sẻ.'
          : res.status === 403
            ? 'Google từ chối truy cập. Thư mục cần chia sẻ "Bất kỳ ai có đường liên kết" và API key phải bật Drive API.'
            : 'Không đọc được thư mục từ Google Drive.';
      return json({ error: msg }, status);
    }
    const data = await res.json();
    for (const f of data.files || []) {
      if (!f.thumbnailLink) continue; // ảnh chưa có bản xem trước thì bỏ qua
      // thumbnailLink kết thúc bằng "=s220"; đổi thành cạnh dài mong muốn
      const base = f.thumbnailLink.replace(/=s\d+$/, '');
      files.push({
        id: f.id,
        name: f.name.replace(/\.[^.]+$/, ''),
        w: f.imageMediaMetadata?.width || 0,
        h: f.imageMediaMetadata?.height || 0,
        thumb: base + '=w520',
        full: base + '=w2000'
      });
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }

  const res = json({ folder, count: files.length, files }, 200, 'public, max-age=60, s-maxage=300');
  await cache.put(cacheKey, res.clone());
  return res;
}
