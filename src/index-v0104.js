import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';

export class ClassroomSession extends BaseClassroomSession {}

function addBefore(html, marker, value) {
  return html.includes(value.match(/(?:href|src)=\"([^\"]+)/)?.[1] || value) ? html : html.replace(marker, value + marker);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/rehearsal') {
      const u = new URL('/rehearsal-v01019.html', request.url);
      return env.ASSETS.fetch(new Request(u, request));
    }
    const response = await baseHandler.fetch(request, env);
    if (!response.ok) return response;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;
    const classroomSurface = ['/builder','/student','/instructor','/room','/display'].includes(path);
    if (!classroomSurface) return response;
    let html = await response.text();
    html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0109-icons.css">');
    html = addBefore(html, '</body>', '<script src="/v0109-icons.js"></script>');
    if (path === '/builder') {
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0104-polish.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0105-editor.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0106-guide.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0108-workspace.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01010-navigation.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01011-simplify.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01013-layered.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01017-share.css">');
      html = addBefore(html, '</body>', '<script src="/week2-seeds.js"></script>');
      html = addBefore(html, '</body>', '<script src="/week2-v0107.js"></script>');
      html = addBefore(html, '</body>', '<script src="/week2-v01015.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v0105-editor.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v0106-guide.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v0108-workspace.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01010-navigation.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01011-simplify.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01012-recovery.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01013-layered.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01017-share.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01019-builder.js"></script>');
    }
    if (path === '/instructor') {
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01010-navigation.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01018-knowledge.css">');
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01019.css">');
      html = addBefore(html, '</body>', '<script src="/v01010-navigation.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01018-knowledge.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01019-moment-guides.js"></script>');
      html = addBefore(html, '</body>', '<script src="/v01019-instructor.js"></script>');
    }
    if (path === '/room' || path === '/display') {
      html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v01016-room.css">');
      html = addBefore(html, '</body>', '<script src="/v01016-room.js"></script>');
    }
    const headers = new Headers(response.headers);headers.delete('content-length');headers.set('cache-control','no-store');
    return new Response(html,{status:response.status,headers});
  }
};
