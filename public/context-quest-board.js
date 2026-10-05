const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="";
async function req(){const r=await fetch(API+"/snapshot");return r.json()}
function mast(body){return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">LIVE CLASSROOM BOARD</div></div><div class="pill">INF 128 · TEAM RACE</div></header>${body}`}
function phase(){
 const s=snap.state.stage,r=D.rounds[snap.state.round];let title=D.stages[s]||s,sub="";
 if(["build","test","twist","check","reveal"].includes(s)){title=`ROUND ${snap.state.round+1} · ${r.icon} ${r.key}`;sub=s==="build"?r.bad:s==="test"?"Teams are testing their improved prompts.":s==="twist"?r.twist:s==="check"?"Judge the response: audience · goal · constraints · evidence":s==="reveal"?"MOVEMENT REVEAL!":"";}
 if(s==="lobby"){title="FORM YOUR TEAMS";sub="Join at classroom.itsbadlabs.com/context-quest";}
 if(s==="tutorial"){title="TUTORIAL";sub="Bad prompt → context → test → plot twist → fix it."}
 if(s==="final-build"){title="👾 FINAL CHALLENGE";sub="Different stakeholders. One consequential AI system."}
 if(s==="final-test"){title="FINAL TEST";sub="Run it. Read it. Judge it."}
 if(s==="final-twist"){title="🚨 FINAL PLOT TWIST";sub=D.final.twist}
 if(s==="final-check"){title="FINAL CHECK";sub="Does the design still hold when the stakes are real?"}
 if(s==="final-reveal"){title="🏆 FINAL MOVEMENT";sub="Who handled context, evidence, and consequences best?"}
 if(s==="complete"){title="CONTEXT CHANGES EVERYTHING";sub="WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK"}
 return `<section class="phasecard"><div class="label">GAME MASTER</div><div class="bigq" style="color:white">${esc(title)}</div><p style="font-size:20px">${esc(sub)}</p></section>`;
}
function track(){
 const max=16,teams=snap.teams||[];return `<section class="boardShell"><div class="tiny" style="margin-bottom:12px">THE CONTEXT QUEST TRACK</div><div class="track">${Array.from({length:max+1},(_,i)=>{const here=teams.filter(t=>Math.min(max,t.position||0)===i);return `<div class="space ${i===max?"finalspace":""}"><div>${i===0?"START":i===max?"FINISH":i}</div><div class="tokens">${here.map(t=>`<div class="token" title="${esc(t.name)}" style="background:${t.color}">${esc((t.name||"?").slice(0,2).toUpperCase())}</div>`).join("")}</div></div>`}).join("")}</div></section>`}
function leaders(){
 const teams=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0)||(b.totalPoints||0)-(a.totalPoints||0));return `<section class="panel"><div class="label">STANDINGS</div><div class="leaderboard">${teams.map((t,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div style="display:flex;gap:9px;align-items:center"><span class="token" style="background:${t.color}">${esc((t.name||"?").slice(0,2).toUpperCase())}</span><b>${esc(t.name)}</b></div><div><b>${t.position||0}</b> spaces</div><div class="tiny">${t.tutorialDone?"READY":"JOINED"}</div></div>`).join("")||'<p>Waiting for teams to join…</p>'}</div></section>`}
function render(){if(!snap)return;$("#app").innerHTML=mast(phase()+track()+leaders())}
async function refresh(){try{const n=await req(),sig=JSON.stringify(n);if(sig!==last){snap=n;last=sig;render()}}catch(e){console.error(e)}}refresh();setInterval(refresh,900);