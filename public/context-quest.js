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
function progressLabel(){const t=team(),key=t?.progressKey;return key?(D.progressLabels?.[key]||String(key).replaceAll("_"," ")):""}
function personalActionLabel(){
 const s=snap?.state?.stage,t=team(),phase=t?.progressPhase||"",final=String(s||"").startsWith("final"),r=rec(final),id=local.playerId;
 if(s==="lobby")return snap?.state?.teamsFormed?"TEAM SETUP":"ENTER LAB";
 if(s==="tutorial")return me()?.tutorialDone?"WAIT FOR CASE 1":"INVESTIGATOR TRAINING";
 if(s==="build"||s==="final-build"){
   if(phase==="test")return r.tested?.[id]?"WAIT FOR TEAM":"TEST OR REVIEW AI RESPONSE";
   if(phase==="ready-twist")return final?"READY FOR FINAL CURSE":"READY FOR THE HAUNTING";
   const proposals=Object.values(r.buildProposals||{}),mine=proposals.some(p=>p.playerId===id);
   if(!proposals.length)return final?"PROPOSE FINAL ANSWER":"PROPOSE AN ANSWER";
   if(!r.buildVotes?.[id])return "TEAM VOTE";
   return mine?"WAIT FOR TEAMMATES":"VOTE CAST · HELP YOUR TEAM";
 }
 if(s==="twist"||s==="final-twist"){
   if(phase==="check")return r.checkBallots?.[id]?"WAIT FOR TEAM":"EVIDENCE CHECK";
   if(phase==="ready-reveal")return "READY FOR EVIDENCE REVEAL";
   const proposals=Object.values(r.repairProposals||{}),mine=proposals.some(p=>p.playerId===id);
   if(!proposals.length)return "PROPOSE A REPAIR";
   if(!r.repairVotes?.[id])return "TEAM VOTE · REPAIR";
   return mine?"WAIT FOR TEAMMATES":"VOTE CAST · HELP YOUR TEAM";
 }
 if(s==="reveal"||s==="final-reveal")return "EVIDENCE REVEAL";
 if(s==="complete")return "CASE CLOSED";
 return progressLabel();
}
function sampleResponse(final=false){const d=final?D.final:D.rounds?.[snap?.state?.round||0];return d?.sampleResponse||"A sample AI response is not available for this case."}
function optionList(arr,offset=0){const rows=arr.map((x,i)=>arr[(i+offset)%arr.length]);return '<option value="" selected disabled>Choose after your team shares clues…</option>'+rows.map(x=>`<option>${esc(x)}</option>`).join("")}

function rec(final=false){const t=team();if(!t)return {};return t.rounds?.[final?"final":String(snap?.state?.round||0)]||{}}
function studentGuide(){
 const p=me(),t=team();if(!p||p.mode!=="play")return "";
 return `<details class="panel playerGuide"><summary><b>🎮 HOW TO PLAY</b> · tap for instructions</summary><div class="playerGuideGrid">
 <div><b>1 · TALK</b><p>Share what you notice with your team. Your role gives you a lens, not control.</p></div>
 <div><b>2 · CONTRIBUTE</b><p>Talk first. Anyone may submit <strong>one active answer</strong>; you do not need five duplicate answers. Submit again only to replace your own answer.</p></div>
 <div><b>3 · VOTE</b><p>Read every teammate option and vote for the strongest. You may change or remove your vote.</p></div>
 <div><b>4 · TEAM WINNER</b><p>Everyone must vote. The highest-voted answer is selected automatically. Ties must be resolved.</p></div>
 <div><b>5 · TEST + ADAPT</b><p>Your team automatically moves into Test. When finished, wait for the Game Master to reveal the Haunting to the whole room.</p></div>
 <div><b>WIN THE RIGHT WAY</b><p>Points reward good context, recovery, and evidence—not fancy wording.</p></div>
 </div></details>`;
}
function mast(body){const t=team(),p=me(),teamStatus=progressLabel(),mine=personalActionLabel();return `<header class="mast hauntedMast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">🎃 THE HAUNTED PROMPT LAB · YOUR DEVICE = YOUR CONTROLLER</div></div>${p?`<div style="display:flex;gap:7px;flex-wrap:wrap"><span class="teamchip">${esc(p.name)}</span>${t?`<span class="teamchip"><span class="dot" style="background:${t.color}"></span>${esc(t.charm||"👻")} ${esc(t.name)}</span>`:""}${role()?`<span class="teamchip">🔦 ${esc(role())}</span>`:""}${teamStatus?`<span class="teamchip statusChip">TEAM: ${esc(teamStatus)}</span>`:""}${mine?`<span class="teamchip nextChip">YOUR NEXT: ${esc(mine)}</span>`:""}</div>`:""}</header>${studentGuide()}${body}<div class="footer">FIND THE CONTEXT · SUBMIT ONE · VOTE · TEST · SURVIVE THE HAUNTING · VERIFY</div>`}
function joinScreen(){$("#app").innerHTML=mast(`<section class="panel hero hauntedHero"><div class="tiny">👻 LIVE CLASSROOM AI MYSTERY</div><h1>THE PROMPTS<br>ARE HAUNTED.</h1><p>Something is wrong in the AI Lab. Strange prompts are producing confident answers—and the missing ingredient is <b>context</b>. Join an investigation team, find the clues, test the AI, and stop bad answers before they cause chaos.</p><div class="caseTag">FIRST-YEAR AI INTRO · HALLOWEEN EDITION</div></section><section class="panel"><div class="label">INVESTIGATOR NAME OR NICKNAME</div><input id="playerName" class="field" maxlength="50" placeholder="e.g. Brandi" value="${esc(local.name)}"><div class="label" style="margin-top:16px">ENTER THE LAB</div><div class="actions"><button class="btn purple" onclick="joinGame('play')">🔦 INVESTIGATE</button><button class="btn soft" onclick="joinGame('watch')">👀 OBSERVE</button></div><p><b>INVESTIGATE</b> puts you on a team. <b>OBSERVE</b> lets faculty, staff, and visitors watch without affecting the competition.</p></section>`)}
async function joinGame(mode){const name=$("#playerName").value.trim();if(!name)return toast("Add your name or nickname.");local.name=name;local.mode=mode;save();await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name,mode})});await refresh(true)}
function teamLobby(){
 const t=team();
 if(!snap.state.teamsFormed)return mast(`<section class="panel wait hauntedWait"><div class="icon">🕯️</div><div class="label">YOU'RE IN THE LAB</div><h2>Waiting for investigation teams.</h2><p>${snap.playing||0} investigators are ready. The Game Master will divide the room into teams when the lab is set.</p></section>`);
 const members=(t?.members||[]).map(m=>`<span class="mini">${esc(m.name)}</span>`).join("");
 const used=new Set((snap.teams||[]).filter(x=>x.id!==t.id&&x.charm).map(x=>x.charm));
 const activeCharm=local.teamDraftCharm||t.charm||"";
 const charms=(snap.charms||["🎃","👻","🧛","🧙","🦇","💀","🐈‍⬛","🕷️","🔮","🧟","🕯️","🧪"]).map(ch=>{
   const taken=used.has(ch),selected=activeCharm===ch;
   return `<button class="charmpick ${selected?"selected":""}" aria-pressed="${selected?"true":"false"}" ${taken?"disabled":""} onclick="chooseCharm('${ch}')"><span class="charmEmoji">${ch}</span>${selected?'<span class="charmCheck">✓</span>':""}<small>${taken?"TAKEN":selected?"SELECTED":"CHOOSE"}</small></button>`;
 }).join("");
 return mast(`<section class="panel hero teamsetupHero hauntedHero"><div class="tiny">🔮 INVESTIGATION TEAM SETUP</div><div class="charmHero">${esc(t?.charm||local.teamDraftCharm||"👻")}</div><h1 style="color:${t?.color||"var(--purple)"}">${esc(t?.name||"YOUR TEAM")}</h1><p>Find your investigators, then choose your <b>team name</b> and a Halloween <b>charm</b> to move around the Haunted Prompt Lab.</p></section>
 <section class="panel"><div class="label">YOUR INVESTIGATORS</div><div class="actions">${members}</div>
 <div class="setupgrid"><div><div class="label">1 · NAME YOUR INVESTIGATION TEAM</div><input id="teamNameChoice" class="field" maxlength="32" value="${esc(local.teamDraftName||t?.name||"")}" placeholder="e.g. Ghost Hunters"><p class="tiny">Any teammate can save it. Agree together first.</p></div>
 <div><div class="label">2 · CHOOSE YOUR HALLOWEEN CHARM</div><div class="selectedCharmStatus">${activeCharm?`<span class="selectedCharmEmoji">${esc(activeCharm)}</span><span><small>YOUR SELECTION</small><b>${esc(activeCharm)} is selected</b></span>`:'<span class="selectedCharmEmoji">?</span><span><small>YOUR SELECTION</small><b>Choose one charm below</b></span>'}</div><div class="charmgrid">${charms}</div></div></div>
 <div class="actions"><button class="btn purple" onclick="saveTeamIdentity()">LOCK TEAM IDENTITY →</button></div>
 ${t?.customized?`<div class="success"><b>${esc(t.charm)} ${esc(t.name)} is cleared to enter the lab.</b> Wait for Investigator Training to begin.</div>`:""}
 </section><section class="panel"><div class="label">YOUR FIRST INVESTIGATION ROLE</div><div class="success"><b>${esc(role())}</b><br><span style="font-weight:700">${esc(ROLE_HELP[role()]||"")}</span></div><p>Your role rotates each case. It gives you a lens—not exclusive control.</p></section>`);
}
function chooseCharm(ch){local.teamDraftCharm=ch;const name=$("#teamNameChoice");if(name)local.teamDraftName=name.value;save();$("#app").innerHTML=teamLobby()}
async function saveTeamIdentity(){
 const name=$("#teamNameChoice")?.value.trim(),charm=local.teamDraftCharm||team()?.charm;
 if(!name)return toast("Choose a team name.");
 if(!charm)return toast("Choose a charm.");
 try{await req("/team-customize",{method:"POST",body:JSON.stringify({playerId:local.playerId,name,charm})});local.teamDraftName="";local.teamDraftCharm="";save();toast("Team identity saved!");await refresh(true)}catch(e){toast(e.message)}
}
function spectator(){
 const st=snap.state.stage,t=[...(snap.teams||[])].sort((a,b)=>(b.totalPoints||0)-(a.totalPoints||0)||(b.boardPosition||0)-(a.boardPosition||0));const phase=D.stages[st]||st;
 return mast(`<section class="panel hero"><div class="tiny">SPECTATOR MODE</div><h1>YOU'RE<br>IN THE ROOM.</h1><p>Watch the live game without changing team scores. You can switch to PLAY before teams are formed by rejoining.</p></section><section class="panel"><div class="label">CURRENT MOMENT</div><div class="bigq">${esc(phase)}</div>${!snap.state.teamsFormed?`<div class="actions"><button class="btn purple" onclick="switchToPlay()">I MEANT TO INVESTIGATE →</button></div>`:""}<div class="leaderboard">${t.map((x,i)=>`<div class="leader"><div class="rank">#${i+1}</div><div><b>${esc(x.name)}</b></div><div><b>${x.totalPoints||0}</b> pts · space ${x.boardPosition||0}</div><div></div></div>`).join("")||"<p>Waiting for teams…</p>"}</div></section>`);
}
async function switchToPlay(){local.mode="play";save();await req("/join",{method:"POST",body:JSON.stringify({playerId:local.playerId,name:local.name,mode:"play"})});toast("You are joining as an investigator.");await refresh(true)}
function tutorialPrompt(){
 const who=local.tWho||"a first-year college student",goal=local.tGoal||"understand what AI is";
 return `Explain AI to ${who} so they can ${goal}. Use plain language and one example.`;
}
function tutorial(){
 const n=local.tutorial||0;let body="";
 if(n===0)body=`<div class="label">1 · INVESTIGATOR TRAINING</div><div class="bigq">First: what are AI and a prompt?</div><div class="ai101"><b>Generative AI</b> creates new text, images, code, or other content from instructions and information you give it.<br><br><b>A prompt</b> is the instruction + context you give the AI. The <b>response</b> is what the AI gives back.</div><p>There is no magic wording. Useful context helps the AI understand what a good response should do.</p><div class="madlib"><span>Explain AI to</span><select id="tWho" class="field"><option>a first-year college student</option><option>a professor</option><option>a parent</option><option>a hiring manager</option></select><span>so they can</span><select id="tGoal" class="field"><option>understand what AI is</option><option>decide when AI is useful for school</option><option>prepare for an interview</option><option>use AI responsibly at work</option></select><span>.</span></div><div class="actions"><button class="btn purple" onclick="tutorialBuild()">ASSEMBLE THE PROMPT →</button></div>`;
 if(n===1)body=`<div class="label">2 · FIRST CLUE</div><div class="success"><b>Your choices changed what a useful answer should look like.</b></div><div class="promptPreview">${esc(tutorialPrompt())}</div><p>You did not cast a prompt spell. You gave the AI an <b>audience</b> and a <b>goal</b>.</p><div class="actions"><button class="btn purple" onclick="tutorialNextSimple()">TEST THE AI →</button></div>`;
 if(n===2)body=`<div class="label">3 · TEST THE AI</div><div class="success"><b>COPY → OPEN CHATGPT → PASTE → READ</b></div><textarea id="tDraft" class="prompt" readonly>${esc(tutorialPrompt())}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#tDraft')">COPY PROMPT</button><a class="btn soft" href="https://chatgpt.com/" target="_blank" rel="noopener" style="text-decoration:none">OPEN CHATGPT ↗</a><button class="btn soft" onclick="showTutorialSample()">CAN'T ACCESS CHATGPT? VIEW SAMPLE</button><button class="btn teal" onclick="tutorialNextSimple()">I READ AN ANSWER →</button></div><div id="tutorialSample"></div><p>AI generates a response from the information you give it. Your job is to decide whether that response fits the situation.</p>`;
 if(n===3)body=`<div class="label">4 · THE FIRST HAUNTING</div><div class="chaos hauntedChaos"><h3>👻 NEW CONTEXT APPEARS</h3><b>The student has never used AI before.</b></div><p>What should change?</p><div class="choicegrid"><button class="choicecard" onclick="tutorialTwist('Explain unfamiliar AI terms and do not assume prior experience.')"><b>🔦 Add beginner context</b><span>Explain unfamiliar terms and assume no prior experience.</span></button><button class="choicecard" onclick="tutorialTwist('Use more advanced technical vocabulary.')"><b>🧪 Make it more technical</b><span>Add advanced vocabulary.</span></button><button class="choicecard" onclick="tutorialTwist('Nothing needs to change.')"><b>🕸️ Ignore the clue</b><span>Keep the original prompt.</span></button></div>${local.tTwist?`<div class="promptPreview">${esc(tutorialPrompt()+" "+local.tTwist)}</div><div class="actions"><button class="btn purple" onclick="tutorialNextSimple()">LOCK THE REPAIR →</button></div>`:""}`;
 if(n>=4)body=`<div class="label">5 · INVESTIGATOR TRAINING COMPLETE</div><div class="bigq">The wording was not haunted. The <em>context</em> changed.</div><p>Your three cases are <b>🧛 The Mystery Prompt → 🔮 The Missing Clues → 👻 The Haunted Answer</b>. Then you face <b>The Curse of the Confident AI</b>.</p><div class="frameworkRibbon">WHO → GOAL → SITUATION → CONSTRAINTS → OUTPUT → CHECK</div><div class="actions"><button class="btn green" onclick="finishTutorial()">ENTER THE HAUNTED LAB ✓</button></div>`;
 $("#app").innerHTML=mast(`<section class="panel hauntedCase"><div class="tiny">INVESTIGATOR TRAINING · ${Math.min(n+1,5)} OF 5</div>${body}</section>`);
}
function showTutorialSample(){const e=$("#tutorialSample");if(e)e.innerHTML='<div class="aianswer"><div class="tiny">SAMPLE AI RESPONSE</div><p>AI is technology that can recognize patterns and generate content. Generative AI can create text, images, or code from your instructions. For example, you could ask it to explain a difficult class concept in beginner-friendly language. You still need to check whether the response is accurate and appropriate.</p></div>'}
function tutorialBuild(){local.tWho=$("#tWho").value;local.tGoal=$("#tGoal").value;local.tutorial=1;save();tutorial()}
function tutorialNextSimple(){local.tutorial=Math.min(4,(local.tutorial||0)+1);save();tutorial()}
function tutorialTwist(text){local.tTwist=text;save();tutorial()}
async function finishTutorial(){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tutorialDone"})});local.tutorial=4;save();toast("Ready!");await refresh(true)}
function cards(rows){return `<div class="cards">${rows.map(([k,v])=>`<div class="gamecard"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>`}
function roleCard(){const r=role();return `<div class="rolecard hauntedRole"><div class="label">🔦 YOUR INVESTIGATION ROLE</div><h3>${esc(r)}</h3><p>${esc(ROLE_HELP[r]||"Help your team make the best decision.")}</p><div class="roleRule">EVERYONE contributes to the discussion. ANYONE may submit one answer. EVERY ACTIVE PLAYER votes. Your role is what you watch for.</div></div>`}
function proposals(field){
 const r=rec(String(snap.state.stage).startsWith("final")),rows=Object.values(r[field+"Proposals"]||{}),votes=r[field+"Votes"]||{},mine=votes[local.playerId],counts={};Object.values(votes).forEach(v=>counts[v]=(counts[v]||0)+1);
 if(!rows.length)return '<div class="submission"><b>No answers yet.</b> Anyone may submit one active answer. Everyone should contribute to the discussion.</div>';
 const total=team()?.members?.length||0,voted=Object.keys(votes).length;
 return `<div class="success"><b>${voted}/${total} team members have voted.</b> Everyone votes once. Highest vote total becomes your team evidence; ties must be resolved.</div><div class="proposalgrid">${rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)).map(p=>`<div class="proposal ${mine===p.id?"selected":""}"><div class="tiny">${esc(p.name)}${p.playerId===local.playerId?" · YOUR ANSWER":""} · ${counts[p.id]||0} vote${(counts[p.id]||0)===1?"":"s"}</div><p>${esc(p.text)}</p><div class="actions"><button class="btn ${mine===p.id?"green":"soft"}" onclick="voteProposal('${field}','${p.id}')">${mine===p.id?"✓ YOUR VOTE":"VOTE FOR THIS"}</button>${mine===p.id?`<button class="btn red" onclick="removeVote('${field}')">REMOVE MY VOTE</button>`:""}</div></div>`).join("")}</div>`;
}
function noteBox(){return `<div class="stage clueDesk"><div class="label">🕵️ EVIDENCE DESK</div><p>Found a clue, missing context, or evidence problem your team should notice?</p><input id="note" class="field" maxlength="800" placeholder="Log a clue, risk, assumption, or evidence concern…"><div class="actions"><button class="btn soft" onclick="sendNote()">LOG CLUE</button></div>${teamNotes()}</div>`}
function teamNotes(){const r=rec(String(snap.state.stage).startsWith("final")),notes=Object.values(r.notes||{});return notes.length?`<div class="actions">${notes.map(n=>`<span class="mini"><b>${esc(n.name)}:</b> ${esc(n.text)}</span>`).join("")}</div>`:""}
function mySecret(r){
 const members=team()?.members||[],idx=Math.max(0,members.findIndex(m=>m.id===local.playerId));
 return r.secrets?.[idx%(r.secrets?.length||1)]||r.secrets?.[0];
}
function roundBuildUI(r){
 if(r.style==="match")return `<div class="label">🧛 MYSTERY PROMPT</div><div class="weirdPrompt hauntedPrompt">“${esc(r.bad)}”</div><p>Which clue makes this strange prompt make sense?</p><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectMatchChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.text)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="cards")return `<div class="label">PICK AN AUDIENCE CARD</div><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectRoundChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.value)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="pickbest")return `<div class="label">PICK THE BEST PROMPT</div><p>Which option gives the AI a real goal—not just a topic?</p><div class="choicegrid">${r.choices.map((x,i)=>`<button class="choicecard" onclick="selectBestChoice(${i})"><b>${esc(x.label)}</b><span>${esc(x.text)}</span></button>`).join("")}</div><div id="roundPreview"></div>`;
 if(r.style==="secret"){
   const secret=mySecret(r);
   return `<div class="secretcard"><div class="tiny">🤫 ONLY YOU SEE THIS · DO NOT SHOW YOUR SCREEN</div><div class="label">${esc(secret?.[0]||"SECRET")}</div><div class="bigq">${esc(secret?.[1]||"")}</div><p><b>Tell your teammates out loud.</b> No one person has the whole case.</p></div><div class="success"><b>STOP + TALK FIRST.</b> Hear every teammate's clue before choosing anything below.</div><div class="label">RECONSTRUCT THE MISSING CONTEXT</div><div class="madlib stack"><label>WHO<select id="bAudience" class="field">${optionList(r.builders.audience,1)}</select></label><label>GOAL<select id="bGoal" class="field">${optionList(r.builders.goal,2)}</select></label><label>CONSTRAINTS<select id="bConstraint" class="field">${optionList(r.builders.constraint,1)}</select></label><label>OUTPUT<select id="bOutput" class="field">${optionList(r.builders.output,2)}</select></label></div><div class="actions"><button class="btn purple" onclick="assembleSecretPrompt()">ASSEMBLE + SUBMIT</button></div><div id="roundPreview"></div>`;
 }
 if(r.style==="spot")return `<div class="aianswer"><div class="tiny">AI ANSWER</div><p>${esc(r.context?.[0]?.[1]||"")}</p></div><div class="label">SPOT THE PROBLEMS</div><p>Select every problem you think matters. Your selections become a verification prompt.</p><div class="choicegrid">${r.issues.map((x,i)=>`<label class="choicecard checkboxcard"><input type="checkbox" class="issuepick" value="${i}"><span><b>${esc(x.label)}</b><br>${esc(x.text)}</span></label>`).join("")}</div><div class="actions"><button class="btn purple" onclick="submitSpotPrompt()">BUILD VERIFICATION PROMPT →</button></div><div id="roundPreview"></div>`;
 return "";
}
function buildScreen(final=false){
 const r=final?D.final:D.rounds[snap.state.round],title=final?"👾 FINAL BOSS · THE CURSE OF THE CONFIDENT AI":`CASE ${snap.state.round+1} / 3 · ${r.icon} ${r.key}`;
 if(final){
   $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">${title}</div>${roleCard()}<div class="label">FINAL FREEFORM BUILD</div><div class="bigq">“${esc(r.bad)}”</div>${cards(r.cards)}<p>This is the first time the game asks you to write the full AI instruction yourself. Use what the earlier rounds taught you.</p><div class="success"><b>One active answer per player.</b> If you submit again, your previous answer is replaced.</div><textarea id="proposal" class="prompt" placeholder="Build the strongest complete prompt / AI interaction…"></textarea><div class="actions"><button class="btn purple" onclick="submitProposal('build')">${rec(true).buildProposals&&Object.values(rec(true).buildProposals).some(p=>p.playerId===local.playerId)?"UPDATE MY FINAL ANSWER":"SUBMIT MY FINAL ANSWER"}</button></div><div class="label">TEAM ANSWERS</div>${proposals("build")}</section>`);
   return;
 }
 $("#app").innerHTML=mast(`<section class="panel"><div class="tiny">${title} · ${esc((r.style||"").toUpperCase())}</div>${roleCard()}<div class="label">CASE FILE</div><div class="bigq">“${esc(r.bad)}”</div><p>${esc(r.nudge||"")}</p>${roundBuildUI(r)}<div class="label" style="margin-top:18px">TEAM ANSWERS</div>${proposals("build")}</section>`);
}
function previewAndSubmit(text,feedback=""){
 const e=$("#roundPreview");if(!e)return;
 e.innerHTML=`<div class="promptPreview"><div class="tiny">YOUR PROPOSED TEAM ANSWER</div>${esc(text)}</div>${feedback?`<div class="success">${esc(feedback)}</div>`:""}<div class="actions"><button class="btn purple" onclick="submitGeneratedBuild()">SUBMIT THIS TO MY TEAM →</button></div>`;
 local.generatedBuild=text;save();
}
function selectMatchChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i];previewAndSubmit(x.prompt,"Choice locked locally. Submit it, then compare reasoning with your team before the vote.")}
function selectRoundChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i];previewAndSubmit(x.prompt,`Notice what changed: the audience gave the answer a target.`)}
function selectBestChoice(i){const r=D.rounds[snap.state.round],x=r.choices[i],good=i===r.best;previewAndSubmit(x.text,(good?"Strong choice. ":"Look again. ")+x.why)}
function assembleSecretPrompt(){
 const a=$("#bAudience").value,g=$("#bGoal").value,k=$("#bConstraint").value,o=$("#bOutput").value;
 if(!a||!g||!k||!o)return toast("Hear your teammates' clues, then choose every missing context piece.");
 const text=`Help ${a} ${g} ${k}. ${o}`;previewAndSubmit(text,"Your team combined distributed context before the prompt became usable.");
}
function submitSpotPrompt(){
 const r=D.rounds[snap.state.round],ids=[...document.querySelectorAll(".issuepick:checked")].map(x=>Number(x.value));
 if(!ids.length)return toast("Spot at least one problem first.");
 const selected=ids.map(i=>r.issues[i]),text=selected.map(x=>x.repair).join(" ");
 previewAndSubmit(text,`You flagged ${selected.length} issue${selected.length===1?"":"s"}. Confidence is not evidence.`);
}
async function submitGeneratedBuild(){const text=local.generatedBuild;if(!text)return toast("Make a game choice first.");const had=Object.values(rec(false).buildProposals||{}).some(p=>p.playerId===local.playerId);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"proposeBuild",text})});toast(had?"Your answer was updated.":"Your one team answer was submitted.");local.generatedBuild="";save();await refresh(true)}
function testScreen(final=false){const r=rec(final),tested=r.tested||{},done=!!tested[local.playerId],sample=sampleResponse(final);$("#app").innerHTML=mast(`<section class="panel hauntedCase"><div class="label">🧪 TEST CHAMBER · TEAM VERSION SELECTED</div><div class="bigq">See what the AI does with your team's prompt.</div><div class="success"><b>YOU HAVE THREE VALID WAYS TO TEST:</b> run it in ChatGPT, review a teammate's result, or use the sample response below. No account should block your team.</div><textarea id="teamDraft" class="prompt" readonly>${esc(r.build||"Waiting for a team answer…")}</textarea><div class="actions"><button class="btn purple" onclick="copyText('#teamDraft')">COPY TEAM PROMPT</button><a class="btn soft" href="https://chatgpt.com/" target="_blank" rel="noopener" style="text-decoration:none">OPEN CHATGPT ↗</a><button class="btn soft" onclick="toggleSampleResponse(${final?"true":"false"})">VIEW SAMPLE AI RESPONSE</button></div><div id="sampleResponseBox">${local.sampleOpen?`<div class="aianswer"><div class="tiny">SAMPLE AI RESPONSE · FALLBACK</div><p>${esc(sample)}</p></div>`:""}</div><p>Ask: Does the response fit the audience? Did it do the job? What assumptions is it making? What would you verify before acting?</p><div class="actions"><button class="btn teal" onclick="markTested('ran')">${done?"✓ RESPONSE REVIEWED":"I RAN IT IN CHATGPT →"}</button><button class="btn soft" onclick="markTested('reviewed')">I REVIEWED A TEAMMATE / SAMPLE RESPONSE →</button></div></section>`)}
function toggleSampleResponse(final=false){local.sampleOpen=!local.sampleOpen;save();testScreen(final)}
function twistScreen(final=false){const base=final?D.final:D.rounds[snap.state.round],r=rec(final);$("#app").innerHTML=mast(`<section class="panel hauntedCase"><div class="label">${final?"🚨 FINAL CURSE":"👻 THE HAUNTING"}</div>${roleCard()}<div class="chaos hauntedChaos"><h3>${final?"THE CURSE OF THE CONFIDENT AI":"NEW CONTEXT HAS APPEARED"}</h3><b>${esc(base.twist)}</b></div><p>The old answer may have made sense before. Now the context changed. Submit <b>one active repair</b>; your team will vote for the strongest curse-breaker.</p><textarea id="proposal" class="prompt" placeholder="What context or instruction must change now?">${esc(r.repairProposals&&Object.values(r.repairProposals).find(p=>p.playerId===local.playerId)?.text||r.build||"")}</textarea><div class="actions"><button class="btn purple" onclick="submitProposal('repair')">${r.repairProposals&&Object.values(r.repairProposals).some(p=>p.playerId===local.playerId)?"UPDATE MY REPAIR":"SUBMIT MY REPAIR"}</button></div><div class="label">🧟 CURSE-BREAKING OPTIONS</div>${proposals("repair")}</section>`)}
function checkScreen(final=false){const r=rec(final),mine=r.checkBallots?.[local.playerId],sample=sampleResponse(final);$("#app").innerHTML=mast(`<section class="panel hauntedCase"><div class="label">🔍 EVIDENCE CHECK</div><div class="bigq">Does the AI response you reviewed deserve your trust?</div><div class="success"><b>Judge the RESPONSE, not the prompt.</b> Use the response in your ChatGPT tab, the response a teammate showed you, or the fallback sample below.</div><details class="sampleJudge"><summary>VIEW FALLBACK SAMPLE RESPONSE</summary><div class="aianswer"><p>${esc(sample)}</p></div></details><div class="judge hauntedJudge"><label><input type="checkbox" class="check" ${mine?.checks?.[0]?"checked":""}> 👤 The response fits the audience.</label><label><input type="checkbox" class="check" ${mine?.checks?.[1]?"checked":""}> 🎯 The response accomplishes the actual goal.</label><label><input type="checkbox" class="check" ${mine?.checks?.[2]?"checked":""}> 🧱 The response respects important constraints and consequences.</label><label><input type="checkbox" class="check" ${mine?.checks?.[3]?"checked":""}> 🔍 Important claims are supported or clearly marked uncertain.</label></div><div class="actions"><button class="btn teal" onclick="submitChecks()">${mine?"UPDATE MY EVIDENCE CHECK":"LOCK MY EVIDENCE CHECK →"}</button></div><p><b>Scoring:</b> completing the Evidence Check earns your team <b>1 case point</b>. These boxes are diagnostic—not a “check everything to win” quiz. Bonus points reward strong context, recovery, and verification.</p></section>`)}
function revealScreen(final=false){const r=rec(final),t=team(),move=r.move||0;$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">${move?"🏁":"🛠️"}</div><div class="label">EVIDENCE REVEAL</div><h2>${move?`${esc(t.name)} earned ${move} case point!`:"Case complete."}</h2><p>Look up at the projected board: your <b>score</b> reflects performance and bonuses, while your <b>charm</b> shows progress through the game.</p></section>`)}
async function submitProposal(field){const text=$("#proposal").value.trim();if(!text)return toast("Write an answer first.");const r=rec(String(snap.state.stage).startsWith("final")),had=Object.values(r[field+"Proposals"]||{}).some(p=>p.playerId===local.playerId);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"proposeBuild":"proposeRepair",text})});toast(had?"Your answer was updated.":"Your one answer was submitted.");await refresh(true)}
async function voteProposal(field,proposalId){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"voteBuild":"voteRepair",proposalId})});toast("Vote updated.");await refresh(true)}
async function removeVote(field){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:field==="build"?"voteBuild":"voteRepair",proposalId:""})});toast("Vote removed.");await refresh(true)}
async function sendNote(){const text=$("#note").value.trim();if(!text)return;await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"note",text})});toast("Sent to team.");await refresh(true)}
async function markTested(mode="reviewed"){await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"tested",mode})});toast(mode==="ran"?"AI run logged.":"Response review logged.");local.sampleOpen=false;save();await refresh(true)}
async function submitChecks(){const checks=[...document.querySelectorAll(".check")].map(x=>x.checked);await req("/player-action",{method:"POST",body:JSON.stringify({playerId:local.playerId,action:"checks",checks})});toast("Your judgment is in.");await refresh(true)}
async function copyText(sel){const e=$(sel),text=e?.value||e?.textContent||"";try{if(!navigator.clipboard)throw new Error("Clipboard unavailable");await navigator.clipboard.writeText(text);toast("Copied.");}catch(_){toast("Copy blocked — press and hold the prompt to copy manually.");}}
function complete(){const sorted=[...(snap.teams||[])].sort((a,b)=>(b.totalPoints||0)-(a.totalPoints||0)),t=team(),rank=t?sorted.findIndex(x=>x.id===t.id)+1:null;$("#app").innerHTML=mast(`<section class="panel hero hauntedHero"><div class="tiny">🎃 CASE CLOSED</div><h1>THE LAB<br>IS SAFE.</h1><p>${t?`${esc(t.charm||"👻")} ${esc(t.name)} finished <b>#${rank}</b> with <b>${t.totalPoints||0} points</b>.`:"You watched the investigation unfold."}</p></section><section class="panel"><div class="label">WHAT BROKE THE CURSE?</div><div class="bigq">CONTEXT.</div><div class="frameworkRibbon">WHO → GOAL → SITUATION → CONSTRAINTS → OUTPUT → CHECK</div><p>The winning move was never a magic prompt. It was understanding the situation, giving AI useful context, testing what came back, checking evidence, and changing course when new information appeared.</p></section>`)}
function teamWait(kind,final=false){
 const t=team();
 const cfg=kind==="ready-twist"
  ?{icon:"🕯️",label:"READY FOR THE HAUNTING",title:"Your team is ready for the Haunting.",text:"Look up. The Game Master will reveal new context to the whole room when the other investigation teams are ready."}
  :{icon:"🔮",label:"READY FOR EVIDENCE REVEAL",title:"Your investigation is complete.",text:"Look up. The Game Master will reveal the case score when the room is ready. Your charm already shows game progress."};
 $("#app").innerHTML=mast(`<section class="panel wait hauntedWait"><div class="icon">${cfg.icon}</div><div class="label">${cfg.label}</div><h2>${cfg.title}</h2><p>${cfg.text}</p><div class="success"><b>${esc(t?.charm||"👻")} ${esc(t?.name||"Your team")}</b> has finished this part of the case. No more clicks needed.</div></section>`);
}
function render(){
 if(!local.name)return joinScreen();if(!snap)return;const p=me();if(!p)return joinScreen();if(p.mode==="watch")return spectator();
 const s=snap.state.stage,t=team(),phase=t?.progressPhase||"";
 if(s==="lobby"){$("#app").innerHTML=teamLobby();return}
 if(s==="tutorial"){if(p.tutorialDone){$("#app").innerHTML=mast(`<section class="panel wait"><div class="icon">✅</div><h2>You're ready.</h2><p>Meet your team and look up. The Game Master will launch Case 1.</p></section>`)}else tutorial();return}

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
 return !!a&&(a.tagName==="TEXTAREA"||a.tagName==="INPUT"||a.tagName==="SELECT")&&!a.readOnly&&!a.disabled;
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