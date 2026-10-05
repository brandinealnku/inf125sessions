const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="";
async function req(){const r=await fetch(API+"/snapshot");return r.json()}
function mast(body){return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">LIVE CLASSROOM BOARD</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="pill">🎮 ${snap?.playing||0} PLAYING</div><div class="pill">👀 ${snap?.watching||0} WATCHING</div></div></header>${body}`}
function phase(){
 const s=snap.state.stage,r=D.rounds[snap.state.round];let title=D.stages[s]||s,sub="";
 if(["build","test","twist","check","reveal"].includes(s)){title=`ROUND ${snap.state.round+1} · ${r.icon} ${r.key}`;sub=s==="build"?r.bad:s==="test"?"Teams are testing the prompt they voted forward.":s==="twist"?r.twist:s==="check"?"Everyone votes: audience · goal · constraints · evidence":s==="reveal"?"MOVEMENT REVEAL!":"";}
 if(s==="lobby"){title=snap.state.teamsFormed?"FIND YOUR TEAM":"EVERYONE JOIN";sub=snap.state.teamsFormed?"Turn toward your virtual teammates. Roles are already assigned.":"classroom.itsbadlabs.com/context-quest · choose PLAY or WATCH";}
 if(s==="tutorial"){title="TUTORIAL";sub="Learn the whole game by playing it: bad prompt → context → test → twist → fix."}
 if(s==="final-build"){title="👾 FINAL CHALLENGE";sub="Different stakeholders. One consequential AI system."}
 if(s==="final-test"){title="FINAL TEST";sub="Run the team-selected design."}
 if(s==="final-twist"){title="🚨 FINAL PLOT TWIST";sub=D.final.twist}
 if(s==="final-check"){title="FINAL JUDGMENT";sub="Every player votes. Team movement comes from the group result."}
 if(s==="final-reveal"){title="🏆 FINAL MOVEMENT";sub="Who handled context, evidence, and consequences best?"}
 if(s==="complete"){title="CONTEXT CHANGES EVERYTHING";sub="WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK"}
 return `<section class="phasecard"><div class="label">GAME MASTER</div><div class="bigq" style="color:white">${esc(title)}</div><p style="font-size:22px">${esc(sub)}</p></section>`;
}
function lobby(){
 if(snap.state.stage!=="lobby")return"";
 if(!snap.state.teamsFormed){const ps=(snap.players||[]).map((p,i)=>`<div class="arrival ${p.mode==="watch"?"watch":""}">${p.mode==="watch"?"👀":"🎮"} ${esc(p.name)}</div>`).join("");return `<section class="panel"><div class="label">THE ROOM IS FILLING</div><div class="arrivalgrid">${ps||"<div class='arrival'>Waiting for the first player…</div>"}</div></section>`}
 return `<section class="panel"><div class="label">YOUR VIRTUAL TEAMS</div><div class="teamtiles">${(snap.teams||[]).map(t=>`<div class="teamtile" style="border-color:${t.color}"><div class="teamtileTitle"><span class="token" style="background:${t.color}">${esc((t.name||"?").slice(0,2).toUpperCase())}</span><b>${esc(t.name)}</b></div><div class="roster">${(t.members||[]).map(m=>`<span class="mini">${esc(m.name)}</span>`).join("")}</div></div>`).join("")}</div></section>`}
function track(){
 if(!snap.state.teamsFormed)return"";
 const max=16,teams=snap.teams||[];return `<section class="boardShell"><div class="tiny" style="margin-bottom:12px">THE CONTEXT QUEST TRACK</div><div class="track">${Array.from({length:max+1},(_,i)=>{const here=teams.filter(t=>Math.min(max,t.position||0)===i);return `<div class="space ${i===max?"finalspace":""}"><div>${i===0?"START":i===max?"FINISH":i}</div><div class="tokens">${here.map(t=>`<div class="token" title="${esc(t.name)}" style="background:${t.color}">${esc((t.name||"?").slice(0,2).toUpperCase())}</div>`).join("")}</div></div>`}).join("")}</div></section>`}
function leaders(){
 if(!snap.state.teamsFormed)return"";
 const teams=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0)||(b.totalPoints||0)-(a.totalPoints||0));return `<section class="panel"><div class="label">STANDINGS</div><div class="leaderboard">${teams.map((t,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div style="display:flex;gap:9px;align-items:center"><span class="token" style="background:${t.color}">${esc((t.name||"?").slice(0,2).toUpperCase())}</span><div><b>${esc(t.name)}</b><div class="tiny">${t.members?.length||0} PLAYERS</div></div></div><div><b>${t.position||0}</b> spaces</div><div class="tiny">${t.stakeholder||""}</div></div>`).join("")}</div></section>`}
function render(){if(!snap)return;$("#app").innerHTML=mast(phase()+lobby()+track()+leaders())}
async function refresh(){try{const n=await req(),sig=JSON.stringify(n);if(sig!==last){snap=n;last=sig;render()}}catch(e){console.error(e)}}refresh();setInterval(refresh,750);