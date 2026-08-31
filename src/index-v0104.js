import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const short=(v,n=500)=>String(v??'').slice(0,n);

export class ClassroomSession extends BaseClassroomSession {
  async fetch(request) {
    const url=new URL(request.url),method=request.method.toUpperCase();
    if(url.pathname.endsWith('/research/pulse')&&method==='POST'){
      const b=await request.json().catch(()=>({}));
      if(!b.pulse||!b.device||!b.value)return json({error:'pulse, device, and value are required'},400);
      const pulses=(await this.state.storage.get('researchPulses'))||{};
      const id=short(b.pulse,80);pulses[id]||={};
      pulses[id][short(b.device,120)]={pulse:id,question:short(b.question,240),value:short(b.value,120),comment:short(b.comment,500),moment:short(b.moment,120),at:Date.now()};
      await this.state.storage.put('researchPulses',pulses);return json({ok:true});
    }
    if(url.pathname.endsWith('/research/report')&&method==='GET'){
      const participants=(await this.state.storage.get('participants'))||{},answers=(await this.state.storage.get('answers'))||{},pulses=(await this.state.storage.get('researchPulses'))||{},transitions=(await this.state.storage.get('researchTransitions'))||[];
      const answering=new Set();for(const rows of Object.values(answers))for(const d of Object.keys(rows||{}))answering.add(d);
      const pulseSummary={};const comments=[];
      for(const [id,rows] of Object.entries(pulses)){const vals=Object.values(rows||{}),counts={};for(const r of vals){counts[r.value]=(counts[r.value]||0)+1;if(r.comment)comments.push({pulse:id,comment:r.comment,at:r.at})}pulseSummary[id]={n:vals.length,counts};}
      const moments=[];for(let i=0;i<transitions.length;i++){const t=transitions[i],next=transitions[i+1];moments.push({step:t.step,startedAt:t.at,observedSeconds:next?Math.max(0,(next.at-t.at)/1000):null});}
      return json({joined:Object.keys(participants).length,answering:answering.size,pulses:pulseSummary,comments,moments,startedAt:transitions[0]?.at||null,lastTransitionAt:transitions.at(-1)?.at||null});
    }
    const clone=request.clone();const response=await super.fetch(request);
    if(response.ok&&method==='POST'&&url.pathname.endsWith('/state')){
      try{const b=await clone.json();if(Number.isFinite(b.step)){const arr=(await this.state.storage.get('researchTransitions'))||[],last=arr[arr.length-1];if(!last||last.step!==b.step){arr.push({step:b.step,at:Date.now()});await this.state.storage.put('researchTransitions',arr.slice(-200));}}}catch(_){ }
    }
    return response;
  }
}

function addBefore(html, marker, value) { return html.includes(value.match(/(?:href|src)=\"([^\"]+)/)?.[1] || value) ? html : html.replace(marker, value + marker); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/rehearsal') { const u = new URL('/rehearsal-v01019.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/pilot-report') { const u = new URL('/pilot-report-v01021.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    const response = await baseHandler.fetch(request, env); if (!response.ok) return response;
    const type = response.headers.get('content-type') || ''; if (!type.includes('text/html')) return response;
    const classroomSurface = ['/builder','/student','/instructor','/room','/display'].includes(path); if (!classroomSurface) return response;
    let html = await response.text();
    html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0109-icons.css">'); html = addBefore(html, '</body>', '<script src="/v0109-icons.js"></script>');
    if (path === '/builder') {
      for (const f of ['v0104-polish.css','v0105-editor.css','v0106-guide.css','v0108-workspace.css','v01010-navigation.css','v01011-simplify.css','v01013-layered.css','v01017-share.css']) html=addBefore(html,'</head>',`<link rel="stylesheet" href="/${f}">`);
      for (const f of ['week2-seeds.js','week2-v0107.js','week2-v01015.js','week2-v01020.js','v0105-editor.js','v0106-guide.js','v0108-workspace.js','v01010-navigation.js','v01011-simplify.js','v01012-recovery.js','v01013-layered.js','v01017-share.js','v01019-builder.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if(path==='/student'){
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      html=addBefore(html,'</body>','<script src="/v01021-student-research.js"></script>');
    }
    if (path === '/instructor') {
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01010-navigation.css">'); html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01019.css">');html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      for (const f of ['v01010-navigation.js','v01019-moment-guides.js','v01020-guides.js','v01019-instructor.js','v01021-instructor-research.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if (path === '/room' || path === '/display') { html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01016-room.css">'); html=addBefore(html,'</body>','<script src="/v01016-room.js"></script>'); }
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-store'); return new Response(html,{status:response.status,headers});
  }
};
