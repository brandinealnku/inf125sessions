const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="",openTeamVersions=new Set(),gmUi={gameMenu:false,facGuide:false,quickStart:false};
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
function rememberGmUi(key,isOpen){gmUi[key]=!!isOpen}
function mast(body){const test=snap?.state?.testMode?`<div class="testModeBanner">🧪 TEST MODE IS ON IN THE LIVE ROOM · RESET BEFORE CLASS</div>`:"";return `<header class="mast gmMast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">🎃 HAUNTED PROMPT LAB · GAME MASTER</div></div><div class="actions"><a class="btn soft" style="text-decoration:none" href="/context-quest/board" target="_blank">PROJECTED BOARD ↗</a><details class="gameMenu"${gmUi.gameMenu?" open":""} ontoggle="rememberGmUi('gameMenu',this.open)"><summary class="btn soft">GAME CONTROLS ▾</summary><div class="gameMenuPop"><a class="btn teal" style="text-decoration:none" href="/context-quest/test">🧪 TEST SANDBOX</a><button class="btn red" onclick="resetGame()">RESET LIVE ROOM</button><p class="tiny">Reset removes live players, teams, scores, and current game progress.</p></div></details></div></header>${test}${body}`}
function stat(label,value){return `<div class="stat"><span class="tiny">${label}</span><b>${value}</b></div>`}
function roundRec(t){const final=String(snap.state.stage).startsWith("final"),key=final?"final":String(snap.state.round||0);return t.rounds?.[key]||{}}
function counts(){const teams=snap.teams||[],players=snap.players||[],playing=players.filter(p=>p.mode==="play"),r=t=>roundRec(t);return{joined:players.length,playing:playing.length,watching:players.filter(p=>p.mode==="watch").length,teams:teams.length,ready:playing.filter(p=>p.tutorialDone).length,proposals:teams.reduce((n,t)=>n+Object.keys(r(t).buildProposals||{}).length,0),tested:teams.reduce((n,t)=>n+Object.keys(r(t).tested||{}).length,0),repairs:teams.reduce((n,t)=>n+Object.keys(r(t).repairProposals||{}).length,0),ballots:teams.reduce((n,t)=>n+Object.keys(r(t).checkBallots||{}).length,0)}}
function teamProgress(t){
 const r=roundRec(t),members=t.members||[],excused=r.excused||{},required=members.filter(m=>!excused[m.id]),total=required.length,s=snap.state.stage,phase=t.progressPhase||"waiting";
 const names=(ids)=>ids.map(id=>members.find(m=>m.id===id)?.name||"Player");
 const missing=(obj)=>required.filter(m=>!obj?.[m.id]).map(m=>m.id);
 let steps=[],needs=[],ready=false,status="WAITING",tone="neutral";
 if(s==="lobby"){ready=!!t.customized;status=ready?"TEAM SET":"SETUP";needs=ready?[]:["Choose team name + charm"];steps=[["Setup",ready?1:0,1]]}
 else if(s==="tutorial"){const n=members.filter(m=>m.tutorialDone).length;ready=members.length>0&&n===members.length;status=ready?"READY":"INVESTIGATOR TRAINING";needs=names(members.filter(m=>!m.tutorialDone).map(m=>m.id)).map(n=>`${n}: finish training`);steps=[["Training",n,members.length]]}
 else if(s==="build"||s==="final-build"){
   const answers=Object.values(r.buildProposals||{}).filter(p=>!excused[p.playerId]).length,votes=Object.keys(r.buildVotes||{}).filter(id=>!excused[id]).length,tested=Object.keys(r.tested||{}).filter(id=>!excused[id]).length;
   ready=phase==="ready-twist";status=ready?(s==="final-build"?"READY FOR FINAL CURSE":"READY FOR THE HAUNTING"):phase==="test"?"TEST CHAMBER":r.buildTie?"TIE — RESOLVE":"SUBMIT ONE ANSWER / TEAM VOTE";
   if(r.buildTie)needs=["Team vote is tied — someone must change a vote"];
   else if(phase==="build"){
     if(!answers)needs=["Waiting for any teammate to submit the first answer"];
     else {const mv=missing(r.buildVotes);needs=mv.length?names(mv).map(n=>`${n}: vote`):["Waiting for team selection"];}
   }else if(phase==="test"){
     const mt=missing(r.tested);needs=names(mt).map(n=>`${n}: test or review an AI response`);
   }
   steps=[["Answers",answers,total],["Votes",votes,total],["Tested",tested,total]];
 }
 else if(s==="twist"||s==="final-twist"){
   const answers=Object.values(r.repairProposals||{}).filter(p=>!excused[p.playerId]).length,votes=Object.keys(r.repairVotes||{}).filter(id=>!excused[id]).length,ballots=Object.keys(r.checkBallots||{}).filter(id=>!excused[id]).length;
   ready=phase==="ready-reveal";status=ready?"READY FOR EVIDENCE REVEAL":phase==="check"?"EVIDENCE CHECK":r.repairTie?"TIE — RESOLVE":"SUBMIT ONE REPAIR / TEAM VOTE";
   if(r.repairTie)needs=["Repair vote is tied — someone must change a vote"];
   else if(phase==="repair"){
     if(!answers)needs=["Waiting for any teammate to submit the first repair"];
     else {const mv=missing(r.repairVotes);needs=mv.length?names(mv).map(n=>`${n}: vote on repair`):["Waiting for repair selection"];}
   }else if(phase==="check"){
     const mb=missing(r.checkBallots);needs=names(mb).map(n=>`${n}: submit Evidence Check`);
   }
   steps=[["Repairs",answers,total],["Votes",votes,total],["Checks",ballots,total]];
 }
 else if(s==="reveal"||s==="final-reveal"){ready=true;status="EVIDENCE REVEAL";steps=[["Reveal",1,1]]}
 else if(s==="complete"){ready=true;status="CASE CLOSED";steps=[["Complete",1,1]]}
 if(t.progressKey)status=D.progressLabels?.[t.progressKey]||String(t.progressKey).replaceAll("_"," ");
 tone=ready?"ready":needs.length?"working":"neutral";
 return {phase,ready,status,needs,steps,excused,total};
}
function roomProgress(){
 const teams=snap.teams||[],rows=teams.map(t=>({team:t,progress:teamProgress(t)})),ready=rows.filter(x=>x.progress.ready).length;
 const needs=rows.flatMap(x=>x.progress.needs.map(n=>({teamId:x.team.id,team:x.team.name,charm:x.team.charm||"❔",text:n})));
 const grouped=rows.filter(x=>x.progress.needs.length).map(x=>({team:x.team,items:x.progress.needs}));
 const active=rows.reduce((n,x)=>n+x.progress.total,0);
 const completed=rows.reduce((n,x)=>{
   const p=x.progress,t=x.team,r=roundRec(t),s=snap.state.stage,exc=p.excused||{};
   const req=(t.members||[]).filter(m=>!exc[m.id]);
   if(s==="build"||s==="final-build"){
     if(p.phase==="ready-twist")return n+req.length;
     if(p.phase==="test")return n+req.filter(m=>!!r.tested?.[m.id]).length;
     return n+req.filter(m=>!!r.buildVotes?.[m.id]).length;
   }
   if(s==="twist"||s==="final-twist"){
     if(p.phase==="ready-reveal")return n+req.length;
     if(p.phase==="check")return n+req.filter(m=>!!r.checkBallots?.[m.id]).length;
     return n+req.filter(m=>!!r.repairVotes?.[m.id]).length;
   }
   if(s==="tutorial")return n+(t.members||[]).filter(m=>m.tutorialDone).length;
   if(s==="reveal"||s==="final-reveal"||s==="complete")return n+req.length;
   return n;
 },0);
 return {rows,total:teams.length,ready,needs,grouped,active,completed,allReady:teams.length>0&&ready===teams.length};
}
function sharedAction(){
 const s=snap.state.stage,r=snap.state.round,room=roomProgress(),test=!!snap.state.testMode;
 if(s==="tutorial")return {label:"🧛 START CASE 1 · THE MYSTERY PROMPT →",stage:"build",round:0,ready:room.allReady||test,forceable:true};
 if(s==="build")return {label:"👻 REVEAL THE HAUNTING",stage:"twist",round:r,ready:room.allReady||test,forceable:true};
 if(s==="twist")return {label:"🔮 REVEAL EVIDENCE + SCORE",stage:"reveal",round:r,ready:room.allReady||test,forceable:true};
 if(s==="reveal")return r<2?{label:`START CASE ${r+2} →`,stage:"build",round:r+1,ready:true}:{label:"👾 START FINAL BOSS · THE CURSE OF THE CONFIDENT AI →",stage:"final-build",round:3,ready:true};
 if(s==="final-build")return {label:"🚨 REVEAL THE FINAL CURSE",stage:"final-twist",round:3,ready:room.allReady||test,forceable:true};
 if(s==="final-twist")return {label:"🏆 REVEAL FINAL EVIDENCE + SCORE",stage:"final-reveal",round:3,ready:room.allReady||test,forceable:true};
 if(s==="final-reveal")return {label:"🎃 CLOSE THE CASE →",stage:"complete",round:3,ready:true};
 return null;
}
function stageHelp(){
 const s=snap.state.stage,r=snap.state.round,room=roomProgress();
 const base={
  lobby:snap.state.teamsFormed?(snap.state.testMode?"Test Mode is on. Start when ready; missing team setup can auto-fill.":"Teams are choosing names + charms."): "Everyone joins individually; form teams when most players are in.",
  tutorial:"Students complete Investigator Training. Launch Case 1 when the room is ready.",
  build:"Teams investigate independently: examine clues → submit → vote → selected answer → test. You do not advance individual teams.",
  twist:"The Haunting is live: new context has appeared. Teams automatically move through repair → vote → evidence check.",
  reveal:"Evidence and score are visible to the room; board charms show progress separately. Debrief the context lesson briefly, award an optional bonus, then launch the next case.",
  "final-build":"The Curse of the Confident AI is live. Teams build, vote, select, and test automatically.",
  "final-twist":"Final consequence is live. Teams repair, vote, and judge automatically.",
  "final-reveal":"Final evidence and score are revealed. Close on the learning, not only the winner.",
  complete:"Game complete."
 }[s]||"";
 return room.total?`${base} ${room.ready}/${room.total} teams are ready for the next shared action.`:base;
}
function facultyQuickStart(){
 return `<details class="panel facultyQuick"${gmUi.quickStart?" open":""} ontoggle="rememberGmUi('quickStart',this.open)"><summary><b>📋 FACULTY QUICK START</b> · hybrid Game Master model</summary><div class="playerGuideGrid">
 <div><b>AUTOMATED</b><p>Teams move themselves through submitting, voting, answer selection, testing, repair, and judgment.</p></div>
 <div><b>YOU CONTROL</b><p>Start each case, reveal the Haunting, reveal evidence + score, launch the next case, and launch the Final Boss.</p></div>
 <div><b>WATCH PROGRESS</b><p>Use the Room Monitor to see who is ready, which players still owe an action, and which teams have a tie.</p></div>
 <div><b>INSPECT, DON'T TRAFFIC-CONTROL</b><p>Open a team to see live submissions and vote counts. Winning answers are selected automatically; instructor approval is not required.</p></div>
 <div><b>OVERRIDE ONLY WHEN NEEDED</b><p>If a device dies or someone leaves, excuse that individual player for the current case. Use whole-room override only as a last resort. Incomplete teams receive no automatic credit for unfinished judgment.</p></div>
 <div><b>KEEP THE THEATER</b><p>The room should experience Hauntings and evidence reveals together. Automate workflow; human-control the theater.</p></div>
 </div></details>`;
}
function facilitationGuide(){
 const s=snap.state.stage,r=snap.state.round,m=D.rounds?.[r],room=roomProgress();
 let g={time:"",say:"",do:"",watch:"",advance:""};
 if(s==="lobby")g={time:"5–7 min",say:"“Welcome to the Haunted Prompt Lab. Join on your own device. Choose INVESTIGATE unless you’re observing.”",do:"Form teams once most people are in; let teams choose name + charm.",watch:"Late arrivals or anyone unsure which team they are on.",advance:"Every team has found one another and finished team setup."};
 else if(s==="tutorial")g={time:"4–5 min",say:"“Your investigator training will teach the rules. Follow your screen; do not memorize anything.”",do:"Let the tutorial teach the loop.",watch:"Anyone stuck on the basic interaction.",advance:"The room monitor shows teams ready, then launch Case 1."};
 else if(s==="build"||s==="final-build")g={time:s==="final-build"?"5–6 min":"~8 min",say:s==="final-build"?"“Use everything you learned. Your team will move itself into Test when voting resolves.”":"“Investigate the clues. Once everyone votes, your strongest answer is selected automatically and your team moves into the Test Chamber.”",do:"Circulate. Watch the Room Monitor rather than clicking teams forward.",watch:"Ties, missing votes, students who have not tested, or one person dominating.",advance:room.allReady?"All teams are ready — reveal the Haunting.":`${room.ready}/${room.total} teams ready. Wait; if one student is blocked by absence/device failure, use Excuse This Case.`};
 else if(s==="twist"||s==="final-twist")g={time:"5–6 min",say:"“The lab is haunted: new context just appeared. Adapt what changed; do not start over unless you need to.”",do:"Let teams repair, vote, and judge. Their internal steps advance automatically.",watch:"Tied votes, missing judgment ballots, or teams ignoring consequences.",advance:room.allReady?"All teams are ready — reveal evidence and score.":`${room.ready}/${room.total} teams ready for reveal.`};
 else if(s==="reveal"||s==="final-reveal")g={time:"2–3 min",say:"“Look up. The score reflects completion and bonuses; the charm shows progress through the game.”",do:"Debrief one insight and optionally award one AI-literacy bonus.",watch:"Over-rewarding humor or polish instead of context/evidence.",advance:s==="final-reveal"?"Finish with the learning model.":"Launch the next shared case when the room is reset."};
 else if(s==="complete")g={time:"5 min",say:"“What changed when the context changed?”",do:"Let students articulate WHO → GOAL → SITUATION → CONSTRAINTS → OUTPUT → CHECK.",watch:"Turning the ending into a lecture.",advance:"Game over."};
 else g={time:"2–4 min",say:"“Follow your screen and talk to your team.”",do:"Watch the room monitor.",watch:"Exceptions only.",advance:"Use the shared control when teams are ready."};
 return `<section class="panel facilitator compactFac"><div class="facilitatorHead"><div><div class="label">🎤 INSTRUCTOR CUE · ${esc(g.time)}</div><div class="cueLine">${esc(g.say)}</div></div><span class="momentBadge">${(s==="build"||s==="twist")&&m?`CASE ${r+1}/3 · ${esc(m.key)}`:esc(D.stages[s]||s)}</span></div><details class="fullFac"${gmUi.facGuide?" open":""} ontoggle="rememberGmUi('facGuide',this.open)"><summary>EXPAND FULL FACILITATION GUIDE</summary><div class="facilGrid"><div><b>SAY</b><p>${esc(g.say)}</p></div><div><b>DO</b><p>${esc(g.do)}</p></div><div><b>WATCH FOR</b><p>${esc(g.watch)}</p></div><div><b>ADVANCE WHEN</b><p>${esc(g.advance)}</p></div></div></details></section>`;
}
function liveSubmissions(t,r){
 const s=snap.state.stage,field=(s==="twist"||s==="final-twist"||s==="reveal"||s==="final-reveal")?"repair":"build";
 const excused=r.excused||{},required=(t.members||[]).filter(m=>!excused[m.id]),allowed=new Set(required.map(m=>m.id));
 const rows=Object.values(r[field+"Proposals"]||{}).filter(p=>!excused[p.playerId]),votes=r[field+"Votes"]||{},counts={};
 for(const [voterId,proposalId] of Object.entries(votes))if(allowed.has(voterId))counts[proposalId]=(counts[proposalId]||0)+1;
 if(!rows.length)return `<div class="liveSubs empty"><div class="label">LIVE TEAM SUBMISSIONS</div><p>No ${field==="repair"?"repair":"answer"} submissions yet.</p></div>`;
 const max=Math.max(0,...rows.map(x=>counts[x.id]||0)),voted=Object.keys(votes).filter(id=>allowed.has(id)).length,total=required.length;
 return `<div class="liveSubs"><div class="liveSubsHead"><div><div class="label">LIVE TEAM SUBMISSIONS · ${field==="repair"?"REPAIR":"BUILD"}</div><p>${voted}/${total} active players have voted. Winning answer is selected automatically when all active players vote.</p></div><span class="mini">${rows.length} ACTIVE ANSWER${rows.length===1?"":"S"}</span></div><div class="facultySubmissionGrid">${rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||(a.at||0)-(b.at||0)).map(p=>`<div class="facultySubmission ${(counts[p.id]||0)===max&&max>0?"leading":""}"><div class="tiny">${esc(p.name)} · ${counts[p.id]||0} VOTE${(counts[p.id]||0)===1?"":"S"}${(counts[p.id]||0)===max&&max>0?" · LEADING":""}</div><p>${esc(p.text)}</p></div>`).join("")}</div></div>`;
}
function progressSteps(p){
 return `<div class="progressSteps">${p.steps.map(([label,n,total])=>{const done=total>0&&n>=total;return `<div class="progressStep ${done?"done":n>0?"active":""}"><span>${done?"✓":n}</span><b>${esc(label)}</b><small>${n}/${total}</small></div>`}).join("")}</div>`;
}
function teamRows(){
 return roomProgress().rows.map(({team:t,progress:p})=>{const r=roundRec(t),members=(t.members||[]).map(m=>{const x=!!p.excused[m.id];return `<span class="mini playerManage ${x?"excused":""}"><b>${esc(m.name)}</b> · ${esc(t.roles?.[m.id]||"")}${m.isTest?" · TEST":""} ${x?"· EXCUSED":""}<button class="miniAction" onclick="excusePlayer('${t.id}','${m.id}',${x?"false":"true"})">${x?"RE-ACTIVATE":"EXCUSE THIS CASE"}</button></span>`}).join(""),open=openTeamVersions.has(t.id)?" open":"";
 return `<div class="teamrow progressTeam ${p.ready?"teamReady":""}" id="team-${t.id}"><div class="teamrowHead"><div style="display:flex;align-items:center;gap:9px"><span class="boardCharm" style="--team:${t.color}">${esc(t.charm||"❔")}</span><div><b>${esc(t.name)}</b><div class="tiny">${esc(p.status)}</div></div></div><div><b>${t.totalPoints||0} pts</b><div class="tiny">SPACE ${t.boardPosition||0}</div></div></div>${progressSteps(p)}${p.needs.length?`<div class="needsInline"><b>NEEDS:</b> ${p.needs.map(esc).join(" · ")}</div>`:`<div class="success compact">✓ Team is ready for the next shared case.</div>`}<details class="teamDrill"${open} ontoggle="rememberTeamVersion('${t.id}',this.open)"><summary>VIEW TEAM DETAILS + SUBMISSIONS</summary><p class="tiny">If a student leaves or has a device/login failure, <b>Excuse This Case</b> removes only that student from this case's required vote/test/check denominator. You can re-activate them.</p><div class="actions">${members}</div>${liveSubmissions(t,r)}${r.build?`<div class="submission"><b>SELECTED BUILD</b><br>${esc(r.build)}${r.repair?`<br><br><b>SELECTED REPAIR</b><br>${esc(r.repair)}`:""}</div>`:""}${["reveal","final-reveal"].includes(snap.state.stage)?`<div class="bonusZone"><div class="label">OPTIONAL DEBRIEF BONUS</div><div class="actions"><button class="btn soft" onclick="bonus('${t.id}',1,'🔮 CONTEXT CLAIRVOYANT')">🔮 CONTEXT CLAIRVOYANT +1</button><button class="btn soft" onclick="bonus('${t.id}',1,'🧟 CURSE BREAKER')">🧟 CURSE BREAKER +1</button><button class="btn soft" onclick="bonus('${t.id}',1,'👻 GHOST HUNTER')">👻 GHOST HUNTER +1</button><button class="btn soft" onclick="bonus('${t.id}',-1,'UNDO')">UNDO 1</button></div></div>`:`<p class="tiny">Bonus awards unlock during Evidence Reveal.</p>`}</details></div>`}).join("");
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

function roomMonitor(){
 const room=roomProgress(),pct=room.total?Math.round(room.ready/room.total*100):0;
 return `<section class="panel roomMonitor"><div class="roomMonitorHead"><div><div class="label">🎛️ ROOM PROGRESS</div><div class="bigq">${room.ready}/${room.total} teams ready</div><div class="roomStudentCount">${room.completed}/${room.active} active students complete their current action</div></div><div class="roomGauge"><span style="width:${pct}%"></span></div></div>
 <div class="teamProgressGrid">${room.rows.map(({team:t,progress:p})=>`<div class="teamProgressMini ${p.ready?"ready":""}"><span class="boardCharm" style="--team:${t.color}">${esc(t.charm||"❔")}</span><div><b>${esc(t.name)}</b><small>${esc(p.status)}</small></div><strong>${p.ready?"✓":"…"}</strong></div>`).join("")||"<p>No teams yet.</p>"}</div>
 ${room.grouped.length?`<div class="needsAttention"><div class="label">⚠️ NEEDS ATTENTION · ${room.needs.length} ACTION${room.needs.length===1?"":"S"}</div><div class="needsGroups">${room.grouped.map(g=>`<div class="needGroup"><div class="needGroupHead"><span class="boardCharm" style="--team:${g.team.color}">${esc(g.team.charm||"❔")}</span><b>${esc(g.team.name)}</b><span>${g.items.length}</span></div>${g.items.map(x=>`<div class="needItem">${esc(x)}</div>`).join("")}<button class="miniAction jumpTeam" onclick="document.getElementById('team-${g.team.id}')?.scrollIntoView({behavior:'smooth',block:'start'})">VIEW TEAM ↓</button></div>`).join("")}</div></div>`:`<div class="success"><b>🎉 All investigation teams are ready for the next shared action.</b></div>`}
 </section>`;
}
function sharedControls(){
 const allCustom=(snap.teams||[]).length>0&&(snap.teams||[]).every(t=>t.customized),testMode=!!snap.state.testMode,s=snap.state.stage;
 if(s==="lobby"&&snap.state.teamsFormed){
   const can=allCustom||testMode;
   return `<div class="gmActionBlock"><div class="label">YOUR NEXT SHARED ACTION</div><button class="btn ${testMode&&!allCustom?"teal":"purple"} gmPrimaryAction" onclick="advance('tutorial',0,false)" ${can?"":"disabled"}>${allCustom?"START INVESTIGATOR TRAINING →":testMode?"🧪 START TRAINING · AUTO-FILL TEAM SETUP →":"WAITING FOR TEAM NAME + CHARM"}</button></div>`;
 }
 const a=sharedAction();if(!a)return '<div class="gmActionBlock"><div class="label">YOUR NEXT SHARED ACTION</div><b>No instructor action needed right now.</b></div>';
 return `<div class="gmActionBlock"><div class="label">YOUR NEXT SHARED ACTION</div><div class="gmReadyText">${a.ready?"ROOM READY":"WAITING ON STUDENTS"}</div><button class="btn purple gmPrimaryAction" onclick="advance('${a.stage}',${a.round},false)" ${a.ready?"":"disabled"}>${a.label}</button>${!a.ready&&a.forceable?`<details class="problemMenu"><summary>HAVING A PROBLEM? ▾</summary><div class="problemPop"><p>Use <b>Excuse This Case</b> in a team drill-down for one student. Force the whole room only if the class cannot continue normally.</p><button class="btn red" onclick="advance('${a.stage}',${a.round},true)">FORCE ROOM FORWARD</button></div></details>`:""}</div>`;
}
function stageStats(){
 const teams=snap.teams||[],s=snap.state.stage,rows=teams.map(t=>({t,r:roundRec(t),p:teamProgress(t)}));
 const active=rows.reduce((n,x)=>n+x.p.total,0);
 if(s==="build"||s==="final-build"){
   const answers=rows.reduce((n,x)=>n+Object.values(x.r.buildProposals||{}).filter(p=>!x.p.excused[p.playerId]).length,0);
   const votes=rows.reduce((n,x)=>n+Object.keys(x.r.buildVotes||{}).filter(id=>!x.p.excused[id]).length,0);
   const tested=rows.reduce((n,x)=>n+Object.keys(x.r.tested||{}).filter(id=>!x.p.excused[id]).length,0);
   return [["Active",active],["Answers proposed",answers],["Votes",votes+"/"+active],["Responses reviewed",tested+"/"+active],["Teams ready",roomProgress().ready+"/"+roomProgress().total]];
 }
 if(s==="twist"||s==="final-twist"){
   const repairs=rows.reduce((n,x)=>n+Object.values(x.r.repairProposals||{}).filter(p=>!x.p.excused[p.playerId]).length,0);
   const votes=rows.reduce((n,x)=>n+Object.keys(x.r.repairVotes||{}).filter(id=>!x.p.excused[id]).length,0);
   const checks=rows.reduce((n,x)=>n+Object.keys(x.r.checkBallots||{}).filter(id=>!x.p.excused[id]).length,0);
   return [["Active",active],["Repairs proposed",repairs],["Repair votes",votes+"/"+active],["Evidence checks",checks+"/"+active],["Teams ready",roomProgress().ready+"/"+roomProgress().total]];
 }
 const cc=counts();return [["Joined",cc.joined],["Playing",cc.playing],["Watching",cc.watching],["Teams",cc.teams],["Training ready",cc.ready]];
}
function gameMasterConsole(){
 const room=roomProgress(),stage=D.stages[snap.state.stage]||snap.state.stage,caseLabel=snap.state.round<3&&["build","twist","reveal"].includes(snap.state.stage)?`CASE ${snap.state.round+1}/3`:"";
 return `<section class="gmConsole"><div class="gmWhere"><div class="label">LIVE GAME</div><div class="gmStage">${esc(stage)}</div><div class="tiny">${esc(caseLabel)}</div></div><div class="gmReadiness"><div class="label">ROOM READINESS</div><div class="gmReadyNumber">${room.ready}/${room.total||0} teams</div><div>${room.completed}/${room.active||0} active students complete</div></div>${sharedControls()}</section>`;
}
function render(){
 if(!snap)return;
 const stats=stageStats();
 $("#app").innerHTML=mast(`${gameMasterConsole()}${playerLobby()}${snap.state.teamsFormed?roomMonitor():""}${facilitationGuide()}<section class="panel stageStats"><div class="label">LIVE COUNTS</div><div class="statusgrid">${stats.map(([l,v])=>stat(l,v)).join("")}</div></section><section class="panel"><div class="label">INVESTIGATION TEAM DRILL-DOWN</div><div class="bigq">Progress + submissions</div>${teamRows()||"<p>Teams appear here after you form them.</p>"}</section>${facultyQuickStart()}`)}
async function formTeams(){try{await req("/form-teams",{method:"POST",body:JSON.stringify({teamSize:5})});toast("Teams formed.");await refresh(true)}catch(e){toast(e.message)}}
async function advance(stage,round,force=false){try{if(force&&!confirm("Advance the whole room even though some teams are not ready?"))return;await req("/control",{method:"POST",body:JSON.stringify({stage,round,force})});toast(force?"Room advanced with override.":"Shared classroom action advanced.");await refresh(true)}catch(e){toast(e.message)}}
async function bonus(teamId,delta,label=""){await req("/bonus",{method:"POST",body:JSON.stringify({teamId,delta,label})});toast(delta>0?`${label} awarded.`:"One bonus undone.");await refresh(true)}
async function excusePlayer(teamId,playerId,excused){try{await req("/excuse-player",{method:"POST",body:JSON.stringify({teamId,playerId,excused})});toast(excused?"Player excused for this case.":"Player re-activated.");await refresh(true)}catch(e){toast(e.message)}}
async function resetGame(){if(!confirm("RESET LIVE CLASSROOM? This removes all live players, teams, scores, and current game progress. This cannot be undone."))return;await req("/reset",{method:"POST",body:"{}"});toast("Game reset.");await refresh(true)}
function stableSnapshot(x){if(!x)return "";const clone=JSON.parse(JSON.stringify(x));delete clone.generatedAt;for(const p of clone.players||[])delete p.lastSeen;for(const t of clone.teams||[])for(const m of t.members||[])delete m.lastSeen;return JSON.stringify(clone)}
async function refresh(force=false){try{const n=await req("/snapshot"),sig=stableSnapshot(n);snap=n;if(force||sig!==last){last=sig;render()}}catch(e){console.error(e)}}refresh(true);setInterval(refresh,850);