export class ClassroomSession {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url), method = request.method.toUpperCase();
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type':'application/json; charset=utf-8','cache-control':'no-store' } });
    const initialState = () => ({ step:0, resultsVisible:false, status:'live', locked:false, timerEndsAt:null, spotlight:null, teachingMode:'think', roomMoment:null, updatedAt:Date.now() });
    const sessionState = async () => (await this.state.storage.get('state')) || initialState();
    const edits = async () => (await this.state.storage.get('sessionEdits')) || {};

    // V0.10 session library lives in a dedicated Durable Object instance.
    if (url.pathname.startsWith('/library')) {
      const library = (await this.state.storage.get('library')) || {};
      if (method === 'GET' && url.pathname === '/library/sessions') {
        const sessions = Object.values(library).map(s => ({ id:s.id, title:s.title, course:s.course||'', durationMinutes:s.durationMinutes||75, updatedAt:s.updatedAt||0, stepCount:Array.isArray(s.steps)?s.steps.length:0 })).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
        return json({ sessions });
      }
      if (method === 'GET' && url.pathname.startsWith('/library/session/')) {
        const id = decodeURIComponent(url.pathname.split('/').pop() || '');
        return library[id] ? json(library[id]) : json({ error:'Session not found' },404);
      }
      if (method === 'POST' && url.pathname === '/library/session') {
        const body = await request.json();
        const clean = cleanDefinition(body);
        if (!clean.id) return json({error:'Session id is required'},400);
        clean.updatedAt = Date.now();
        clean.createdAt = library[clean.id]?.createdAt || clean.createdAt || Date.now();
        library[clean.id] = clean;
        await this.state.storage.put('library',library);
        return json({ok:true,session:clean});
      }
      if (method === 'POST' && /\/library\/session\/[^/]+\/duplicate$/.test(url.pathname)) {
        const parts=url.pathname.split('/').filter(Boolean), sourceId=decodeURIComponent(parts[2]||''), source=library[sourceId];
        if(!source)return json({error:'Session not found'},404);
        const body=await request.json().catch(()=>({})), id=slug(body.id||`${sourceId}-copy-${Date.now().toString(36)}`);
        if(!id)return json({error:'New session id is required'},400);
        const copy=structuredClone(source); copy.id=id; copy.title=String(body.title||`${source.title} — Copy`).slice(0,160); copy.createdAt=Date.now(); copy.updatedAt=Date.now();
        library[id]=copy; await this.state.storage.put('library',library); return json({ok:true,session:copy});
      }
      if (method === 'DELETE' && url.pathname.startsWith('/library/session/')) {
        const id=decodeURIComponent(url.pathname.split('/').pop()||'');
        if(!library[id])return json({error:'Session not found'},404);
        delete library[id]; await this.state.storage.put('library',library); return json({ok:true});
      }
      return json({error:'Builder endpoint not found'},404);
    }

    if (method === 'GET' && url.pathname.endsWith('/snapshot')) {
      const state=await sessionState(), participants=(await this.state.storage.get('participants'))||{}, answers=(await this.state.storage.get('answers'))||{}, cutoff=Date.now()-120000;
      const active=Object.values(participants).filter(p=>p.lastSeen>=cutoff);
      return json({state,participantCount:active.length,participants:active,answers,sessionEdits:await edits()});
    }
    if (method === 'POST' && url.pathname.endsWith('/join')) {
      const body=await request.json(),participants=(await this.state.storage.get('participants'))||{};
      participants[body.device]={device:body.device,name:String(body.name||'Anonymous').slice(0,40),lastSeen:Date.now()};
      await this.state.storage.put('participants',participants); return json({ok:true,state:await sessionState()});
    }
    if (method === 'POST' && url.pathname.endsWith('/heartbeat')) {
      const body=await request.json(),participants=(await this.state.storage.get('participants'))||{};
      if(participants[body.device]){participants[body.device].lastSeen=Date.now();await this.state.storage.put('participants',participants)} return json({ok:true});
    }
    if (method === 'POST' && url.pathname.endsWith('/answer')) {
      const current=await sessionState(); if(current.locked)return json({error:'Responses are locked'},423);
      const body=await request.json(),answers=(await this.state.storage.get('answers'))||{},key=String(body.question||''); answers[key]||={};
      answers[key][body.device]={device:body.device,name:String(body.name||'Anonymous').slice(0,40),response:body.response,updatedAt:Date.now()};
      await this.state.storage.put('answers',answers); return json({ok:true});
    }
    if (method === 'POST' && url.pathname.endsWith('/edit')) {
      const body=await request.json(), step=Math.max(0,Number(body.step)||0), all=await edits(), clean={};
      const allowed=['label','title','lead','studentTask','roomInstruction','say','askNext','landHere','transition','visualType','mediaUrl','mediaFit','mediaOverlay','mediaReveal'];
      for(const k of allowed) if(typeof body.fields?.[k]==='string') clean[k]=body.fields[k].slice(0,k==='mediaUrl'?3000:2000);
      all[step]={...(all[step]||{}),...clean,updatedAt:Date.now()}; await this.state.storage.put('sessionEdits',all);
      const current=await sessionState(); await this.state.storage.put('state',{...current,updatedAt:Date.now()}); return json({ok:true,step,fields:all[step]});
    }
    if (method === 'POST' && url.pathname.endsWith('/state')) {
      const body=await request.json(),current=await sessionState(),allowedModes=['think','commit','reveal','discuss','challenge','reflect','close'];
      const next={...current,
        step:Number.isFinite(body.step)?body.step:current.step,
        resultsVisible:typeof body.resultsVisible==='boolean'?body.resultsVisible:current.resultsVisible,
        status:body.status||current.status,
        locked:typeof body.locked==='boolean'?body.locked:current.locked,
        timerEndsAt:body.timerEndsAt===null||Number.isFinite(body.timerEndsAt)?body.timerEndsAt:current.timerEndsAt,
        spotlight:body.spotlight===null||typeof body.spotlight==='object'?body.spotlight:current.spotlight,
        teachingMode:allowedModes.includes(body.teachingMode)?body.teachingMode:(current.teachingMode||'think'),
        roomMoment:body.roomMoment===null||typeof body.roomMoment==='object'?body.roomMoment:current.roomMoment,
        updatedAt:Date.now()};
      await this.state.storage.put('state',next); return json(next);
    }
    if (method === 'POST' && url.pathname.endsWith('/spotlight')) {
      const body=await request.json(),answers=(await this.state.storage.get('answers'))||{},row=answers?.[String(body.question||'')]?.[String(body.device||'')]; if(!row)return json({error:'Response not found'},404);
      const current=await sessionState(),next={...current,spotlight:{question:String(body.question||''),response:row.response,name:row.name,anonymous:body.anonymous!==false},roomMoment:{type:'contrast'},updatedAt:Date.now()};
      await this.state.storage.put('state',next); return json(next);
    }
    if (method === 'POST' && url.pathname.endsWith('/reset')) { await this.state.storage.deleteAll(); const initial=initialState(); await this.state.storage.put('state',initial); return json({ok:true,state:initial}); }
    return json({error:'Not found'},404);
  }
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url), path=url.pathname.replace(/\/+$/,'')||'/';
    if(path.startsWith('/api/builder/')){
      const id=env.CLASSROOM.idFromName('__session_library__'), target=env.CLASSROOM.get(id), suffix=path.replace('/api/builder','/library');
      const u=new URL(request.url);u.pathname=suffix;return target.fetch(new Request(u.toString(),request));
    }
    if(path.startsWith('/api/session/')){
      const parts=path.split('/').filter(Boolean),sessionId=parts[2]||'session-2',id=env.CLASSROOM.idFromName(sessionId);
      return env.CLASSROOM.get(id).fetch(request);
    }
    if(path==='/'&&url.searchParams.get('instructor')==='1') return Response.redirect(withSession('/instructor',url),302);
    if(path==='/'&&url.searchParams.get('display')==='1') return Response.redirect(withSession('/room',url),302);
    if(path==='/'||path==='/student') return asset('/student.html',request,env);
    if(path==='/instructor') return asset('/instructor-v08.html',request,env);
    if(path==='/room'||path==='/display') return asset('/room.html',request,env);
    if(path==='/builder') return asset('/builder.html',request,env);
    return env.ASSETS.fetch(request);
  }
};

function asset(path,request,env){const u=new URL(request.url);u.pathname=path;return env.ASSETS.fetch(new Request(u.toString(),request));}
function withSession(path,url){const u=new URL(path,url);const s=url.searchParams.get('session');if(s)u.searchParams.set('session',s);return u.toString()}
function slug(v){return String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)}
function cleanDefinition(body){
  const id=slug(body.id),steps=Array.isArray(body.steps)?body.steps.slice(0,80).map((s,i)=>({
    label:String(s.label||`Moment ${i+1}`).slice(0,80), title:String(s.title||'Untitled moment').slice(0,200), lead:String(s.lead||'').slice(0,2000), minutes:Math.max(1,Math.min(60,Number(s.minutes)||5)), type:String(s.type||'prompt').slice(0,40), key:String(s.key||`moment_${i+1}`).slice(0,100), choices:Array.isArray(s.choices)?s.choices.map(x=>String(x).slice(0,200)).slice(0,20):[], multi:!!s.multi,
    studentTask:String(s.studentTask||'').slice(0,2000), roomInstruction:String(s.roomInstruction||'').slice(0,2000), visualType:String(s.visualType||'auto').slice(0,40), mediaUrl:String(s.mediaUrl||'').slice(0,3000), mediaFit:String(s.mediaFit||'cover').slice(0,20), mediaOverlay:String(s.mediaOverlay||'').slice(0,1000), mediaReveal:String(s.mediaReveal||'immediate').slice(0,30),
    runbook:{say:String(s.runbook?.say||'').slice(0,2000),studentDoes:String(s.runbook?.studentDoes||'').slice(0,2000),askNext:String(s.runbook?.askNext||'').slice(0,2000),landHere:String(s.runbook?.landHere||'').slice(0,2000),watchFor:String(s.runbook?.watchFor||'').slice(0,2000),ifStuck:String(s.runbook?.ifStuck||'').slice(0,2000),advanceWhen:String(s.runbook?.advanceWhen||'').slice(0,2000),transition:String(s.runbook?.transition||'').slice(0,2000)}
  })):[];
  return {id,title:String(body.title||'Untitled Session').slice(0,160),course:String(body.course||'').slice(0,120),description:String(body.description||'').slice(0,1000),durationMinutes:Math.max(10,Math.min(300,Number(body.durationMinutes)||steps.reduce((n,s)=>n+s.minutes,0)||75)),version:'0.10',steps};
}
