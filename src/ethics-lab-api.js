// INF 125 November 10 integrated classroom session — Cloudflare Durable Object state.
// Avoids the legacy Group Mode iframe and reuses the same gm* state keys.
const js=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const str=(v,n=1600)=>String(v??'').trim().slice(0,n);
const phases=[
 {title:'Welcome + AI Pulse',start:0,end:10,slide:'14',task:'Join once, share your opening opinion, and prepare to defend a decision.'},
 {title:'Slides + Responses',start:10,end:25,slide:'14–18',task:'Use fairness, privacy, transparency, ownership, and accountability to reason about AI.'},
 {title:'Ethical Dilemma Challenge',start:25,end:45,slide:'14–18',task:'Vote on the cases, find your assigned zone, and submit a defensible group decision.'},
 {title:'Verdicts + Critique',start:45,end:55,slide:'19–20',task:'Review another group: challenge an assumption, a missing stakeholder, a risk, or a safeguard.'},
 {title:'Design November 17',start:55,end:68,slide:'20',task:'Propose a fun, achievable, educational activity for high school visitors.'},
 {title:'Signature Assignment + Exit',start:68,end:75,slide:'21–27',task:'Narrow one infographic topic into a researchable question with stakeholders and evidence needs.'}
];
const initial=()=>({phase:0,startedAt:Date.now(),updatedAt:Date.now(),paused:false,minutesAdjustment:0});
const csvCell=x=>'"'+String(x??'').replace(/"/g,'""').replace(/^[=+@\-\t\r]/,'\'')+'"';
const csvRows=rows=>rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
const TIMEOUT=1000*60*60*10;
const buffer64=x=>btoa(String.fromCharCode(...new Uint8Array(x))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function sign(pin,payload){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),{name:'HMAC',hash:'SHA-256'},false,['sign']);return buffer64(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(payload)));}
async function authed(request,pin){if(!pin||pin.length<12)return false;const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('inf125_admin='));if(!cookie)return false;const parts=decodeURIComponent(cookie.slice('inf125_admin='.length)).split('.');if(parts.length!==2)return false;const stamp=Number(parts[0]);if(!Number.isFinite(stamp)||stamp>Date.now()+60000||Date.now()-stamp>TIMEOUT)return false;return(await sign(pin,parts[0]))===parts[1];}
export const isEthicsInstructor=authed;
export async function handleEthicsLab(request,storage,opts={}){
 const url=new URL(request.url),op=url.pathname.split('/').pop(),method=request.method.toUpperCase();
 const state=async()=>await storage.get('nov10Stage')||initial();
 const responses=async()=>await storage.get('nov10Responses')||{};
 const people=async()=>await storage.get('gmPeople')||{};
 const gmState=async()=>await storage.get('gmState')||{phase:'marketplace',groupsFormed:false};
 const groupResponses=async()=>await storage.get('gmResponses')||{};
 const pin=opts.pin||'';
 const authorized=await authed(request,pin);
 if(op==='login'&&method==='POST'){
   if(!pin||pin.length<12)return js({error:'Instructor PIN not configured. Set the INF125_INSTRUCTOR_PIN Worker secret (12+ characters).'},503);
   const body=await request.json().catch(()=>({}));if(str(body.pin,256)!==pin)return js({error:'Incorrect instructor PIN'},401);
   const stamp=String(Date.now()),token=stamp+'.'+await sign(pin,stamp);
   return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json','cache-control':'no-store','set-cookie':`inf125_admin=${token}; Path=/api/session/inf125-nov10-ethics-v2; HttpOnly; Secure; SameSite=Strict; Max-Age=36000`}});
 }
 if(op==='login-api'&&method==='POST')return js({error:'Invalid endpoint'},404);
 if(op==='auth'&&method==='GET')return js({authorized,configured:pin.length>=12});
 if(op==='snapshot'&&method==='GET'){
   const s=await state(),a=await responses(),gm=await gmState(),gPeople=await people(),gr=await groupResponses();
   const per=phases.map((_,i)=>Object.values(a).filter(x=>x.phase===i).length);
   const groupStatus=Object.fromEntries(['A','B','C','D'].map(z=>[z,{ethics:!!gr.ethics?.[z],critique:!!gr.critique?.[z],visit:!!gr.visit?.[z],members:Object.values(gPeople).filter(x=>x.groupId===z).length}]));
   return js({state:s,phases,counts:per,groups:{phase:gm.phase,formed:!!gm.groupsFormed,joined:Object.keys(gPeople).length,ballots:Object.keys(await storage.get('gmVotes')||{}).length,progress:groupStatus},myResponse:null,authorized});
 }
 if(op==='my-response'&&method==='POST'){
   const b=await request.json().catch(()=>({})),device=str(b.device,130);
   if(!device)return js({error:'Missing device'},400);
   const entry=(await responses())[`${Number(b.phase)}:${device}`];return js({response:entry?{phase:entry.phase,answer:entry.answer,fields:entry.fields,at:entry.at}:null});
 }
 if(op==='respond'&&method==='POST'){
   const b=await request.json().catch(()=>({})),device=str(b.device,130),name=str(b.name,50),s=await state(),phase=Number(b.phase);
   if(!device||!name)return js({error:'Join first'},400);
   if(phase!==s.phase)return js({error:'This activity has moved on. Your draft is still on your device.'},409);
   if(![0,1,5].includes(phase))return js({error:'Use Group Mode for this activity'},409);
   const fields=b.fields&&typeof b.fields==='object'?Object.fromEntries(Object.entries(b.fields).slice(0,12).map(([k,v])=>[str(k,40),str(v,1000)])):{};
   if(!Object.values(fields).some(x=>x))return js({error:'Enter a response before saving.'},400);
   const a=await responses();a[`${phase}:${device}`]={phase,device,name,fields,answer:Object.values(fields).join(' | ').slice(0,1600),at:Date.now()};
   await storage.put('nov10Responses',a);return js({ok:true,at:a[`${phase}:${device}`].at});
 }
 if(['advance','form-groups','pause','export','reset-test'].includes(op) && !authorized)return js({error:'Instructor sign-in required'},401);
 if(op==='advance'&&method==='POST'){
   const b=await request.json().catch(()=>({})),next=Number(b.phase),s=await state(),gm=await gmState();
   if(!Number.isInteger(next)||next<0||next>=phases.length)return js({error:'Invalid phase'},400);
   if(next>=3&&!gm.groupsFormed)return js({error:'Form groups before advancing to verdicts.'},409);
   const gmMap={2:'marketplace',3:'critique',4:'visit',5:'signature'};
   if(next in gmMap){const target=next===2?(gm.groupsFormed?'ethics':'marketplace'):gmMap[next];await storage.put('gmState',{...gm,phase:target,updatedAt:Date.now()});}
   const val={...s,phase:next,paused:false,updatedAt:Date.now()};await storage.put('nov10Stage',val);return js({ok:true,state:val});
 }
 if(op==='form-groups'&&method==='POST'){
   const s=await state();if(s.phase!==2)return js({error:'Form groups during the 25–45 minute activity.'},409);
   if(typeof opts.delegate!=='function')return js({error:'Group mode unavailable'},503);
   const u=new URL(request.url);u.pathname=u.pathname.replace(/ethics-lab\/form-groups$/,'group-mode/form-groups');
   const result=await opts.delegate(new Request(u.toString(),{method:'POST',headers:{'content-type':'application/json','cookie':request.headers.get('cookie')||''},body:'{}'}));
   if(!result.ok)return result;
   const gm=await gmState();await storage.put('gmState',{...gm,phase:'ethics',updatedAt:Date.now()});
   return js({ok:true});
 }
 if(op==='pause'&&method==='POST'){const s=await state();const val={...s,paused:!s.paused,updatedAt:Date.now()};await storage.put('nov10Stage',val);return js({ok:true,state:val});}
 if(op==='export'&&method==='GET'){
   const a=Object.values(await responses()),gr=await groupResponses(),gPeople=await people(),votes=await storage.get('gmVotes')||{},ind=await storage.get('gmIndividual')||{};
   const rows=[['category','phase','participant','group','field','value','timestamp']];
   for(const r of a)for(const [k,v] of Object.entries(r.fields||{}))rows.push(['individual',String(r.phase),r.name,'',k,v,new Date(r.at).toISOString()]);
   for(const [p,groups] of Object.entries(gr))for(const [groupId,r] of Object.entries(groups||{})){rows.push(['group',p,r.submittedBy,groupId,'text',r.text||'',new Date(r.updatedAt||Date.now()).toISOString()]);for(const [k,v] of Object.entries(r.fields||{}))rows.push(['group',p,r.submittedBy,groupId,k,v,new Date(r.updatedAt||Date.now()).toISOString()]);}
   for(const [id,r] of Object.entries(ind))for(const [kind,fields] of Object.entries(r))if(fields&&typeof fields==='object'&&!Array.isArray(fields))for(const [k,v] of Object.entries(fields))rows.push(['group-individual',kind,r.name||gPeople[id]?.name||'',r.groupId||'',k,v,'']);
   for(const [id,v] of Object.entries(votes))rows.push(['case-preference','marketplace',gPeople[id]?.name||'','', 'caseIds',Array.isArray(v)?v.join('; '):'', '']);
   return new Response('\uFEFF'+csvRows(rows),{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="inf125-nov10-combined.csv"','cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
 return js({error:'Not found'},404);
}