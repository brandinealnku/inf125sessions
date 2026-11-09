// November 10 2026 INF 125 lesson controller. Separate Durable Object keys from Group Mode.
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const bounded=(value,n=800)=>String(value??'').trim().slice(0,n);
const phases=[
  {title:'Welcome + AI Pulse',start:0,end:10,kind:'poll',slide:14,question:'Before today, how confident are you about evaluating a difficult AI decision?',options:['Very confident','Somewhat confident','Not yet confident']},
  {title:'Slides + Ethical Reasoning',start:10,end:25,kind:'reflection',slide:14,question:'Using the five-question ethics check, which lens matters most when AI makes a consequential decision, and why?'},
  {title:'Case Marketplace + Teams',start:25,end:45,kind:'groups',slide:15,question:'Choose a case, join your color team, and investigate the benefit, stakeholders, ethical lens, decision, and safeguard.'},
  {title:'Team Verdicts + Critique',start:45,end:55,kind:'groups',slide:19,question:'Defend your team verdict, challenge one other team, and identify a stronger safeguard.'},
  {title:'Design November 17',start:55,end:68,kind:'groups',slide:20,question:'Design a hands-on experience for high school visitors: what should they do, learn, and remember?'},
  {title:'Gen Ed Signature Assignment + Exit',start:68,end:75,kind:'signature',slide:21,question:'Choose a focused infographic question. Identify who benefits, who may be harmed, and which claim needs evidence.'}
];
export async function handleEthicsLab(request, storage){
  const url=new URL(request.url),method=request.method.toUpperCase(),op=url.pathname.split('/').pop();
  const state=async()=>await storage.get('nov10Stage')||{phase:0,card:0,updatedAt:Date.now()};
  const responses=async()=>await storage.get('nov10Responses')||{};
  if(op==='snapshot'&&method==='GET'){
    const current=await state(),entries=Object.values(await responses());
    const perPhase=phases.map((_,i)=>entries.filter(e=>e.phase===i).length);
    return json({state:current,phases,responses:entries.filter(e=>e.phase===current.phase).map(e=>({name:e.name,answer:e.answer,phase:e.phase})),counts:perPhase,total:entries.length});
  }
  if(op==='advance'&&method==='POST'){
    const b=await request.json().catch(()=>({}));const next=Number(b.phase),card=Math.max(0,Math.min(4,Number(b.card)||0));
    if(!Number.isInteger(next)||next<0||next>=phases.length)return json({error:'Invalid phase'},400);
    const value={phase:next,card,updatedAt:Date.now()};await storage.put('nov10Stage',value);return json({ok:true,state:value});
  }
  if(op==='respond'&&method==='POST'){
    const b=await request.json().catch(()=>({})),device=bounded(b.device,130),name=bounded(b.name,60),answer=bounded(b.answer,1600);
    if(!device||!name||!answer)return json({error:'Enter a name and answer'},400);
    const s=await state(),phase=Number(b.phase);
    if(phase!==s.phase)return json({error:'This activity has ended. Follow the current classroom screen.'},409);
    if(![0,1,5].includes(phase))return json({error:'Use Group Mode for this activity'},409);
    const all=await responses();all[`${phase}:${device}`]={device,name,answer,phase,at:Date.now()};await storage.put('nov10Responses',all);return json({ok:true});
  }
  if(op==='export'&&method==='GET'){
    const all=Object.values(await responses());const fields=['phase','name','answer','at'];
    const csv=[fields.join(','),...all.map(x=>fields.map(k=>'"'+String(x[k]??'').replace(/"/g,'""')+'"').join(','))].join('\r\n');
    return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="inf125-nov10-responses.csv"','cache-control':'no-store'}});
  }
  return json({error:'Not found'},404);
}