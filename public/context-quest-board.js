const SESSION_KEY=new URLSearchParams(location.search).get("session")||"context-quest-live";const API="/api/session/"+encodeURIComponent(SESSION_KEY)+"/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="",shownPositions={},moveTimer=null,moveCursor=0;
const BOARD_SPACES=[
 ["ENTER LAB","start"],
 ["SUBMIT ONE ANSWER","who"],["TEAM VOTE","check"],["TEST CHAMBER","test"],["THE HAUNTING · SUBMIT REPAIR","chaos"],["EVIDENCE CHECK · REVEAL","reveal"],
 ["SUBMIT ONE ANSWER","who"],["TEAM VOTE","check"],["TEST CHAMBER","test"],["THE HAUNTING · SUBMIT REPAIR","chaos"],["EVIDENCE CHECK · REVEAL","reveal"],
 ["SUBMIT ONE ANSWER","who"],["TEAM VOTE","check"],["TEST CHAMBER","test"],["THE HAUNTING · SUBMIT REPAIR","chaos"],["EVIDENCE CHECK · REVEAL","reveal"],
 ["FINAL BOSS","corner"],["TEAM VOTE","check"],["TEST CHAMBER · FINAL CURSE","chaos"],["EVIDENCE CHECK · CASE CLOSED","reveal"]
];
const COORDS=[[6,6],[6,5],[6,4],[6,3],[6,2],[6,1],[5,1],[4,1],[3,1],[2,1],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,6],[3,6],[4,6],[5,6]];
async function req(){const r=await fetch(API+"/snapshot");return r.json()}
function targetPosition(t){return Math.min(19,Math.max(0,Number(t?.boardPosition)||0))}
function shownPosition(t){return Math.min(19,Math.max(0,Number(shownPositions[t.id]??targetPosition(t))))}
function initializeShownPositions(){
 for(const t of snap?.teams||[])if(shownPositions[t.id]===undefined)shownPositions[t.id]=targetPosition(t);
 for(const id of Object.keys(shownPositions))if(!(snap?.teams||[]).some(t=>t.id===id))delete shownPositions[id];
}
function animateBoardPositions(){
 if(moveTimer||!snap)return;
 const step=()=>{
   moveTimer=null;
   const teams=snap?.teams||[];
   const movers=teams.filter(t=>shownPosition(t)!==targetPosition(t));
   if(!movers.length)return;
   const t=movers[moveCursor%movers.length];moveCursor++;
   const current=shownPosition(t),target=targetPosition(t);
   shownPositions[t.id]=current+(target>current?1:-1);
   render();
   moveTimer=setTimeout(step,320);
 };
 moveTimer=setTimeout(step,120);
}
function mast(body){return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">🎃 THE HAUNTED PROMPT LAB · LIVE BOARD</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="pill">🎮 ${snap?.playing||0} PLAYING</div><div class="pill">👀 ${snap?.watching||0} WATCHING</div></div></header>${body}`}
function phaseData(){
 const s=snap.state.stage,r=D.rounds[snap.state.round];let title=D.stages[s]||s,sub="";
 if(["build","test","twist","check","reveal"].includes(s)){title=`CASE ${snap.state.round+1} / 3 · ${r.icon} ${r.key}`;sub=s==="build"?"Investigation teams are finding clues, voting, and testing.":s==="test"?"Teams are in the Test Chamber.":s==="twist"?"👻 THE HAUNTING: "+r.twist:s==="check"?"EVIDENCE CHECK: audience · goal · constraints · evidence":s==="reveal"?"🔮 EVIDENCE + SCORE REVEAL!":""}
 if(s==="lobby"){title=snap.state.teamsFormed?"ASSEMBLE YOUR INVESTIGATION TEAM":"ENTER THE HAUNTED PROMPT LAB";sub=snap.state.teamsFormed?"Choose your team name + Halloween charm on your device.":"classroom.itsbadlabs.com/context-quest · choose INVESTIGATE or OBSERVE"}
 if(s==="tutorial"){title="🔦 INVESTIGATOR TRAINING";sub="Learn the AI context loop by solving the first mini-case."}
 if(s==="final-build"){title="👾 THE CURSE OF THE CONFIDENT AI";sub="Use every clue: WHO · GOAL · SITUATION · CONSTRAINTS · OUTPUT · CHECK"}
 if(s==="final-test"){title="FINAL TEST";sub="Run the team-selected design."}
 if(s==="final-twist"){title="🚨 THE FINAL CURSE";sub=D.final.twist}
 if(s==="final-check"){title="FINAL JUDGMENT";sub="Every active player completes the Evidence Check. Score and board progress stay separate."}
 if(s==="final-reveal"){title="🏆 FINAL EVIDENCE REVEAL";sub="Who used context, verification, and adaptation best?"}
 if(s==="complete"){title="🎃 CASE CLOSED · CONTEXT BROKE THE CURSE";sub="WHO → GOAL → SITUATION → CONSTRAINTS → OUTPUT → CHECK"}
 return {title,sub}
}
function centerPanel(){
 const {title,sub}=phaseData(),teams=[...(snap.teams||[])].sort((a,b)=>(b.totalPoints||0)-(a.totalPoints||0)||(b.boardPosition||0)-(a.boardPosition||0));
 const chips=teams.map((t,i)=>`<div class="boardCenterTeam"><span class="boardCharm" style="--team:${t.color}">${esc(t.charm||"❔")}</span><span><b>#${i+1} ${esc(t.name)}</b><small>SCORE ${t.totalPoints||0} · SPACE ${shownPosition(t)}${shownPosition(t)!==targetPosition(t)?` → ${targetPosition(t)}`:""} · ${esc(D.progressLabels?.[t.progressKey]||String(t.progressKey||"WAITING").replaceAll("_"," "))}${(t.awards||[]).length?` · 🏅 ${t.awards.length}`:""}</small></span></div>`).join("");
 return `<div class="boardCenter"><div class="tiny">CONTEXT QUEST · THE HAUNTED PROMPT LAB</div><div class="boardCenterTitle">${esc(title)}</div><p>${esc(sub)}</p><div class="boardCenterTeams">${chips||'<span class="mini">Waiting for teams…</span>'}</div></div>`
}
function boardSpace(i){
 const [label,type]=BOARD_SPACES[i],coord=COORDS[i],teams=(snap.teams||[]).filter(t=>shownPosition(t)===i);
 const pieces=teams.map(t=>`<div class="boardPiece" title="${esc(t.name)}" style="--team:${t.color}"><span>${esc(t.charm||"❔")}</span><small>${esc(t.name)}</small></div>`).join("");
 return `<div class="boardSquare type-${type}" style="grid-row:${coord[0]};grid-column:${coord[1]}"><div class="spaceStripe"></div><div class="spaceLabel">${esc(label)}</div><div class="boardPieces">${pieces}</div></div>`
}
function board(){
 if(!snap.state.teamsFormed)return `<section class="panel"><div class="label">THE ROOM IS FILLING</div><div class="bigq">Choose PLAY or WATCH on your device.</div><div class="arrivalgrid">${(snap.players||[]).map(p=>`<div class="arrival ${p.mode==="watch"?"watch":""}">${p.mode==="watch"?"👀":"🎮"} ${esc(p.name)}</div>`).join("")||"<div class='arrival'>Waiting for the first player…</div>"}</div></section>`;
 return `<section class="tabletopWrap"><div class="tabletopBoard">${BOARD_SPACES.map((_,i)=>boardSpace(i)).join("")}${centerPanel()}</div></section>`
}
function teamSetup(){
 if(snap.state.stage!=="lobby"||!snap.state.teamsFormed)return"";
 return `<section class="panel"><div class="label">🔮 INVESTIGATION TEAM SETUP</div><div class="teamtiles">${(snap.teams||[]).map(t=>`<div class="teamtile" style="border-color:${t.color}"><div class="teamtileTitle"><span class="boardCharm large" style="--team:${t.color}">${esc(t.charm||"❔")}</span><div><b>${esc(t.name)}</b><div class="tiny">${t.customized?"READY":"CHOOSING NAME + CHARM…"}</div></div></div><div class="roster">${(t.members||[]).map(m=>`<span class="mini">${esc(m.name)}</span>`).join("")}</div></div>`).join("")}</div></section>`
}
function leaders(){
 if(!snap.state.teamsFormed||snap.state.stage==="lobby")return"";
 const teams=[...(snap.teams||[])].sort((a,b)=>(b.totalPoints||0)-(a.totalPoints||0)||(b.boardPosition||0)-(a.boardPosition||0));
 return `<section class="panel"><div class="label">STANDINGS</div><div class="leaderboard">${teams.map((t,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div style="display:flex;gap:10px;align-items:center"><span class="boardCharm" style="--team:${t.color}">${esc(t.charm||"❔")}</span><div><b>${esc(t.name)}</b><div class="tiny">${t.members?.length||0} PLAYERS</div></div></div><div><b>${t.totalPoints||0}</b> pts · space ${shownPosition(t)}${shownPosition(t)!==targetPosition(t)?` → ${targetPosition(t)}`:""}</div><div class="tiny">${esc(D.progressLabels?.[t.progressKey]||String(t.progressKey||"WAITING").replaceAll("_"," "))}</div></div>`).join("")}</div></section>`
}
function stableSnapshot(x){if(!x)return"";const y=JSON.parse(JSON.stringify(x));delete y.generatedAt;for(const p of y.players||[])delete p.lastSeen;for(const t of y.teams||[])for(const m of t.members||[])delete m.lastSeen;return JSON.stringify(y)}
function render(){if(!snap)return;$("#app").innerHTML=mast(board()+teamSetup()+leaders())}
async function refresh(){try{const n=await req(),sig=stableSnapshot(n);if(sig!==last){snap=n;last=sig;initializeShownPositions();render();animateBoardPositions()}}catch(e){console.error(e)}}refresh();setInterval(refresh,750);