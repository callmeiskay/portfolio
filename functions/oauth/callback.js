// Bước 2: GitHub gọi lại địa chỉ này (/oauth/callback) sau khi bạn bấm Authorize.
// Hàm đổi "code" lấy token rồi gửi token về cho trang /admin đang mở.
function reply(status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const safe = JSON.stringify(message).replace(/</g, '\\u003c');
  const html = `<!doctype html><html><body><script>
(function () {
  var msg = ${safe};
  function receive(e) {
    if (e.origin !== window.location.origin) return;
    window.opener.postMessage(msg, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Set-Cookie': 'oauth_state=; Path=/oauth; Max-Age=0'
    }
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const saved = (cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/) || [])[1];

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return reply('error', { message: 'Thiếu GITHUB_CLIENT_ID hoặc GITHUB_CLIENT_SECRET trong Cloudflare Pages.' });
  }
  if (!code || !state || state !== saved) {
    return reply('error', { message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Hãy đóng cửa sổ và thử lại.' });
  }

  let result;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'portfolio-decap-oauth'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    result = await res.json();
  } catch (err) {
    return reply('error', { message: 'Không kết nối được tới GitHub.' });
  }

  if (!result || !result.access_token) {
    return reply('error', { message: (result && (result.error_description || result.error)) || 'GitHub không trả về token.' });
  }
  return reply('success', { token: result.access_token, provider: 'github' });
}
