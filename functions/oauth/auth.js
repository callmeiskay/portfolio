// Bước 1 của đăng nhập GitHub cho trang /admin (Decap CMS).
// Địa chỉ: /oauth/auth  -> chuyển khách sang trang xin quyền của GitHub.
export async function onRequestGet({ env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('Thiếu biến GITHUB_CLIENT_ID trong Cloudflare Pages.', { status: 500 });
  }

  // "state" là mã dùng một lần để chắc chắn người quay lại chính là người vừa bấm đăng nhập
  const state = crypto.randomUUID();

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; Path=/oauth; SameSite=Lax; Max-Age=600`
    }
  });
}
