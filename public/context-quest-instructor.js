const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,lastStage="";
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
function mast(body){return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">GAME MASTER</div></div><div class="actions"><a class="btn soft" style="text-decoration:none" href="/context-quest/board" target="_blank">OPEN PROJECTED BOARD ↗</a></div></header>${body}`}
function stat(label,value){return `<div class="stat"><span class="tiny">${label}</span><b>${value}</b></div>`}
function counts(){const teams=snap?.teams||[],round=String(snap?.state?.round||0),final=String(snap?.state?.stage||"").startsWith("final"),key=final?"final":round;const rec=t=>t.rounds?.[key]||{};return{joined:teams.length,tutorial:teams.filter(t=>t.tutorialDone).length,built:teams.filter(t=>rec(t).draft).length,tested:teams.filter(t=>rec(t).testedAt).length,repaired:teams.filter(t=>rec(t).repair).length,checked:teams.filter(t=>rec(t).completedAt).length}}
function nextControl(){
 const s=snap.state.stage,r=snap.state.round;
 const map={
 lobby:["START TUTORIAL","tutorial",0],
 tutorial:["START ROUND 1","build",0],
 build:["SEND TEAMS TO TEST","test",r],
 test:["TRIGGER PLOT TWIST","twist",r],
 twist:["OPEN JUDGMENT CHECK","check",r],
 check:["REVEAL MOVES","reveal",r],
 reveal:[r<3?`START ROUND ${r+2}`:"START FINAL CHALLENGE",r<3?"build":"final-build",r<3?r+1:4],
 "final-build":["SEND FINAL TO TEST","final-test",4],
 "final-test":["TRIGGER FINAL PLOT TWIST","final-twist",4],
 "final-twist":["OPEN FINAL CHECK","final-check",4],
 "final-check":["REVEAL FINAL MOVES","final-reveal",4],
 "final-reveal":["FINISH GAME","complete",4]
 };return map[s]||null;
}
function stageHelp(){
 const s=snap.state.stage,r=D.rounds[snap.state.round];
 const x={
 lobby:"Teams join on their own devices. Open the projected board and wait until the room is ready.",
 tutorial:"Teams learn the entire loop by playing it. Start Round 1 when enough teams show READY.",
 build:`Teams are improving the Round ${snap.state.round+1} prompt. Wait for submissions, then send everyone to Test.`,
 test:"Teams copy their prompt into ChatGPT and read the answer. When enough have tested, trigger the Plot Twist.",
 twist:"The new information is now visible to every team. Give them time to repair their prompt.",
 check:"Teams judge the AI response using the four concrete checks. 4 checks moves 3 spaces; 3 moves 2; 0–2 forces another repair.",
 reveal:"Look up at the projected board. This is your teaching moment: briefly call out what changed and why.",
 "final-build":"Teams are designing for different stakeholders using the full framework.",
 "final-test":"Teams are testing their final design.",
 "final-twist":"The high-stakes failure is live. Let teams repair for verification, boundaries, escalation, and human judgment.",
 "final-check":"Teams are making the final judgment.",
 "final-reveal":"Reveal the race, then close with the full framework.",
 complete:"The game is complete. Preserve the result or reset when you are ready."
 };return x[s]||"";
}
function statusOf(t){
 const final=String(snap.state.stage).startsWith("final"),key=final?"final":String(snap.state.round||0),r=t.rounds?.[key]||{};
 if(snap.state.stage==="tutorial")return t.tutorialDone?"READY":"IN TUTORIAL";
 if(r.completedAt)return `LOCKED · +${r.move||0}`;
 if(r.status==="needs-repair")return "REPAIR NEEDED";
 if(r.repair)return "REPAIRED";
 if(r.testedAt)return "TESTED";
 if(r.draft)return "SUBMITTED";
 return "WORKING";
}
function teamRows(){
 return (snap.teams||[]).map((t,i)=>{const final=String(snap.state.stage).startsWith("final"),key=final?"final":String(snap.state.round||0),r=t.rounds?.[key]||{};return `<div class="teamrow"><div class="teamrowHead"><div style="display:flex;align-items:center;gap:9px"><span class="token" style="background:${t.color}">${i+1}</span><div><b>${esc(t.name)}</b><div class="tiny">${esc(t.stakeholder||"")}</div></div></div><div><b>${t.position||0} spaces</b></div></div><div class="teammeta"><span class="mini">${statusOf(t)}</span><span class="mini">TOTAL ${t.totalPoints||0}</span>${t.bonus?`<span class="mini">BONUS ${t.bonus>0?"+":""}${t.bonus}</span>`:""}</div>${r.draft?`<details><summary class="mini" style="display:inline-block;margin-top:8px;cursor:pointer">VIEW SUBMISSION</summary><div class="submission"><b>BUILD</b>\n${esc(r.draft)}${r.repair?`\n\n<b>REPAIR</b>\n${esc(r.repair)}`:""}</div></details>`:""}<div class="actions"><button class="btn soft" onclick="bonus('${t.id}',1)">+1 INSTRUCTOR BONUS</button><button class="btn soft" onclick="bonus('${t.id}',-1)">UNDO 1</button></div></div>`}).join("");
}
function render(){
 if(!snap)return;const c=counts(),next=nextControl(),stage=D.stages[snap.state.stage]||snap.state.stage;
 $("#app").innerHTML=mast(`<section class="phasecard"><div class="label">LIVE STATE</div><div class="bigq" style="color:white">${esc(stage)}${snap.state.round<4&&["build","test","twist","check","reveal"].includes(snap.state.stage)?` · ROUND ${snap.state.round+1}`:""}</div><p>${esc(stageHelp())}</p></section>
 <section class="panel"><div class="statusgrid">${stat("Teams",c.joined)}${stat("Tutorial ready",c.tutorial)}${stat("Submitted",c.built)}${stat("Tested",c.tested)}${stat("Repaired",c.repaired)}${stat("Locked",c.checked)}</div><div class="actions" style="margin-top:18px">${next?`<button class="btn purple" onclick="advance('${next[1]}',${next[2]})">${next[0]} →</button>`:""}<button class="btn red" onclick="resetGame()">RESET GAME</button></div></section>
 <section class="panel"><div class="label">ROOM STATUS</div><div class="bigq">Teams</div>${teamRows()||'<p>No teams have joined yet.</p>'}</section>`);
}
async function advance(stage,round){await req("/control",{method:"POST",body:JSON.stringify({stage,round})});toast("Game advanced.");await refresh(true)}
async function bonus(teamId,delta){await req("/bonus",{method:"POST",body:JSON.stringify({teamId,delta})});toast(delta>0?"Bonus space awarded.":"One space removed.");await refresh(true)}
async function resetGame(){if(!confirm("Reset Context Quest and remove all teams/scores?"))return;await req("/reset",{method:"POST",body:"{}"});toast("Game reset.");await refresh(true)}
async function refresh(force=false){try{const next=await req("/snapshot");const changed=force||next.state.stage!==lastStage||JSON.stringify(next)!==JSON.stringify(snap);snap=next;lastStage=snap.state.stage;if(changed)render()}catch(e){console.error(e)}}
refresh(true);setInterval(refresh,1000);