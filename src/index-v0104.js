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
    if(url.pathname.endsWith('/review/start')&&method==='POST'){
      const b=await request.json().catch(()=>({}));if(!b.device)return json({error:'device is required'},400);
      const progress=(await this.state.storage.get('reviewProgress'))||{},device=short(b.device,120),now=Date.now();
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),startedAt:progress[device]?.startedAt||now,lastSeen:now,status:'started'};
      await this.state.storage.put('reviewProgress',progress);return json({ok:true});
    }
    if(url.pathname.endsWith('/review/answer')&&method==='POST'){
      const b=await request.json().catch(()=>({}));
      if(!b.device||!b.question)return json({error:'device and question are required'},400);
      const all=(await this.state.storage.get('reviewAnswers'))||{},device=short(b.device,120);
      all[device]||={};
      all[device][String(b.question)]={question:Number(b.question),level:Number(b.level)||0,skill:short(b.skill,80),concept:short(b.concept,120),selected:b.selected,correct:!!b.correct,at:Date.now()};
      await this.state.storage.put('reviewAnswers',all);
      const progress=(await this.state.storage.get('reviewProgress'))||{};
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),startedAt:progress[device]?.startedAt||Date.now(),lastSeen:Date.now()};
      await this.state.storage.put('reviewProgress',progress);
      return json({ok:true});
    }
    if(url.pathname.endsWith('/review/complete')&&method==='POST'){
      const b=await request.json().catch(()=>({}));if(!b.device)return json({error:'device is required'},400);
      const progress=(await this.state.storage.get('reviewProgress'))||{},device=short(b.device,120);
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),score:Number(b.score)||0,total:Number(b.total)||25,percent:Number(b.percent)||0,minutes:Number(b.minutes)||0,skills:Array.isArray(b.skills)?b.skills.slice(0,20):[],xp:Number(b.xp)||0,rank:short(b.rank||'',80),bestStreak:Number(b.bestStreak)||0,recovered:Number(b.recovered)||0,status:'complete',startedAt:progress[device]?.startedAt||Date.now(),lastSeen:Date.now(),completedAt:Date.now()};
      await this.state.storage.put('reviewProgress',progress);return json({ok:true});
    }
    if(url.pathname.endsWith('/review/report')&&method==='GET'){
      const participants=(await this.state.storage.get('participants'))||{},answers=(await this.state.storage.get('reviewAnswers'))||{},progress=(await this.state.storage.get('reviewProgress'))||{};
      const ids=new Set([...Object.keys(participants),...Object.keys(answers),...Object.keys(progress)]),skillAgg={};
      const rows=[...ids].map(device=>{
        const p=participants[device]||{},g=progress[device]||{},a=Object.values(answers[device]||{}),correct=a.filter(x=>x.correct).length;
        for(const x of a){if(!x.skill)continue;skillAgg[x.skill]||={skill:x.skill,n:0,c:0};skillAgg[x.skill].n++;if(x.correct)skillAgg[x.skill].c++;}
        return {device,name:short(g.name||p.name||'Anonymous',80),answered:a.length,correct,percent:g.completedAt?g.percent:(a.length?Math.round(correct/a.length*100):null),xp:g.xp||0,rank:g.rank||'',bestStreak:g.bestStreak||0,recovered:g.recovered||0,status:g.status||(g.completedAt?'complete':'started'),startedAt:g.startedAt||p.joinedAt||null,lastSeen:g.lastSeen||p.lastSeen||null,completedAt:g.completedAt||null,minutes:g.minutes||null};
      }).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
      const skills=Object.values(skillAgg).map(x=>({...x,percent:x.n?Math.round(x.c/x.n*100):0})).sort((a,b)=>a.percent-b.percent);
      return json({rows,skills,generatedAt:Date.now()});
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
    if (path === '/powerpoint-overlay') { const u = new URL('/powerpoint-overlay.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/powerpoint-live') { const u = new URL('/powerpoint-live.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-overlay') { const u = new URL('/google-slides-overlay.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-live') { const u = new URL('/google-slides-live.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-room') { const u = new URL('/google-slides-room.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/week5-powerpoint-test') { const u = new URL('/week5-powerpoint-test.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/pilot-report') { const u = new URL('/pilot-report-v01021.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest' || path === '/inf128-context-quest') { const u = new URL('/context-quest.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest.js') { const u = new URL('/context-quest.js', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/midterm-quest' || path === '/review') { const u = new URL('/midterm-quest.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/midterm-quest-report' || path === '/review-report') { const u = new URL('/midterm-quest-report.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/instructor') { const u = new URL(request.url); u.pathname = '/instructor-v2.html'; return env.ASSETS.fetch(new Request(u, request)); }
    const response = await baseHandler.fetch(request, env); if (!response.ok) return response;
    const type = response.headers.get('content-type') || ''; if (!type.includes('text/html')) return response;
    const classroomSurface = ['/builder','/student','/instructor','/room','/display'].includes(path); if (!classroomSurface) return response;
    let html = await response.text();
    html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0109-icons.css">'); html = addBefore(html, '</body>', '<script src="/v0109-icons.js"></script>');
    if (path === '/builder') {
      // Builder is now self-contained. Do not inject legacy Builder layers here:
      // several older scripts target retired DOM/state names and can disable current controls.
      // Session-specific enhancements are loaded directly by public/builder.html.
    }
    if(path==='/student'){
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      html=addBefore(html,'</body>','<script src="/v01021-student-research.js"></script>');
      html=addBefore(html,'</body>','<script src="/v01022-student-a11y.js"></script>');
    }
    if (path === '/instructor') {
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01010-navigation.css">'); html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01019.css">');html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      for (const f of ['v01010-navigation.js','v01019-moment-guides.js','v01020-guides.js','v01019-instructor.js','v01021-instructor-research.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if (path === '/room' || path === '/display') {
      for (const f of ['v01016-room.css','v01024-room-media.css','v01028-room-match.css']) html=addBefore(html,'</head>',`<link rel="stylesheet" href="/${f}">`);
      for (const f of ['v01016-room.js','v01016-room-media-fix.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-store'); return new Response(html,{status:response.status,headers});
  }
};
