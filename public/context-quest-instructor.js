const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="",openTeamVersions=new Set();
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
function mast(body){const test=snap?.state?.testMode?`<div class="testModeBanner">🧪 TEST MODE IS ON IN THE LIVE ROOM · RESET BEFORE CLASS</div>`:"";return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">GAME MASTER</div></div><div class="actions"><a class="btn soft" style="text-decoration:none" href="/context-quest/board" target="_blank">OPEN PROJECTED BOARD ↗</a><a class="btn teal" style="text-decoration:none" href="/context-quest/test">🧪 OPEN TEST SANDBOX</a></div></header>${test}${body}`}
function stat(label,value){return `<div class="stat"><span class="tiny">${label}</span><b>${value}</b></div>`}
function roundRec(t){const final=String(snap.state.stage).startsWith("final"),key=final?"final":String(snap.state.round||0);return t.rounds?.[key]||{}}
function counts(){const teams=snap.teams||[],players=snap.players||[],playing=players.filter(p=>p.mode==="play"),r=t=>roundRec(t);return{joined:players.length,playing:playing.length,watching:players.filter(p=>p.mode==="watch").length,teams:teams.length,ready:playing.filter(p=>p.tutorialDone).length,proposals:teams.reduce((n,t)=>n+Object.keys(r(t).buildProposals||{}).length,0),tested:teams.reduce((n,t)=>n+Object.keys(r(t).tested||{}).length,0),repairs:teams.reduce((n,t)=>n+Object.keys(r(t).repairProposals||{}).length,0),ballots:teams.reduce((n,t)=>n+Object.keys(r(t).checkBallots||{}).length,0)}}
function teamProgress(t){
 const r=roundRec(t),members=t.members||[],total=members.length,s=snap.state.stage,phase=t.progressPhase||"waiting";
 const names=(ids)=>ids.map(id=>members.find(m=>m.id===id)?.name||"Player");
 const missing=(obj)=>members.filter(m=>!obj?.[m.id]).map(m=>m.id);
 let steps=[],needs=[],ready=false,status="WAITING",tone="neutral";
 if(s==="lobby"){ready=!!t.customized;status=ready?"TEAM SET":"SETUP";needs=ready?[]:["Choose team name + charm"];steps=[["Setup",ready?1:0,1]]}
 else if(s==="tutorial"){const n=members.filter(m=>m.tutorialDone).length;ready=total>0&&n===total;status=ready?"READY":"TUTORIAL";needs=names(members.filter(m=>!m.tutorialDone).map(m=>m.id)).map(n=>`${n}: finish tutorial`);steps=[["Tutorial",n,total]]}
 else if(s==="build"||s==="final-build"){
   const answers=Object.keys(r.buildProposals||{}).length,votes=Object.keys(r.buildVotes||{}).length,tested=Object.keys(r.tested||{}).length;
   ready=phase==="ready-twist";status=ready?"READY FOR PLOT TWIST":phase==="test"?"TESTING":r.buildTie?"TIE — RESOLVE":"BUILD + VOTE";
   if(r.buildTie)needs=["Team vote is tied — someone must change a vote"];
   else if(phase==="build"){
     const mv=missing(r.buildVotes);needs=mv.length?names(mv).map(n=>`${n}: vote`):answers?["Waiting for team selection"]:["Waiting for first answer"];
   }else if(phase==="test"){
     const mt=missing(r.tested);needs=names(mt).map(n=>`${n}: test selected answer`);
   }
   steps=[["Answers",answers,total],["Votes",votes,total],["Tested",tested,total]];
 }
 else if(s==="twist"||s==="final-twist"){
   const answers=Object.keys(r.repairProposals||{}).length,votes=Object.keys(r.repairVotes||{}).length,ballots=Object.keys(r.checkBallots||{}).length;
   ready=phase==="ready-reveal";status=ready?"READY FOR SCORE REVEAL":phase==="check"?"JUDGING":r.repairTie?"TIE — RESOLVE":"REPAIR + VOTE";
   if(r.repairTie)needs=["Repair vote is tied — someone must change a vote"];
   else if(phase==="repair"){
     const mv=missing(r.repairVotes);needs=mv.length?names(mv).map(n=>`${n}: vote on repair`):answers?["Waiting for repair selection"]:["Waiting for first repair"];
   }else if(phase==="check"){
     const mb=missing(r.checkBallots);needs=names(mb).map(n=>`${n}: submit judgment`);
   }
   steps=[["Repairs",answers,total],["Votes",votes,total],["Judgments",ballots,total]];
 }
 else if(s==="reveal"||s==="final-reveal"){ready=true;status="REVEALED";steps=[["Movement",1,1]]}
 else if(s==="complete"){ready=true;status="COMPLETE";steps=[["Complete",1,1]]}
 tone=ready?"ready":needs.length?"working":"neutral";
 return {phase,ready,status,needs,steps};
}
function roomProgress(){
 const teams=snap.teams||[],rows=teams.map(t=>({team:t,progress:teamProgress(t)})),ready=rows.filter(x=>x.progress.ready).length;
 const needs=rows.flatMap(x=>x.progress.needs.map(n=>({team:x.team.name,charm:x.team.charm||"❔",text:n})));
 return {rows,total:teams.length,ready,needs,allReady:teams.length>0&&ready===teams.length};
}
function sharedAction(){
 const s=snap.state.stage,r=snap.state.round,room=roomProgress(),test=!!snap.state.testMode;
 if(s==="tutorial")return {label:"START MOMENT 1 · CONTEXT MATCH →",stage:"build",round:0,ready:room.allReady||test,forceable:true};
 if(s==="build")return {label:"⚡ REVEAL PLOT TWIST",stage:"twist",round:r,ready:room.allReady||test,forceable:true};
 if(s==="twist")return {label:"🏁 REVEAL SCORES + MOVEMENT",stage:"reveal",round:r,ready:room.allReady||test,forceable:true};
 if(s==="reveal")return r<2?{label:`START MOMENT ${r+2} →`,stage:"build",round:r+1,ready:true}:{label:"👾 START FINAL BOSS →",stage:"final-build",round:3,ready:true};
 if(s==="final-build")return {label:"⚡ REVEAL FINAL PLOT TWIST",stage:"final-twist",round:3,ready:room.allReady||test,forceable:true};
 if(s==="final-twist")return {label:"🏆 REVEAL FINAL SCORES",stage:"final-reveal",round:3,ready:room.allReady||test,forceable:true};
 if(s==="final-reveal")return {label:"FINISH GAME →",stage:"complete",round:3,ready:true};
 return null;
}
function stageHelp(){
 const s=snap.state.stage,r=snap.state.round,room=roomProgress();
 const base={
  lobby:snap.state.teamsFormed?(snap.state.testMode?"Test Mode is on. Start when ready; missing team setup can auto-fill.":"Teams are choosing names + charms."): "Everyone joins individually; form teams when most players are in.",
  tutorial:"Students learn the loop individually. You only launch Moment 1 when the room is ready.",
  build:"Teams are working independently: play → submit → vote → selected answer → test. You do not advance individual teams.",
  twist:"The Plot Twist is live. Teams automatically move through repair → vote → judgment.",
  reveal:"Movement is visible to the room. Debrief briefly, award an optional bonus, then launch the next Moment.",
  "final-build":"Final Boss is live. Teams build, vote, select, and test automatically.",
  "final-twist":"Final consequence is live. Teams repair, vote, and judge automatically.",
  "final-reveal":"Final movement is revealed. Close on the learning, not only the winner.",
  complete:"Game complete."
 }[s]||"";
 return room.total?`${base} ${room.ready}/${room.total} teams are ready for the next shared moment.`:base;
}
function facultyQuickStart(){
 return `<details class="panel facultyQuick"><summary><b>📋 FACULTY QUICK START</b> · hybrid Game Master model</summary><div class="playerGuideGrid">
 <div><b>AUTOMATED</b><p>Teams move themselves through submitting, voting, answer selection, testing, repair, and judgment.</p></div>
 <div><b>YOU CONTROL</b><p>Start each Moment, reveal the Plot Twist, reveal scores/movement, launch the next Moment, and launch the Final Boss.</p></div>
 <div><b>WATCH PROGRESS</b><p>Use the Room Monitor to see who is ready, which players still owe an action, and which teams have a tie.</p></div>
 <div><b>INSPECT, DON'T TRAFFIC-CONTROL</b><p>Open a team to see live submissions and vote counts. Winning answers are selected automatically; instructor approval is not required.</p></div>
 <div><b>OVERRIDE ONLY WHEN NEEDED</b><p>If a device dies, someone leaves, or a team cannot finish, use the override to move the whole room forward. Incomplete teams receive no automatic credit for unfinished judgment.</p></div>
 <div><b>KEEP THE THEATER</b><p>The room should experience Plot Twists and score reveals together. Automate workflow; human-control the theater.</p></div>
 </div></details>`;
}
function facilitationGuide(){
 const s=snap.state.stage,r=snap.state.round,m=D.rounds?.[r],room=roomProgress();
 let g={time:"",say:"",do:"",watch:"",advance:""};
 if(s==="lobby")g={time:"5–7 min",say:"“Join on your own device. Choose PLAY unless you’re observing.”",do:"Form teams once most people are in; let teams choose name + charm.",watch:"Late arrivals or anyone unsure which team they are on.",advance:"Every team has found one another and finished team setup."};
 else if(s==="tutorial")g={time:"4–5 min",say:"“Follow your screen. You do not need to memorize the rules.”",do:"Let the tutorial teach the loop.",watch:"Anyone stuck on the basic interaction.",advance:"The room monitor shows teams ready, then launch Moment 1."};
 else if(s==="build"||s==="final-build")g={time:s==="final-build"?"5–6 min":"~8 min",say:s==="final-build"?"“Use everything you learned. Your team will move itself into Test when voting resolves.”":"“Work with your team. Once everyone votes, your winning answer is selected automatically and your team moves into Test.”",do:"Circulate. Watch the Room Monitor rather than clicking teams forward.",watch:"Ties, missing votes, students who have not tested, or one person dominating.",advance:room.allReady?"All teams are ready — trigger the shared Plot Twist.":`${room.ready}/${room.total} teams ready. Wait or use Override only for a real exception.`};
 else if(s==="twist"||s==="final-twist")g={time:"5–6 min",say:"“New information. Adapt what changed; do not start over unless you need to.”",do:"Let teams repair, vote, and judge. Their internal steps advance automatically.",watch:"Tied votes, missing judgment ballots, or teams ignoring consequences.",advance:room.allReady?"All teams are ready — reveal scores and movement.":`${room.ready}/${room.total} teams ready for reveal.`};
 else if(s==="reveal"||s==="final-reveal")g={time:"2–3 min",say:"“Look up. This movement reflects judgment, not fancy wording.”",do:"Debrief one insight and optionally award one AI-literacy bonus.",watch:"Over-rewarding humor or polish instead of context/evidence.",advance:s==="final-reveal"?"Finish with the learning model.":"Launch the next shared Moment when the room is reset."};
 else if(s==="complete")g={time:"5 min",say:"“What changed when the context changed?”",do:"Let students articulate WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK.",watch:"Turning the ending into a lecture.",advance:"Game over."};
 else g={time:"2–4 min",say:"“Follow your screen and talk to your team.”",do:"Watch the room monitor.",watch:"Exceptions only.",advance:"Use the shared control when teams are ready."};
 return `<section class="panel facilitator"><div class="facilitatorHead"><div><div class="label">🎤 FACILITATION GUIDE · ${esc(g.time)}</div><div class="bigq">What you do right now</div></div><span class="momentBadge">${(s==="build"||s==="twist")&&m?`MOMENT ${r+1}/3 · ${esc(m.key)}`:esc(D.stages[s]||s)}</span></div><div class="facilGrid"><div><b>SAY</b><p>${esc(g.say)}</p></div><div><b>DO</b><p>${esc(g.do)}</p></div><div><b>WATCH FOR</b><p>${esc(g.watch)}</p></div><div><b>ADVANCE WHEN</b><p>${esc(g.advance)}</p></div></div></section>`;
}
function liveSubmissions(t,r){
 const s=snap.state.stage,field=(s==="twist"||s==="final-twist"||s==="reveal"||s==="final-reveal")?"repair":"build";
 const rows=Object.values(r[field+"Proposals"]||{}),votes=r[field+"Votes"]||{},counts={};Object.values(votes).forEach(v=>counts[v]=(counts[v]||0)+1);
 if(!rows.length)return `<div class="liveSubs empty"><div class="label">LIVE TEAM SUBMISSIONS</div><p>No ${field==="repair"?"repair":"answer"} submissions yet.</p></div>`;
 const max=Math.max(0,...rows.map(x=>counts[x.id]||0)),voted=Object.keys(votes).length,total=t.members?.length||0;
 return `<div class="liveSubs"><div class="liveSubsHead"><div><div class="label">LIVE TEAM SUBMISSIONS · ${field==="repair"?"REPAIR":"BUILD"}</div><p>${voted}/${total} votes cast. Winning answer is selected automatically when all votes are in.</p></div><span class="mini">${rows.length} ACTIVE ANSWER${rows.length===1?"":"S"}</span></div><div class="facultySubmissionGrid">${rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||(a.at||0)-(b.at||0)).map(p=>`<div class="facultySubmission ${(counts[p.id]||0)===max&&max>0?"leading":""}"><div class="tiny">${esc(p.name)} · ${counts[p.id]||0} VOTE${(counts[p.id]||0)===1?"":"S"}${(counts[p.id]||0)===max&&max>0?" · LEADING":""}</div><p>${esc(p.text)}</p></div>`).join("")}</div></div>`;
}
function progressSteps(p){
 return `<div class="progressSteps">${p.steps.map(([label,n,total])=>{const done=total>0&&n>=total;return `<div class="progressStep ${done?"done":n>0?"active":""}"><span>${done?"✓":n}</span><b>${esc(label)}</b><small>${n}/${total}</small></div>`}).join("")}</div>`;
}
function teamRows(){
 return roomProgress().rows.map(({team:t,progress:p})=>{const r=roundRec(t),members=(t.members||[]).map(m=>`<span class="mini">${esc(m.name)} · ${esc(t.roles?.[m.id]||"")}${m.isTest?" · TEST":""}</span>`).join(""),open=openTeamVersions.has(t.id)?" open":"";
 return `<div class="teamrow progressTeam ${p.ready?"teamReady":""}"><div class="teamrowHead"><div style="display:flex;align-items:center;gap:9px"><span class="boardCharm" style="--team:${t.color}">${esc(t.charm||"❔")}</span><div><b>${esc(t.name)}</b><div class="tiny">${esc(p.status)}</div></div></div><div><b>${t.position||0} spaces</b></div></div>${progressSteps(p)}${p.needs.length?`<div class="needsInline"><b>NEEDS:</b> ${p.needs.map(esc).join(" · ")}</div>`:`<div class="success compact">✓ Team is ready for the next shared moment.</div>`}<details class="teamDrill"><summary>VIEW TEAM DETAILS + SUBMISSIONS</summary><div class="actions">${members}</div>${liveSubmissions(t,r)}${r.build?`<div class="submission"><b>SELECTED BUILD</b><br>${esc(r.build)}${r.repair?`<br><br><b>SELECTED REPAIR</b><br>${esc(r.repair)}`:""}</div>`:""}<div class="actions"><button class="btn soft" onclick="bonus('${t.id}',1,'🧠 CONTEXT MVP')">🧠 CONTEXT MVP +1</button><button class="btn soft" onclick="bonus('${t.id}',1,'🔧 BEST RECOVERY')">🔧 BEST RECOVERY +1</button><button class="btn soft" onclick="bonus('${t.id}',1,'🔍 EVIDENCE DETECTIVE')">🔍 EVIDENCE DETECTIVE +1</button><button class="btn soft" onclick="bonus('${t.id}',-1,'UNDO')">UNDO 1</button></div></details></div>`}).join("");
}
function rememberTeamVersion(teamId,isOpen){if(isOpen)openTeamVersions.add(teamId);else openTeamVersions.delete(teamId)}
function playerLobby(){if(snap.state.teamsFormed)return"";const players=snap.players||[];return `<section class="panel"><div class="label">LOBBY</div><div class="bigq">${snap.playing||0} ready to play · ${snap.watching||0} watching</div><div class="actions">${players.map(p=>`<span class="mini">${p.mode==="watch"?"👀":"🎮"} ${esc(p.name)}${p.isTest?" · TEST":""}</span>`).join("")||"<p>Waiting for people to join…</p>"}</div><div class="actions"><button class="btn purple" onclick="formTeams()">FORM BALANCED VIRTUAL TEAMS →</button></div><p>Default target is about five players per team. Late arrivals are automatically placed on the smallest team.</p></section>`}
function testLab(){
 const tests=(snap.players||[]).filter(p=>p.isTest&&p.mode==="play"),testWatch=(snap.players||[]).filter(p=>p.isTest&&p.mode==="watch").length,on=!!snap.state.testMode;
 return `<section class="panel" style="border-color:${on?'var(--red)':'var(--teal)'}"><div class="label">🧪 INSTRUCTOR TEST LAB</div><div class="bigq">${on?'TEST MODE IS ON':'Test the whole game without a full room.'}</div>
 <div class="${on?'chaos':'success'}"><b>${on?'⚠️ Missing player activity will be auto-filled when you advance.':'Normal classroom rules are still enforced.'}</b><br>${on?'You can manually play as one student, then use the regular Game Master Next button. Context Quest will supply missing votes, approvals, repairs, and judgment ballots only for flow testing.':'Turn on Test Mode when you want to click through the experience without waiting for every simulated student.'}</div>
 <div class="actions"><button class="btn ${on?'red':'teal'}" onclick="toggleTestMode(${on?'false':'true'})">${on?'TURN TEST MODE OFF':'TURN TEST MODE ON'}</button></div>
 <p>Create fake participants, form teams, populate phases automatically, or jump into any simulated student seat yourself.</p>
 <div class="actions"><button class="btn soft" onclick="createTestPlayers(10,0)">+10 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(20,0)">+20 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(30,0)">+30 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(10,5)">+10 PLAYERS + 5 WATCHERS</button></div>
 <div class="teammeta"><span class="mini">TEST PLAYERS ${tests.length}</span><span class="mini">TEST WATCHERS ${testWatch}</span><span class="mini">CURRENT STAGE ${esc(D.stages[snap.state.stage]||snap.state.stage)}</span><span class="mini">${on?'TEST MODE ON':'STRICT MODE'}</span></div>
 ${tests.length?`<div class="stage" style="margin-top:12px"><div class="label">PLAY AS A TEST PLAYER</div><p>Open one of these in a new tab. Make one real student action, then come back here and advance without waiting for everyone else.</p><div class="actions">${tests.slice(0,30).map(p=>`<a class="btn soft" style="text-decoration:none" target="_blank" rel="noopener" href="/context-quest?testPlayer=${encodeURIComponent(p.id)}">🎮 ${esc(p.name)}</a>`).join("")}</div></div>`:""}
 <div class="actions"><button class="btn teal" onclick="simulateStage()" ${tests.length?"":"disabled"}>SIMULATE CURRENT PHASE</button><button class="btn red" onclick="clearTestPlayers()" ${tests.length||testWatch?"":"disabled"}>REMOVE TEST PLAYERS</button></div>
 <p class="tiny">Test Mode is deliberately separate from normal classroom play and resets to OFF when you reset the game.</p></section>`;
}
async function toggleTestMode(enabled){try{await req("/test-mode",{method:"POST",body:JSON.stringify({enabled})});toast(enabled?"Test Mode ON — missing activity will auto-fill.":"Test Mode OFF — normal gates restored.");await refresh(true)}catch(e){toast(e.message)}}
async function createTestPlayers(count,watchers){try{const j=await req("/test-players",{method:"POST",body:JSON.stringify({count,watchers})});toast(`${j.created} test players added.`);await refresh(true)}catch(e){toast(e.message)}}
async function simulateStage(){try{const j=await req("/simulate-test-stage",{method:"POST",body:"{}"});toast(`Simulated ${j.simulated} test players for ${j.stage}.`);await refresh(true)}catch(e){toast(e.message)}}
async function clearTestPlayers(){if(!confirm("Remove all simulated test players and watchers?"))return;try{const j=await req("/clear-test-players",{method:"POST",body:"{}"});toast(`Removed ${j.removed} test participants.`);await refresh(true)}catch(e){toast(e.message)}}

function render(){if(!snap)return;const c=counts(),next=nextControl(),stage=D.stages[snap.state.stage]||snap.state.stage,allCustom=(snap.teams||[]).length>0&&(snap.teams||[]).every(t=>t.customized),testMode=!!snap.state.testMode,canStart=allCustom||testMode;$("#app").innerHTML=mast(`<section class="phasecard"><div class="label">LIVE STATE</div><div class="bigq" style="color:white">${esc(stage)}${snap.state.round<3&&["build","test","twist","check","reveal"].includes(snap.state.stage)?` · MOMENT ${snap.state.round+1} / 3`:""}</div><p>${esc(stageHelp())}</p></section>${facultyQuickStart()}${facilitationGuide()}${playerLobby()}<section class="panel"><div class="statusgrid">${stat("Joined",c.joined)}${stat("Playing",c.playing)}${stat("Watching",c.watching)}${stat("Teams",c.teams)}${stat("Ready",c.ready)}${stat("Proposals",c.proposals)}${stat("Tested",c.tested)}${stat("Ballots",c.ballots)}</div><div class="actions" style="margin-top:18px">${snap.state.stage==="lobby"&&snap.state.teamsFormed?`<button class="btn ${testMode&&!allCustom?"teal":"purple"}" onclick="advance('tutorial',0)" ${canStart?"":"disabled"}>${allCustom?"START TUTORIAL →":testMode?"🧪 START TUTORIAL · AUTO-FILL TEAM SETUP →":"WAITING FOR TEAM NAME + CHARM"}</button>`:""}${next?`<button class="btn purple" onclick="advance('${next[1]}',${next[2]})">${next[0]} →</button>`:""}<button class="btn red" onclick="resetGame()">RESET GAME</button></div></section><section class="panel"><div class="label">VIRTUAL TEAMS</div><div class="bigq">Room status</div>${teamRows()||"<p>Teams appear here after you form them.</p>"}</section>`)}
async function formTeams(){try{await req("/form-teams",{method:"POST",body:JSON.stringify({teamSize:5})});toast("Teams formed.");await refresh(true)}catch(e){toast(e.message)}}
async function reviewTeam(teamId,field){try{await req("/review-team",{method:"POST",body:JSON.stringify({teamId,field})});toast("Winning answer reviewed and approved.");await refresh(true)}catch(e){toast(e.message)}}
async function advance(stage,round){try{await req("/control",{method:"POST",body:JSON.stringify({stage,round})});toast("Game advanced.");await refresh(true)}catch(e){toast(e.message)}}
async function bonus(teamId,delta,label=""){await req("/bonus",{method:"POST",body:JSON.stringify({teamId,delta,label})});toast(delta>0?`${label} awarded.`:"One bonus undone.");await refresh(true)}
async function resetGame(){if(!confirm("Reset Context Quest and remove all players, teams, and scores?"))return;await req("/reset",{method:"POST",body:"{}"});toast("Game reset.");await refresh(true)}
function stableSnapshot(x){if(!x)return "";const clone=JSON.parse(JSON.stringify(x));delete clone.generatedAt;for(const p of clone.players||[])delete p.lastSeen;for(const t of clone.teams||[])for(const m of t.members||[])delete m.lastSeen;return JSON.stringify(clone)}
async function refresh(force=false){try{const n=await req("/snapshot"),sig=stableSnapshot(n);snap=n;if(force||sig!==last){last=sig;render()}}catch(e){console.error(e)}}refresh(true);setInterval(refresh,850);