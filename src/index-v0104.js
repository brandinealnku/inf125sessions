import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';

export class ClassroomSession extends BaseClassroomSession {}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const response = await baseHandler.fetch(request, env);
    if (path !== '/builder' || !response.ok) return response;

    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;

    let html = await response.text();
    if (!html.includes('/v0104-polish.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/v0104-polish.css"><link rel="stylesheet" href="/v0105-editor.css"><link rel="stylesheet" href="/v0106-guide.css"></head>');
    else {
      if (!html.includes('/v0105-editor.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/v0105-editor.css"></head>');
      if (!html.includes('/v0106-guide.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/v0106-guide.css"></head>');
    }
    if (!html.includes('/week2-seeds.js')) html = html.replace('</body>', '<script src="/week2-seeds.js"></script></body>');
    if (!html.includes('/week2-v0107.js')) html = html.replace('</body>', '<script src="/week2-v0107.js"></script></body>');
    if (!html.includes('/v0105-editor.js')) html = html.replace('</body>', '<script src="/v0105-editor.js"></script></body>');
    if (!html.includes('/v0106-guide.js')) html = html.replace('</body>', '<script src="/v0106-guide.js"></script></body>');
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html, { status: response.status, headers });
  }
};
