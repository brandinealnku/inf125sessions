const API="/api/session/context-quest-live/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
let local=JSON.parse(localStorage.getItem("cq-player-v2")||"null")||{playerId:(crypto.randomUUID?crypto.randomUUID():"p-"+Date.now()+"-"+Math.random().toString(36).slice(2)),name:"",mode:"play",tutorial:0},snap=null,lastSig="",poller=null;
const ROLE_HELP={"PROMPT BUILDER":"Push the team toward a clear, usable prompt.","CONTEXT DETECTIVE":"Hunt for missing context that changes what good looks like.","SKEPTIC":"Challenge unsupported claims, assumptions, and false confidence.","CHAOS CAPTAIN":"Plan how the team will adapt when the situation changes.","JUDGE":"Keep the team honest about whether the AI response actually works."};
function save(){localStorage.setItem("cq-player-v2",JSON.stringify(local))}
function toast(t){const e=$("#toast");if(!e)return;e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function me(){return snap?.players?.find(p=>p.id===local.playerId)||null}
function team(){const p=me();return p?.teamId?snap?.teams?.find(t=>t.id===p.teamId)||null:null}
function role(){const t=team();return t?.roles?.[local.playerId]||""}
function rec(final=false){const t=team();if(!t)return {};return t.rounds?.[final?"final":String(snap?.state?.round||0)]||{}}
function mast(body){const t=team(),p=me();return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">YOUR DEVICE = YOUR CONTROLLER</div></div>${p?`<div style="display:flex;gap:7px;flex-wrap:wrap"><span class="teamchip">${esc(p.name)}</span>${t?`<span class="teamchip"><span class="dot" style="background:${t.color}"></span>${esc(t.name)}</span>`:""}${role()?`<span class="teamchip">🎭 ${esc(role())}</span>`:""}</div>`:""}</header>${body}<div class="footer">TALK TO YOUR TEAM · BUILD · VOTE · TEST · ADAPT · JUDGE · MOVE</div>`}
function joinScreen(){$("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">LIVE CLASSROOM PARTY GAME</div><h1>EVERYONE<br>PLAYS.</h1><p>Join on your own device. Context Quest will put you on a virtual team, give you a rotating role, and turn the whole room into one shared AI challenge.</p></section><section class="panel"><div class="label">YOUR NAME OR NICKNAME</div><input id="playerName" class="field" maxlength="50" placeholder="e.g. Brandi" value="${esc(local.name)}"><div class="label" style="margin-top:16px">HOW DO YOU WANT TO JOIN?</div><div class="actions"><button class="btn purple" onclick="joinGame('play')">🎮 PLAY</button><button class="btn soft" onclick="joinGame('watch')">👀 WATCH</button></div><p><b>PLAY</b> puts you on a team. <b>WATCH</b> gives faculty, staff, and visitors a live spectator view without affecting the competition.</p></section>`)}
async function joinGame(mode){const name=$("#playerName").value.trim();if(!name)return toast("Add your name or nickname.");local.name=name;local.mode=mode;save();await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name,mode})});await refresh(true)}
function teamLobby(){
 const t=team(),p=me();
 if(!snap.state.teamsFormed)return mast(`<section class="panel wait"><div class="icon">🎲</div><div class="label">YOU'RE IN</div><h2>Waiting for virtual teams.</h2><p>${snap.playing||0} players are ready. Your Game Master will form balanced teams when the room is set.</p></section>`);
 const members=(t?.members||[]).map(m=>`<span class="mini">${esc(m.name)}</span>`).join("");
 return mast(`<section class="panel hero"><div class="tiny">TEAM ASSIGNMENT</div><h1 style="color:${t?.color||"var(--purple)"}">${esc(t?.name||"YOUR TEAM")}</h1><p>You were grouped automatically. Find these people in the room and sit/turn toward each other.</p></section><section class="panel"><div class="label">YOUR TEAM</div><div class="actions">${members}</div><div class="success"><b>Your first role:</b> ${esc(role())}<br><span style="font-weight:700">${esc(ROLE_HELP[role()]||"")}</span></div><p>The role rotates every round. It gives you a lens—not exclusive control. Everyone still gets to contribute and vote.</p></section>`);
}
function spectator(){
 const st=snap.state.stage,t=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0));const phase=D.stages[st]||st;
 return mast(`<section class="panel hero"><div class="tiny">SPECTATOR MODE</div><h1>YOU'RE<br>IN THE ROOM.</h1><p>Watch the live game without changing team scores. You can switch to PLAY before teams are formed by rejoining.</p></section><section class="panel"><div class="label">CURRENT MOMENT</div><div class="bigq">${esc(phase)}</div><div class="leaderboard">${t.map((x,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div><b>${esc(x.name)}</b></div><div><b>${x.position||0}</b> spaces</div><div></div></div>`).join("")||"<p>Waiting for teams…</p>"}</div></section>`);
}
function tutorial(){
 const n=local.tutorial||0;let body="";
 if(n===0)body=`<div class="label">1 · BAD PROMPT</div><div class="bigq">“Tell me about AI.”</div><div class="gamecard"><small>GET CONTEXT · WHO</small><b>A first-year college student</b></div><p>Rewrite it so the AI knows who the answer is for.</p><textarea id="tDraft" class="prompt">Tell me about AI.</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I IMPROVED IT →</button></div>`;
 if(n===1)body=`<div class="label">2 · GET MORE CONTEXT</div><div class="gamecard"><small>GOAL</small><b>Help the student decide when AI is useful for school.</b></div><p>Add the goal.</p><textarea id="tDraft" class="prompt">${esc(local.tDraft||"")}</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I ADDED THE GOAL →</button></div>`;
 if(n===2)body=`<div class="label">3 · TEST IT</div><div class="success"><b>COPY → OPEN CHATGPT → PASTE → READ</b></div><textarea id="tDraft" class="prompt">${esc(local.tDraft||"")}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#tDraft')">COPY</button><button class="btn teal" onclick="tutorialNext()">I READ IT →</button></div>`;
 if(n===3)body=`<div class="label">4 · PLOT TWIST</div><div class="chaos"><h3>💥 NEW INFORMATION</h3><b>The student has never used AI before.</b></div><p>Repair the prompt.</p><textarea id="tDraft" class="prompt">${esc(local.tDraft||"")}</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I FIXED IT →</button></div>`;
 if(n>=4)body=`<div class="label">5 · YOU KNOW THE LOOP</div><div class="bigq">Your words weren’t necessarily bad. Your context was incomplete.</div><p>Now the competition begins. Your team will build, vote, test, adapt, judge, and move together.</p><div class="actions"><button class="btn green" onclick="finishTutorial()">READY ✓</button></div>`;
 $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">PLAYABLE TUTORIAL · ${Math.min(n+1,5)} OF 5</div>${body}</section>`);
}
function tutorialNext(){const d=$("#tDraft");if(d){local.tDraft=d.value.trim();if(!local.tDraft)return toast("Change the prompt first.");}local.tutorial=Math.min(4,(local.tutorial||0)+1);save();tutorial()}
async function finishTutorial(){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tutorialDone"})});local.tutorial=4;save();toast("Ready!");await refresh(true)}
function cards(rows){return `<div class="cards">${rows.map(([k,v])=>`<div class="gamecard"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>`}
function roleCard(){const r=role();return `<div class="rolecard"><div class="label">YOUR ROLE THIS ROUND</div><h3>${esc(r)}</h3><p>${esc(ROLE_HELP[r]||"Help your team make the best decision.")}</p></div>`}
function proposals(field){
 const r=rec(String(snap.state.stage).startsWith("final")),rows=Object.values(r[field+"Proposals"]||{}),votes=r[field+"Votes"]||{},mine=votes[local.playerId],counts={};Object.values(votes).forEach(v=>counts[v]=(counts[v]||0)+1);
 if(!rows.length)return '<div class="submission">No proposals yet. Be the first.</div>';
 return `<div class="proposalgrid">${rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)).map(p=>`<div class="proposal ${mine===p.id?"selected":""}"><div class="tiny">${esc(p.name)} · ${counts[p.id]||0} vote${(counts[p.id]||0)===1?"":"s"}</div><p>${esc(p.text)}</p><button class="btn ${mine===p.id?"green":"soft"}" onclick="voteProposal('${field}','${p.id}')">${mine===p.id?"✓ YOUR VOTE":"VOTE FOR THIS"}</button></div>`).join("")}</div>`;
}
function noteBox(){return `<div class="stage"><div class="label">TEAM SIGNAL</div><p>Spot something your teammates should notice? Drop a short note.</p><input id="note" class="field" maxlength="800" placeholder="Missing context, risk, idea, evidence concern…"><div class="actions"><button class="btn soft" onclick="sendNote()">SEND NOTE</button></div>${teamNotes()}</div>`}
function teamNotes(){const r=rec(String(snap.state.stage).startsWith("final")),notes=Object.values(r.notes||{});return notes.length?`<div class="actions">${notes.map(n=>`<span class="mini"><b>${esc(n.name)}:</b> ${esc(n.text)}</span>`).join("")}</div>`:""}
function buildScreen(final=false){
 const r=final?D.final:D.rounds[snap.state.round],rr=rec(final),title=final?"FINAL CHALLENGE":`ROUND ${snap.state.round+1} · ${r.icon} ${r.key}`;
 const context=final?D.final.cards:r.context;
 $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">${title}</div>${roleCard()}<div class="label">BAD PROMPT / STARTING CHALLENGE</div><div class="bigq">“${esc(r.bad)}”</div><div class="label">CONTEXT</div>${cards(context)}<p><b>Talk first.</b> Then each person may propose the team's final prompt. Vote for the version your team wants to send forward.</p><textarea id="proposal" class="prompt" placeholder="Propose the strongest team version…"></textarea><div class="actions"><button class="btn purple" onclick="submitProposal('build')">SUBMIT MY PROPOSAL</button></div><div class="label">TEAM PROPOSALS</div>${proposals("build")}${noteBox()}</section>`);
}
function testScreen(final=false){const r=rec(final),tested=r.tested||{},done=!!tested[local.playerId];$("#app").innerHTML=mast(`<section class="panel"><div class="label">TEAM VERSION SELECTED</div><div class="bigq">Test the winning prompt.</div><div class="success"><b>COPY → OPEN CHATGPT → PASTE → READ</b></div><textarea id="teamDraft" class="prompt" readonly>${esc(r.build||"Waiting for a team proposal…")}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#teamDraft')">COPY TEAM PROMPT</button><button class="btn teal" onclick="markTested()">${done?"✓ I TESTED IT":"I READ THE ANSWER →"}</button></div><p>Compare what you notice with your teammates. Different people often catch different failures.</p></section>`)}
function twistScreen(final=false){const base=final?D.final:D.rounds[snap.state.round],r=rec(final);$("#app").innerHTML=mast(`<section class="panel"><div class="label">PLOT TWIST</div>${roleCard()}<div class="chaos"><h3>${final?"🚨 CONSEQUENCE":"💥 NEW INFORMATION"}</h3><b>${esc(base.twist)}</b></div><p>Everyone can propose a repair. Your team votes again before the Game Master opens judgment.</p><textarea id="proposal" class="prompt" placeholder="How should the team repair the prompt now?">${esc(r.build||"")}</textarea><div class="actions"><button class="btn purple" onclick="submitProposal('repair')">SUBMIT MY REPAIR</button></div><div class="label">TEAM REPAIR OPTIONS</div>${proposals("repair")}${noteBox()}</section>`)}
function checkScreen(final=false){const r=rec(final),mine=r.checkBallots?.[local.playerId];$("#app").innerHTML=mast(`<section class="panel"><div class="label">TEAM REPAIR SELECTED</div><div class="bigq">Judge whether the AI response actually works.</div><textarea class="prompt" readonly>${esc(r.repair||r.build||"")}</textarea><div class="success">Retest if needed. Then make <b>your own judgment</b>. The game combines everyone’s ballots into one team result.</div><div class="judge"><label><input type="checkbox" class="check" ${mine?.checks?.[0]?"checked":""}> Did the response fit the audience?</label><label><input type="checkbox" class="check" ${mine?.checks?.[1]?"checked":""}> Did it accomplish the goal?</label><label><input type="checkbox" class="check" ${mine?.checks?.[2]?"checked":""}> Did it follow the constraints / consequences?</label><label><input type="checkbox" class="check" ${mine?.checks?.[3]?"checked":""}> Is anything important unsupported or uncertain?</label></div><div class="actions"><button class="btn teal" onclick="submitChecks()">${mine?"UPDATE MY BALLOT":"LOCK MY BALLOT →"}</button></div><p><b>Team movement:</b> majority agreement on all 4 = 3 spaces · majority on 3 = 2 spaces · 0–2 = no move and a repair lesson.</p></section>`)}
function revealScreen(final=false){const r=rec(final),t=team(),move=r.move||0;$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">${move?"🏁":"🛠️"}</div><div class="label">MOVEMENT REVEAL</div><h2>${move?`${esc(t.name)} moved ${move}!`:"No move this round."}</h2><p>${move?"Look up at the projected board and see where the race stands.":"The team check found too many misses. That is useful evidence—listen for the Game Master's debrief."}</p></section>`)}
async function submitProposal(field){const text=$("#proposal").value.trim();if(!text)return toast("Write a proposal first.");await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"proposeBuild":"proposeRepair",text})});toast("Proposal added.");await refresh(true)}
async function voteProposal(field,proposalId){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"voteBuild":"voteRepair",proposalId})});toast("Vote locked.");await refresh(true)}
async function sendNote(){const text=$("#note").value.trim();if(!text)return;await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"note",text})});toast("Sent to team.");await refresh(true)}
async function markTested(){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tested"})});toast("Marked tested.");await refresh(true)}
async function submitChecks(){const checks=[...document.querySelectorAll(".check")].map(x=>x.checked);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"checks",checks})});toast("Your judgment is in.");await refresh(true)}
function copyText(sel){const e=$(sel);navigator.clipboard?.writeText(e?.value||"");toast("Copied.");}
function complete(){const sorted=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0)),t=team(),rank=t?sorted.findIndex(x=>x.id===t.id)+1:null;$("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">QUEST COMPLETE</div><h1>CONTEXT<br>CHANGES EVERYTHING.</h1><p>${t?`${esc(t.name)} finished <b>#${rank}</b> with <b>${t.position||0} spaces</b>.`:"You watched the whole room work the problem."}</p></section><section class="panel"><div class="label">THE MODEL</div><div class="bigq">WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK</div><p>The winning move was never magic wording. It was noticing what the situation required, testing the answer, and changing course when the context changed.</p></section>`)}
function render(){
 if(!local.name)return joinScreen();if(!snap)return;const p=me();if(!p)return joinScreen();if(p.mode==="watch")return spectator();
 const s=snap.state.stage;if(s==="lobby"){$("#app").innerHTML=teamLobby();return}
 if(s==="tutorial"){if(p.tutorialDone){$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">✅</div><h2>You're ready.</h2><p>Meet your team and look up. The Game Master will launch Round 1.</p></section>`)}else tutorial();return}
 if(s==="build")return buildScreen(false);if(s==="test")return testScreen(false);if(s==="twist")return twistScreen(false);if(s==="check")return checkScreen(false);if(s==="reveal")return revealScreen(false);
 if(s==="final-build")return buildScreen(true);if(s==="final-test")return testScreen(true);if(s==="final-twist")return twistScreen(true);if(s==="final-check")return checkScreen(true);if(s==="final-reveal")return revealScreen(true);if(s==="complete")return complete();
}
function stableSnapshot(x){
 if(!x)return "";
 const clone=JSON.parse(JSON.stringify(x));
 delete clone.generatedAt;
 for(const p of clone.players||[])delete p.lastSeen;
 for(const t of clone.teams||[])for(const m of t.members||[])delete m.lastSeen;
 return JSON.stringify(clone);
}
function isEditing(){
 const a=document.activeElement;
 return !!a&&(a.tagName==="TEXTAREA"||a.tagName==="INPUT")&&!a.readOnly&&!a.disabled;
}
async function refresh(force=false){
 if(!local.name)return render();
 try{
   const next=await req("/snapshot");
   const sig=stableSnapshot(next);
   const stageChanged=next?.state?.stage!==snap?.state?.stage||next?.state?.round!==snap?.state?.round;
   snap=next;
   if(force||stageChanged||sig!==lastSig){
     lastSig=sig;
     if(!force&&!stageChanged&&isEditing())return;
     render();
   }
 }catch(e){console.error(e)}
}
async function heartbeat(){if(!local.name)return;try{await req("/heartbeat",{method:"POST",body:JSON.stringify({playerId:local.playerId})})}catch(_){}}
save();if(local.name){req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name:local.name,mode:local.mode})}).then(()=>refresh(true));poller=setInterval(refresh,900);setInterval(heartbeat,15000)}else joinScreen();