window.Classroom=(function(){
  const device=localStorage.classroomDevice||(localStorage.classroomDevice=(crypto.randomUUID?crypto.randomUUID():'dev-'+Math.random().toString(36).slice(2)));
  const params=new URLSearchParams(location.search),requested=params.get('session')||'session-2';
  let session={id:requested,steps:[],durationMinutes:75},snapshot={state:{step:0,locked:false,resultsVisible:false,timerEndsAt:null,spotlight:null,roomMoment:null},participantCount:0,participants:[],answers:{},sessionEdits:{}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  async function loadSession(){
    try{const r=await fetch('/api/builder/session/'+encodeURIComponent(requested),{cache:'no-store'});if(r.ok){session=await r.json();return session}}
    catch(_){ }
    if(requested!=='session-2')throw new Error('Session not found');
    session=await fetch('/sessions/how-ai-works.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Session failed to load');return r.json()});return session;
  }
  async function api(path,options={}){const r=await fetch('/api/session/'+encodeURIComponent(session.id)+path,{headers:{'content-type':'application/json'},...options});if(!r.ok)throw new Error(await r.text());return r.json()}
  async function refresh(){snapshot=await api('/snapshot');return snapshot}
  function raw(i=snapshot.state.step||0){return session.steps[Math.max(0,Math.min(session.steps.length-1,i))]||{}}
  function current(){const i=Math.max(0,Math.min(session.steps.length-1,snapshot.state.step||0)),base=raw(i),edit=snapshot.sessionEdits?.[i]||{};return{...base,...edit,runbook:{...(base.runbook||{}),say:edit.say??base.runbook?.say,askNext:edit.askNext??base.runbook?.askNext,landHere:edit.landHere??base.runbook?.landHere,transition:edit.transition??base.runbook?.transition}}}
  function elapsed(i){return session.steps.slice(0,i).reduce((n,s)=>n+(s.minutes||0),0)}
  function answers(key){return Object.values(snapshot.answers?.[key]||{})}
  function aggregate(key){const out={};answers(key).forEach(row=>{const r=row.response;if(Array.isArray(r))r.forEach(v=>out[v]=(out[v]||0)+1);else if(typeof r==='string')out[r]=(out[r]||0)+1});return out}
  function aggregateMeta(key){const rows=answers(key),multi=rows.some(row=>Array.isArray(row.response));return{respondents:rows.length,multi}}
  function changedMinds(){const before=snapshot.answers?.maya_before||{},after=snapshot.answers?.maya_after||{};let eligible=0,changed=0;for(const id of Object.keys(before)){if(after[id]){eligible++;if(before[id].response!==after[id].response)changed++}}return{eligible,changed,percent:eligible?Math.round(changed/eligible*100):0}}
  function participation(key=current().key){const count=key?answers(key).length:0;const active=Math.max(0,snapshot.participantCount||0);return{count,active,percent:active?Math.min(100,Math.round(count/active*100)):0}}
  function timerText(){const end=snapshot.state.timerEndsAt;if(!end)return'—';const ms=Math.max(0,end-Date.now()),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+':'+String(s).padStart(2,'0')}
  async function state(patch){await api('/state',{method:'POST',body:JSON.stringify(patch)});return refresh()}
  async function edit(step,fields){await api('/edit',{method:'POST',body:JSON.stringify({step,fields})});return refresh()}
  async function answer(question,response,name){return api('/answer',{method:'POST',body:JSON.stringify({device,name,question,response})})}
  async function join(name){await api('/join',{method:'POST',body:JSON.stringify({device,name})});return refresh()}
  async function heartbeat(){try{await api('/heartbeat',{method:'POST',body:JSON.stringify({device})})}catch(_){}}
  function sessionUrl(path){const u=new URL(path,location.origin);u.searchParams.set('session',session.id);return u.pathname+u.search}
  return{get session(){return session},get snapshot(){return snapshot},device,esc,loadSession,api,refresh,raw,current,elapsed,answers,aggregate,aggregateMeta,changedMinds,participation,timerText,state,edit,answer,join,heartbeat,sessionUrl};
})();
