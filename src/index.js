export class ClassroomSession {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    const url = new URL(request.url), method = request.method.toUpperCase();
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    const initialState = () => ({ step:0, resultsVisible:false, status:'live', locked:false, timerEndsAt:null, spotlight:null, teachingMode:'think', updatedAt:Date.now() });
    const sessionState = async () => (await this.state.storage.get('state')) || initialState();
    if (method === 'GET' && url.pathname.endsWith('/snapshot')) {
      const state = await sessionState(), participants = (await this.state.storage.get('participants')) || {}, answers = (await this.state.storage.get('answers')) || {}, cutoff = Date.now() - 120000;
      return json({ state, participantCount:Object.values(participants).filter(p=>p.lastSeen>=cutoff).length, participants:Object.values(participants).filter(p=>p.lastSeen>=cutoff), answers });
    }
    if (method === 'POST' && url.pathname.endsWith('/join')) {
      const body=await request.json(), participants=(await this.state.storage.get('participants'))||{}; participants[body.device]={device:body.device,name:String(body.name||'Anonymous').slice(0,40),lastSeen:Date.now()}; await this.state.storage.put('participants',participants); return json({ok:true,state:await sessionState()});
    }
    if (method === 'POST' && url.pathname.endsWith('/heartbeat')) {
      const body=await request.json(), participants=(await this.state.storage.get('participants'))||{}; if(participants[body.device]){participants[body.device].lastSeen=Date.now();await this.state.storage.put('participants',participants)} return json({ok:true});
    }
    if (method === 'POST' && url.pathname.endsWith('/answer')) {
      const current=await sessionState(); if(current.locked)return json({error:'Responses are locked'},423); const body=await request.json(),answers=(await this.state.storage.get('answers'))||{},key=String(body.question||''); answers[key]||={}; answers[key][body.device]={device:body.device,name:String(body.name||'Anonymous').slice(0,40),response:body.response,updatedAt:Date.now()}; await this.state.storage.put('answers',answers); return json({ok:true});
    }
    if (method === 'POST' && url.pathname.endsWith('/state')) {
      const body=await request.json(),current=await sessionState(); const allowedModes=['think','commit','reveal','discuss','challenge','reflect','close']; const next={...current,step:Number.isFinite(body.step)?body.step:current.step,resultsVisible:typeof body.resultsVisible==='boolean'?body.resultsVisible:current.resultsVisible,status:body.status||current.status,locked:typeof body.locked==='boolean'?body.locked:current.locked,timerEndsAt:body.timerEndsAt===null||Number.isFinite(body.timerEndsAt)?body.timerEndsAt:current.timerEndsAt,spotlight:body.spotlight===null||typeof body.spotlight==='object'?body.spotlight:current.spotlight,teachingMode:allowedModes.includes(body.teachingMode)?body.teachingMode:(current.teachingMode||'think'),updatedAt:Date.now()}; await this.state.storage.put('state',next); return json(next);
    }
    if (method === 'POST' && url.pathname.endsWith('/spotlight')) {
      const body=await request.json(),answers=(await this.state.storage.get('answers'))||{},row=answers?.[String(body.question||'')]?.[String(body.device||'')]; if(!row)return json({error:'Response not found'},404); const current=await sessionState(),next={...current,spotlight:{question:String(body.question||''),response:row.response,name:row.name,anonymous:body.anonymous!==false},updatedAt:Date.now()}; await this.state.storage.put('state',next); return json(next);
    }
    if (method === 'POST' && url.pathname.endsWith('/reset')) { await this.state.storage.deleteAll(); const initial=initialState(); await this.state.storage.put('state',initial); return json({ok:true,state:initial}); }
    return json({error:'Not found'},404);
  }
}
export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/session/')){
      const parts=url.pathname.split('/').filter(Boolean),sessionId=parts[2]||'session-2',id=env.CLASSROOM.idFromName(sessionId);
      return env.CLASSROOM.get(id).fetch(request);
    }
    const normalizedPath=url.pathname.replace(/\/+$/,'')||'/';
    if(normalizedPath==='/instructor'||(normalizedPath==='/'&&url.searchParams.get('instructor')==='1')){
      const assetUrl=new URL(request.url);assetUrl.pathname='/instructor-v07.html';assetUrl.search='';
      return env.ASSETS.fetch(new Request(assetUrl.toString(),request));
    }
    if(normalizedPath==='/display'){
      const target=new URL(request.url);target.pathname='/';target.searchParams.set('display','1');return Response.redirect(target.toString(),302);
    }
    if(normalizedPath==='/'){
      const response=await env.ASSETS.fetch(request);
      const type=response.headers.get('content-type')||'';
      if(type.includes('text/html')){
        const html=await response.text();
        const patched=html.replace('</body>','<script src="/frictionless-v07.js"></script></body>');
        return new Response(patched,{status:response.status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      }
      return response;
    }
    return env.ASSETS.fetch(request);
  }
};