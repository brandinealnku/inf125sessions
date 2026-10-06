const SESSION_KEY=new URLSearchParams(location.search).get("session")||"context-quest-live";const API="/api/session/"+encodeURIComponent(SESSION_KEY)+"/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const TEST_PLAYER_ID=new URLSearchParams(location.search).get("testPlayer");
const PLAYER_STORE=TEST_PLAYER_ID?sessionStorage:localStorage;
const PLAYER_STORE_KEY=TEST_PLAYER_ID?"cq-test-player-"+TEST_PLAYER_ID:"cq-player-v2";
let local=JSON.parse(PLAYER_STORE.getItem(PLAYER_STORE_KEY)||"null")||{playerId:TEST_PLAYER_ID||(crypto.randomUUID?crypto.randomUUID():"p-"+Date.now()+"-"+Math.random().toString(36).slice(2)),name:"",mode:"play",tutorial:0};
if(TEST_PLAYER_ID){local.playerId=TEST_PLAYER_ID;local.mode="play";local.testPersona=true}
let snap=null,lastSig="",poller=null;
const ROLE_HELP={"PROMPT BUILDER":"Push the team toward a clear, usable prompt.","CONTEXT DETECTIVE":"Hunt for missing context that changes what good looks like.","SKEPTIC":"Challenge unsupported claims, assumptions, and false confidence.","CHAOS CAPTAIN":"Plan how the team will adapt when the situation changes.","JUDGE":"Keep the team honest about whether the AI response actually works."};
function save(){PLAYER_STORE.setItem(PLAYER_STORE_KEY,JSON.stringify(local))}
function toast(t){const e=$("#toast");if(!e)return;e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function me(){return snap?.players?.find(p=>p.id===local.playerId)||null}
function team(){const p=me();return p?.teamId?snap?.teams?.find(t=>t.id===p.teamId)||null:null}
function role(){const t=team();return t?.roles?.[local.playerId]||""}
function rec(final=false){const t=team();if(!t)return {};return t.rounds?.[final?"final":String(snap?.state?.round||0)]||{}}
function studentGuide(){
 const p=me(),t=team();if(!p||p.mode!=="play")return "";
 return `<details class="panel playerGuide"><summary><b>🎮 HOW TO PLAY</b> · tap for instructions</summary><div class="playerGuideGrid">
 <div><b>1 · TALK</b><p>Share what you notice with your team. Your role gives you a lens, not control.</p></div>
 <div><b>2 · SUBMIT ONE ANSWER</b><p>You get <strong>one active answer</strong> in each Build/Repair phase. Submit again only to replace your own answer.</p></div>
 <div><b>3 · VOTE</b><p>Read every teammate option and vote for the strongest. You may change or remove your vote.</p></div>
 <div><b>4 · TEAM WINNER</b><p>Everyone must vote. The highest-voted answer is selected automatically. Ties must be resolved.</p></div>
 <div><b>5 · TEST + ADAPT</b><p>Your team automatically moves into Test. When finished, wait for the Game Master to reveal the Plot Twist to the whole room.</p></div>
 <div><b>WIN THE RIGHT WAY</b><p>Points reward good context, recovery, and evidence—not fancy wording.</p></div>
 </div></details>`;
}
function mast(body){const t=team(),p=me();return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">YOUR DEVICE = YOUR CONTROLLER</div></div>${p?`<div style="display:flex;gap:7px;flex-wrap:wrap"><span class="teamchip">${esc(p.name)}</span>${t?`<span class="teamchip"><span class="dot" style="background:${t.color}"></span>${esc(t.name)}</span>`:""}${role()?`<span class="teamchip">🎭 ${esc(role())}</span>`:""}</div>`:""}</header>${studentGuide()}${body}<div class="footer">TALK TO YOUR TEAM · SUBMIT ONE · VOTE · TEST · ADAPT · JUDGE · MOVE</div>`}
function joinScreen(){$("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">LIVE CLASSROOM PARTY GAME</div><h1>EVERYONE<br>PLAYS.</h1><p>Join on your own device. Context Quest will put you on a virtual team, give you a rotating role, and turn the whole room into one shared AI challenge.</p></section><section class="panel"><div class="label">YOUR NAME OR NICKNAME</div><input id="playerName" class="field" maxlength="50" placeholder="e.g. Brandi" value="${esc(local.name)}"><div class="label" style="margin-top:16px">HOW DO YOU WANT TO JOIN?</div><div class="actions"><button class="btn purple" onclick="joinGame('play')">🎮 PLAY</button><button class="btn soft" onclick="joinGame('watch')">👀 WATCH</button></div><p><b>PLAY</b> puts you on a team. <b>WATCH</b> gives faculty, staff, and visitors a live spectator view without affecting the competition.</p></section>`)}
async function joinGame(mode){const name=$("#playerName").value.trim();if(!name)return toast("Add your name or nickname.");local.name=name;local.mode=mode;save();await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name,mode})});await refresh(true)}
function teamLobby(){
 const t=team();
 if(!snap.state.teamsFormed)return mast(`<section class="panel wait"><div class="icon">🎲</div><div class="label">YOU'RE IN</div><h2>Waiting for virtual teams.</h2><p>${snap.playing||0} players are ready. Your Game Master will form balanced teams when the room is set.</p></section>`);
 const members=(t?.members||[]).map(m=>`<span class="mini">${esc(m.name)}</span>`).join("");
 const used=new Set((snap.teams||[]).filter(x=>x.id!==t.id&&x.charm).map(x=>x.charm));
 const charms=(snap.charms||["🚀","🤖","💡","🧭","🎮","🔍","⚡","🧠","🛸","🎲","🧩","🦾"]).map(ch=>{
   const taken=used.has(ch),selected=(local.teamDraftCharm||t.charm)===ch;
   return `<button class="charmpick ${selected?"selected":""}" ${taken?"disabled":""} onclick="chooseCharm('${ch}')"><span>${ch}</span><small>${taken?"TAKEN":selected?"SELECTED":"CHOOSE"}</small></button>`;
 }).join("");
 return mast(`<section class="panel hero teamsetupHero"><div class="tiny">TEAM SETUP</div><div class="charmHero">${esc(t?.charm||local.teamDraftCharm||"🎲")}</div><h1 style="color:${t?.color||"var(--purple)"}">${esc(t?.name||"YOUR TEAM")}</h1><p>Find your teammates, then decide together: <b>What are you called, and what charm represents you on the board?</b></p></section>
 <section class="panel"><div class="label">YOUR TEAMMATES</div><div class="actions">${members}</div>
 <div class="setupgrid"><div><div class="label">1 · CHOOSE YOUR TEAM NAME</div><input id="teamNameChoice" class="field" maxlength="32" value="${esc(local.teamDraftName||t?.name||"")}" placeholder="Name your team"><p class="tiny">Any teammate can save the choice. Talk first—changes sync to everyone.</p></div>
 <div><div class="label">2 · CHOOSE A CHARM</div><div class="charmgrid">${charms}</div></div></div>
 <div class="actions"><button class="btn purple" onclick="saveTeamIdentity()">SAVE TEAM NAME + CHARM →</button></div>
 ${t?.customized?`<div class="success"><b>${esc(t.charm)} ${esc(t.name)} is ready for the board.</b> Your Game Master will start the tutorial when all teams are set.</div>`:""}
 </section><section class="panel"><div class="label">YOUR FIRST ROLE</div><div class="success"><b>${esc(role())}</b><br><span style="font-weight:700">${esc(ROLE_HELP[role()]||"")}</span></div><p>The role rotates every round. It gives you a lens—not exclusive control.</p></section>`);
}
function chooseCharm(ch){local.teamDraftCharm=ch;const name=$("#teamNameChoice");if(name)local.teamDraftName=name.value;save();teamLobby()}
async function saveTeamIdentity(){
 const name=$("#teamNameChoice")?.value.trim(),charm=local.teamDraftCharm||team()?.charm;
 if(!name)return toast("Choose a team name.");
 if(!charm)return toast("Choose a charm.");
 try{await req("/team-customize",{method:"POST",body:JSON.stringify({playerId:local.playerId,name,charm})});local.teamDraftName="";local.teamDraftCharm="";save();toast("Team identity saved!");await refresh(true)}catch(e){toast(e.message)}
}
function spectator(){
 const st=snap.state.stage,t=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0));const phase=D.stages[st]||st;
 return mast(`<section class="panel hero"><div class="tiny">SPECTATOR MODE</div><h1>YOU'RE<br>IN THE ROOM.</h1><p>Watch the live game without changing team scores. You can switch to PLAY before teams are formed by rejoining.</p></section><section class="panel"><div class="label">CURRENT MOMENT</div><div class="bigq">${esc(phase)}</div><div class="leaderboard">${t.map((x,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div><b>${esc(x.name)}</b></div><div><b>${x.position||0}</b> spaces</div><div></div></div>`).join("")||"<p>Waiting for teams…</p>"}</div></section>`);
}
function tutorialPrompt(){
 const who=local.tWho||"a first-year college student",goal=local.tGoal||"understand what AI is";
 return `Explain AI to ${who} so they can ${goal}. Use plain language and one example.`;
}
function tutorial(){
 const n=local.tutorial||0;let body="";
 if(n===0)body=`<div class="label">1 · MAD LIBS PROMPT</div><div class="bigq">Start with pieces—not a blank page.</div><div class="madlib"><span>Explain AI to</span><select id="tWho" class="field"><option>a first-year college student</option><option>a professor</option><option>a parent</option><option>a hiring manager</option></select><span>so they can</span><select id="tGoal" class="field"><option>understand what AI is</option><option>decide when AI is useful for school</option><option>prepare for an interview</option><option>use AI responsibly at work</option></select><span>.</span></div><div class="actions"><button class="btn purple" onclick="tutorialBuild()">BUILD MY PROMPT →</button></div>`;
 if(n===1)body=`<div class="label">2 · SEE WHAT CONTEXT DID</div><div class="success"><b>Your choices became a usable prompt.</b></div><div class="promptPreview">${esc(tutorialPrompt())}</div><p>You did not need “magic words.” You gave the AI an audience and a goal.</p><div class="actions"><button class="btn purple" onclick="tutorialNextSimple()">TEST IT →</button></div>`;
 if(n===2)body=`<div class="label">3 · TEST IT</div><div class="success"><b>COPY → OPEN CHATGPT → PASTE → READ</b></div><textarea id="tDraft" class="prompt" readonly>${esc(tutorialPrompt())}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#tDraft')">COPY</button><button class="btn teal" onclick="tutorialNextSimple()">I READ IT →</button></div>`;
 if(n===3)body=`<div class="label">4 · PLOT TWIST</div><div class="chaos"><h3>💥 NEW INFORMATION</h3><b>The student has never used AI before.</b></div><p>What should change?</p><div class="choicegrid"><button class="choicecard" onclick="tutorialTwist('Explain unfamiliar AI terms and do not assume prior experience.')"><b>🧠 Add beginner context</b><span>Explain unfamiliar terms and assume no prior experience.</span></button><button class="choicecard" onclick="tutorialTwist('Use more advanced technical vocabulary.')"><b>🤓 Make it more technical</b><span>Add advanced vocabulary.</span></button><button class="choicecard" onclick="tutorialTwist('Nothing needs to change.')"><b>🤷 Change nothing</b><span>Keep the original prompt.</span></button></div>${local.tTwist?`<div class="promptPreview">${esc(tutorialPrompt()+" "+local.tTwist)}</div><div class="actions"><button class="btn purple" onclick="tutorialNextSimple()">LOCK MY REPAIR →</button></div>`:""}`;
 if(n>=4)body=`<div class="label">5 · YOU KNOW THE LOOP</div><div class="bigq">The wording was not the main problem. The context changed.</div><p>Next come three big game moments: <b>Context Match → Build + Test → Chaos + Repair.</b> Then your team faces the Final Boss.</p><div class="actions"><button class="btn green" onclick="finishTutorial()">READY ✓</button></div>`;
 $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">PLAYABLE TUTORIAL · ${Math.min(n+1,5)} OF 5</div>${body}</section>`);
}
function tutorialBuild(){local.tWho=$("#tWho").value;local.tGoal=$("#tGoal").value;local.tutorial=1;save();tutorial()}
function tutorialNextSimple(){local.tutorial=Math.min(4,(local.tutorial||0)+1);save();tutorial()}
function tutorialTwist(text){local.tTwist=text;save();tutorial()}
async function finishTutorial(){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tutorialDone"})});local.tutorial=4;save();toast("Ready!");await refresh(true)}
function cards(rows){return `<div class="cards">${rows.map(([k,v])=>`<div class="gamecard"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>`}
function roleCard(){const r=role();return `<div class="rolecard"><div class="label">YOUR ROLE THIS ROUND</div><h3>${esc(r)}</h3><p>${esc(ROLE_HELP[r]||"Help your team make the best decision.")}</p></div>`}
function proposals(field){
 const r=rec(String(snap.state.stage).startsWith("final")),rows=Object.values(r[field+"Proposals"]||{}),votes=r[field+"Votes"]||{},mine=votes[local.playerId],counts={};Object.values(votes).forEach(v=>counts[v]=(counts[v]||0)+1);
 if(!rows.length)return '<div class="submission"><b>No answers yet.</b> Each teammate may submit one active answer.</div>';
 const total=team()?.members?.length||0,voted=Object.keys(votes).length;
 return `<div class="success"><b>${voted}/${total} team members have voted.</b> Everyone votes once. Highest vote total goes to the Game Master; ties must be resolved.</div><div class="proposalgrid">${rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)).map(p=>`<div class="proposal ${mine===p.id?"selected":""}"><div class="tiny">${esc(p.name)}${p.playerId===local.playerId?" · YOUR ANSWER":""} · ${counts[p.id]||0} vote${(counts[p.id]||0)===1?"":"s"}</div><p>${esc(p.text)}</p><div class="actions"><button class="btn ${mine===p.id?"green":"soft"}" onclick="voteProposal('${field}','${p.id}')">${mine===p.id?"✓ YOUR VOTE":"VOTE FOR THIS"}</button>${mine===p.id?`<button class="btn red" onclick="removeVote('${field}')">REMOVE MY VOTE</button>`:""}</div></div>`).join("")}</div>`;
}
function noteBox(){return `<div class="stage"><div class="label">TEAM SIGNAL</div><p>Spot something your teammates should notice? Drop a short note.</p><input id="note" class="field" maxlength="800" placeholder="Missing context, risk, idea, evidence concern…"><div class="actions"><button class="btn soft" onclick="sendNote()">SEND NOTE</button></div>${teamNotes()}</div>`}
function teamNotes(){const r=rec(String(snap.state.stage).startsWith("final")),notes=Object.values(r.notes||{});return notes.length?`<div class="actions">${notes.map(n=>`<span class="mini"><b>${esc(n.name)}:</b> ${esc(n.text)}</span>`).join("")}</div>`:""}
function mySecret(r){
 const members=team()?.members||[],idx=Math.max(0,members.findIndex(m=>m.id===local.playerId));
 return r.secrets?.[idx%(r.secrets?.length||1)]||r.secrets?.[0];
}
function roundBuildUI(r){
 if(r.style==="match")return `<div class="label">CONTEXT MATCH</div><div class="weirdPrompt">🎭 “${esc(r.bad)}”</div><p>Which context makes this weird prompt make sense?</p><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectMatchChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.text)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="cards")return `<div class="label">PICK AN AUDIENCE CARD</div><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectRoundChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.value)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="pickbest")return `<div class="label">PICK THE BEST PROMPT</div><p>Which option gives the AI a real goal—not just a topic?</p><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectBestChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.text)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="secret"){
   const secret=mySecret(r);
   return `<div class="secretcard"><div class="tiny">🤫 ONLY YOU SEE THIS</div><div class="label">${esc(secret?.[0]||"SECRET")}</div><div class="bigq">${esc(secret?.[1]||"")}</div><p><b>Tell your teammates out loud.</b> Other teammates have different pieces.</p></div><div class="label">ASSEMBLE YOUR VERSION</div><div class="madlib stack"><label>WHO<select id="bAudience" class="field">${r.builders.audience.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label><label>GOAL<select id="bGoal" class="field">${r.builders.goal.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label><label>CONSTRAINT<select id="bConstraint" class="field">${r.builders.constraint.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label><label>OUTPUT<select id="bOutput" class="field">${r.builders.output.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label></div><div class="actions"><button class="btn purple" onclick="assembleSecretPrompt()">ASSEMBLE + SUBMIT</button></div><div id="roundPreview"></div>`;
 }
 if(r.style==="spot")return `<div class="aianswer"><div class="tiny">AI ANSWER</div><p>${esc(r.context?.[0]?.[1]||"")}</p></div><div class="label">SPOT THE PROBLEMS</div><p>Select every problem you think matters. Your selections become a verification prompt.</p><div class="choicegrid">${r.issues.map((x,i)=>`<label class="choicecard checkboxcard"><input type="checkbox" class="issuepick" value="${i}"><span><b>${esc(x.label)}</b><br>${esc(x.text)}</span></label>`).join("")}</div><div class="actions"><button class="btn purple" onclick="submitSpotPrompt()">BUILD VERIFICATION PROMPT →</button></div><div id="roundPreview"></div>`;
 return "";
}
function buildScreen(final=false){
 const r=final?D.final:D.rounds[snap.state.round],title=final?"FINAL BOSS":`MOMENT ${snap.state.round+1} / 3 · ${r.icon} ${r.key}`;
 if(final){
   $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">${title}</div>${roleCard()}<div class="label">FINAL FREEFORM BUILD</div><div class="bigq">“${esc(r.bad)}”</div>${cards(r.cards)}<p>This is the first time the game asks you to build the full interaction yourself. Use what the earlier rounds taught you.</p><div class="success"><b>One active answer per player.</b> If you submit again, your previous answer is replaced.</div><textarea id="proposal" class="prompt" placeholder="Build the strongest complete prompt / AI interaction…"></textarea><div class="actions"><button class="btn purple" onclick="submitProposal('build')">${rec(true).buildProposals&&Object.values(rec(true).buildProposals).some(p=>p.playerId===local.playerId)?"UPDATE MY FINAL ANSWER":"SUBMIT MY FINAL ANSWER"}</button></div><div class="label">TEAM PROPOSALS</div>${proposals("build")}${noteBox()}</section>`);
   return;
 }
 $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">${title} · ${esc((r.style||"").toUpperCase())}</div>${roleCard()}<div class="label">STARTING CHALLENGE</div><div class="bigq">“${esc(r.bad)}”</div><p>${esc(r.nudge||"")}</p>${roundBuildUI(r)}<div class="label" style="margin-top:18px">TEAM ANSWERS</div>${proposals("build")}${noteBox()}</section>`);
}
function previewAndSubmit(text,feedback=""){
 const e=$("#roundPreview");if(!e)return;
 e.innerHTML=`<div class="promptPreview"><div class="tiny">YOUR PROPOSED TEAM ANSWER</div>${esc(text)}</div>${feedback?`<div class="success">${esc(feedback)}</div>`:""}<div class="actions"><button class="btn purple" onclick="submitGeneratedBuild()">SUBMIT THIS TO MY TEAM →</button></div>`;
 local.generatedBuild=text;save();
}
function selectMatchChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i],good=i===r.best;previewAndSubmit(x.prompt,(good?"🎯 MATCH! ":"🌀 Funny, but not the best fit. ")+x.why)}
function selectRoundChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i];previewAndSubmit(x.prompt,`Notice what changed: the audience gave the answer a target.`)}
function selectBestChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i],good=i===r.best;previewAndSubmit(x.text,(good?"Strong choice. ":"Look again. ")+x.why)}
function assembleSecretPrompt(){
 const a=$("#bAudience").value,g=$("#bGoal").value,c=$("#bConstraint").value,o=$("#bOutput").value;
 const text=`Help ${a} ${g} ${c}. ${o}`;previewAndSubmit(text,"Your team had to combine context before the prompt became usable.");
}
function submitSpotPrompt(){
 const r=D.rounds[snap.state.round],ids=[...document.querySelectorAll(".issuepick:checked")].map(x=>Number(x.value));
 if(!ids.length)return toast("Spot at least one problem first.");
 const selected=ids.map(i=>r.issues[i]),text=selected.map(x=>x.repair).join(" ");
 previewAndSubmit(text,`You flagged ${selected.length} issue${selected.length===1?"":"s"}. Confidence is not evidence.`);
}
async function submitGeneratedBuild(){const text=local.generatedBuild;if(!text)return toast("Make a game choice first.");const had=Object.values(rec(false).buildProposals||{}).some(p=>p.playerId===local.playerId);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"proposeBuild",text})});toast(had?"Your answer was updated.":"Your one team answer was submitted.");local.generatedBuild="";save();await refresh(true)}
function testScreen(final=false){const r=rec(final),tested=r.tested||{},done=!!tested[local.playerId];$("#app").innerHTML=mast(`<section class="panel"><div class="label">TEAM VERSION SELECTED</div><div class="bigq">Test the winning prompt.</div><div class="success"><b>COPY → OPEN CHATGPT → PASTE → READ</b></div><textarea id="teamDraft" class="prompt" readonly>${esc(r.build||"Waiting for a team proposal…")}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#teamDraft')">COPY TEAM PROMPT</button><button class="btn teal" onclick="markTested()">${done?"✓ I TESTED IT":"I READ THE ANSWER →"}</button></div><p>Compare what you notice with your teammates. Different people often catch different failures.</p></section>`)}
function twistScreen(final=false){const base=final?D.final:D.rounds[snap.state.round],r=rec(final);$("#app").innerHTML=mast(`<section class="panel"><div class="label">PLOT TWIST</div>${roleCard()}<div class="chaos"><h3>${final?"🚨 CONSEQUENCE":"💥 NEW INFORMATION"}</h3><b>${esc(base.twist)}</b></div><p>Everyone can submit <b>one active repair</b>. Submitting again replaces your own repair. Then everyone votes for the best.</p><textarea id="proposal" class="prompt" placeholder="How should the team repair the prompt now?">${esc(r.repairProposals&&Object.values(r.repairProposals).find(p=>p.playerId===local.playerId)?.text||r.build||"")}</textarea><div class="actions"><button class="btn purple" onclick="submitProposal('repair')">${r.repairProposals&&Object.values(r.repairProposals).some(p=>p.playerId===local.playerId)?"UPDATE MY REPAIR":"SUBMIT MY REPAIR"}</button></div><div class="label">TEAM REPAIR OPTIONS</div>${proposals("repair")}${noteBox()}</section>`)}
function checkScreen(final=false){const r=rec(final),mine=r.checkBallots?.[local.playerId];$("#app").innerHTML=mast(`<section class="panel"><div class="label">TEAM REPAIR SELECTED</div><div class="bigq">Judge whether the AI response actually works.</div><textarea class="prompt" readonly>${esc(r.repair||r.build||"")}</textarea><div class="success">Retest if needed. Then make <b>your own judgment</b>. The game combines everyone’s ballots into one team result.</div><div class="judge"><label><input type="checkbox" class="check" ${mine?.checks?.[0]?"checked":""}> Did the response fit the audience?</label><label><input type="checkbox" class="check" ${mine?.checks?.[1]?"checked":""}> Did it accomplish the goal?</label><label><input type="checkbox" class="check" ${mine?.checks?.[2]?"checked":""}> Did it follow the constraints / consequences?</label><label><input type="checkbox" class="check" ${mine?.checks?.[3]?"checked":""}> Is anything important unsupported or uncertain?</label></div><div class="actions"><button class="btn teal" onclick="submitChecks()">${mine?"UPDATE MY BALLOT":"LOCK MY BALLOT →"}</button></div><p><b>Team movement:</b> majority agreement on all 4 = 3 spaces · majority on 3 = 2 spaces · 0–2 = no move and a repair lesson.</p></section>`)}
function revealScreen(final=false){const r=rec(final),t=team(),move=r.move||0;$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">${move?"🏁":"🛠️"}</div><div class="label">MOVEMENT REVEAL</div><h2>${move?`${esc(t.name)} moved ${move}!`:"No move this round."}</h2><p>${move?"Look up at the projected board and see where the race stands.":"The team check found too many misses. That is useful evidence—listen for the Game Master's debrief."}</p></section>`)}
async function submitProposal(field){const text=$("#proposal").value.trim();if(!text)return toast("Write an answer first.");const r=rec(String(snap.state.stage).startsWith("final")),had=Object.values(r[field+"Proposals"]||{}).some(p=>p.playerId===local.playerId);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"proposeBuild":"proposeRepair",text})});toast(had?"Your answer was updated.":"Your one answer was submitted.");await refresh(true)}
async function voteProposal(field,proposalId){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"voteBuild":"voteRepair",proposalId})});toast("Vote updated.");await refresh(true)}
async function removeVote(field){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"voteBuild":"voteRepair",proposalId:""})});toast("Vote removed.");await refresh(true)}
async function sendNote(){const text=$("#note").value.trim();if(!text)return;await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"note",text})});toast("Sent to team.");await refresh(true)}
async function markTested(){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tested"})});toast("Marked tested.");await refresh(true)}
async function submitChecks(){const checks=[...document.querySelectorAll(".check")].map(x=>x.checked);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"checks",checks})});toast("Your judgment is in.");await refresh(true)}
function copyText(sel){const e=$(sel);navigator.clipboard?.writeText(e?.value||"");toast("Copied.");}
function complete(){const sorted=[...(snap.teams||[])].sort((a,b)=>(b.position||0)-(a.position||0)),t=team(),rank=t?sorted.findIndex(x=>x.id===t.id)+1:null;$("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">QUEST COMPLETE</div><h1>CONTEXT<br>CHANGES EVERYTHING.</h1><p>${t?`${esc(t.name)} finished <b>#${rank}</b> with <b>${t.position||0} spaces</b>.`:"You watched the whole room work the problem."}</p></section><section class="panel"><div class="label">THE MODEL</div><div class="bigq">WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK</div><p>The winning move was never magic wording. It was noticing what the situation required, testing the answer, and changing course when the context changed.</p></section>`)}
function teamWait(kind,final=false){
 const t=team(),r=rec(final);
 const cfg=kind==="ready-twist"
  ?{icon:"⚡",label:"TEAM READY",title:"Your team is ready for the Plot Twist.",text:"Look up. The Game Master will reveal the new information to the whole room when the other teams are ready."}
  :{icon:"🏁",label:"TEAM READY",title:"Your judgment is locked.",text:"Look up. The Game Master will reveal scoring and board movement when the room is ready."};
 $("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">${cfg.icon}</div><div class="label">${cfg.label}</div><h2>${cfg.title}</h2><p>${cfg.text}</p><div class="success"><b>${esc(t?.name||"Your team")}</b> has completed this part of the Moment. You do not need to click anything else.</div></section>`);
}
function render(){
 if(!local.name)return joinScreen();if(!snap)return;const p=me();if(!p)return joinScreen();if(p.mode==="watch")return spectator();
 const s=snap.state.stage,t=team(),phase=t?.progressPhase||"";
 if(s==="lobby"){$("#app").innerHTML=teamLobby();return}
 if(s==="tutorial"){if(p.tutorialDone){$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">✅</div><h2>You're ready.</h2><p>Meet your team and look up. The Game Master will launch Moment 1.</p></section>`)}else tutorial();return}

 if(s==="build"){
   if(phase==="test")return testScreen(false);
   if(phase==="ready-twist")return teamWait("ready-twist",false);
   return buildScreen(false);
 }
 if(s==="twist"){
   if(phase==="check")return checkScreen(false);
   if(phase==="ready-reveal")return teamWait("ready-reveal",false);
   return twistScreen(false);
 }
 if(s==="reveal")return revealScreen(false);

 if(s==="final-build"){
   if(phase==="test")return testScreen(true);
   if(phase==="ready-twist")return teamWait("ready-twist",true);
   return buildScreen(true);
 }
 if(s==="final-twist"){
   if(phase==="check")return checkScreen(true);
   if(phase==="ready-reveal")return teamWait("ready-reveal",true);
   return twistScreen(true);
 }
 if(s==="final-reveal")return revealScreen(true);
 if(s==="complete")return complete();

 // Backward-compatible fallback for an older in-progress session.
 if(s==="test")return testScreen(false);if(s==="check")return checkScreen(false);
 if(s==="final-test")return testScreen(true);if(s==="final-check")return checkScreen(true);
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
async function boot(){
 if(TEST_PLAYER_ID){
   try{
     snap=await req("/snapshot");
     const p=snap.players?.find(x=>x.id===TEST_PLAYER_ID&&x.isTest);
     if(!p){$("#app").innerHTML=mast('<section class="panel wait"><div class="icon">🧪</div><h2>Test player not found.</h2><p>Create test players from the instructor Test Lab, then open a Play as Test Player link.</p></section>');return}
     local.playerId=p.id;local.name=p.name;local.mode="play";local.testPersona=true;save();
     await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name:local.name,mode:"play"})});
     await refresh(true);
   }catch(e){console.error(e);joinScreen()}
 }else if(local.name){
   await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name:local.name,mode:local.mode})});
   await refresh(true);
 }else joinScreen();
 poller=setInterval(refresh,900);setInterval(heartbeat,15000);
}
boot();