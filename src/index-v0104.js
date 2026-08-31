import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';

export class ClassroomSession extends BaseClassroomSession {}

function addBefore(html, marker, value) {
  return html.includes(value.match(/(?:href|src)=\"([^\"]+)/)?.[1] || value) ? html : html.replace(marker, value + marker);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/rehearsal') { const u = new URL('/rehearsal-v01019.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    const response = await baseHandler.fetch(request, env); if (!response.ok) return response;
    const type = response.headers.get('content-type') || ''; if (!type.includes('text/html')) return response;
    const classroomSurface = ['/builder','/student','/instructor','/room','/display'].includes(path); if (!classroomSurface) return response;
    let html = await response.text();
    html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0109-icons.css">'); html = addBefore(html, '</body>', '<script src="/v0109-icons.js"></script>');
    if (path === '/builder') {
      for (const f of ['v0104-polish.css','v0105-editor.css','v0106-guide.css','v0108-workspace.css','v01010-navigation.css','v01011-simplify.css','v01013-layered.css','v01017-share.css']) html=addBefore(html,'</head>',`<link rel="stylesheet" href="/${f}">`);
      for (const f of ['week2-seeds.js','week2-v0107.js','week2-v01015.js','week2-v01020.js','v0105-editor.js','v0106-guide.js','v0108-workspace.js','v01010-navigation.js','v01011-simplify.js','v01012-recovery.js','v01013-layered.js','v01017-share.js','v01019-builder.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if (path === '/instructor') {
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01010-navigation.css">'); html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01019.css">');
      for (const f of ['v01010-navigation.js','v01019-moment-guides.js','v01020-guides.js','v01019-instructor.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if (path === '/room' || path === '/display') { html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01016-room.css">'); html=addBefore(html,'</body>','<script src="/v01016-room.js"></script>'); }
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-store'); return new Response(html,{status:response.status,headers});
  }
};
