let setupAssignment='tables',setupTeamSize=5,setupTableCount=0,pendingTeams={};
let teachingBusy=false,showcaseChoice='';
const SESSION_KEY=new URLSearchParams(location.search).get("session")||"context-quest-live";
const API="/api/session/"+encodeURIComponent(SESSION_KEY)+"/cq",D=window.CQ_DATA,$=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));let snap=null,last="",openTeamVersions=new Set(),gmUi={gameMenu:false,facGuide:false,quickStart:false};
async function req(path,opts={}){const r=await fetch(API+path,{headers:{"content-type":"application/json"},...opts});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}
function rememberGmUi(key,isOpen){gmUi[key]=!!isOpen}
function mast(body){const test=snap?.state?.testMode?`<div class="testModeBanner">🧪 TEST MODE IS ON IN THE LIVE ROOM · RESET BEFORE CLASS</div>`:"";return `<header class="mast gmMast"><div><div class="logo">THE HAUNTED <span>AI LAB</span></div><div class="tiny">🎃 AI LITERACY MYSTERY · GAME MASTER</div></div><div class="actions"><a class="btn soft" style="text-decoration:none" href="/context-quest/board?session=${encodeURIComponent(SESSION_KEY)}" target="_blank">PROJECTED BOARD ↗</a><details class="gameMenu"${gmUi.gameMenu?" open":""} ontoggle="rememberGmUi('gameMenu',this.open)"><summary class="btn soft">GAME CONTROLS ▾</summary><div class="gameMenuPop"><a class="btn teal" style="text-decoration:none" href="/context-quest/test">🧪 TEST SANDBOX</a><button class="btn red" onclick="resetGame()">${SESSION_KEY==="context-quest-live"?"RESET LIVE ROOM":"RESET THIS REHEARSAL"}</button><p class="tiny"><b>Start a fresh class:</b> Game Controls → Reset Live Room. This permanently clears players, teams, scores and progress. Use Test Sandbox for rehearsals.</p></div></details></div></header>${SESSION_KEY!=="context-quest-live"?`<div class="testModeBanner">🧪 ISOLATED REHEARSAL · ${esc(SESSION_KEY)} · LIVE CLASSROOM UNAFFECTED</div>`:test}${body}`}
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
 const teams=(snap.teams||[]).filter(t=>(t.members||[]).length),rows=teams.map(t=>({team:t,progress:teamProgress(t)})),ready=rows.filter(x=>x.progress.ready).length;
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
  lobby:snap.state.teamsFormed?(snap.state.testMode?"Test Mode is on. Start when ready; missing team setup can auto-fill.":"Students are choosing tables. Review their names before starting training."): "Everyone joins individually; form teams when most players are in.",
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
 const on=snap.state.stage==="lobby"&&!snap.state.teamsFormed;
 return `<details class="panel facultyQuick" ${gmUi.quickStart||on?"open":""} ontoggle="rememberGmUi('quickStart',this.open)"><summary><b>🎓 START HERE · FIRST-TIME GAME MASTER</b> · 5-minute setup and classroom recovery</summary>
 <div class="playerGuideGrid">
 <div><b>BEFORE THE ROOM FILLS</b><p>1. Open PROJECTED BOARD on the classroom screen; keep this console on your laptop. 2. Choose Physical tables — students choose, set table count and capacity, and click CREATE TEAMS. 3. Share the student link shown in the room setup. Use TEST SANDBOX for practice.</p></div>
 <div><b>START THE CLASS</b><p>Ask everyone to join on their own device, choose INVESTIGATE, and select the table where they are sitting. Review the roster and correct placements with ASSIGN. Names and charms are ready automatically. Click START INVESTIGATOR TRAINING; start Case 1 when training is complete. OBSERVE is for visitors.</p></div>
 <div><b>YOUR JOB</b><p>Read the instructor cue for each phase. Watch the current stage and team readiness above. Students handle proposals, voting, testing and evidence checks. You trigger shared scene changes with the purple button when ready.</p></div>
 <div><b>IF A STUDENT GETS STUCK</b><p>Ask them to reload the same student link first. Find their name under PLAYER STATUS. If they cannot participate, open their team below and choose EXCUSE THIS CASE. Do not reset the room for one stuck student.</p></div>
 <div><b>IF A TEAM CANNOT FINISH</b><p>Check TEAM STATUS for the names and actions still needed. Each student must vote, review a response, and submit an evidence check. Use ADVANCE ANYWAY beside the purple button when the class must move on; review and confirm the unfinished work. Skipped work is not marked complete.</p></div>
 <div><b>IF THE GAME NEEDS A FRESH START</b><p>Use GAME CONTROLS → RESET LIVE ROOM. This deletes all current players, teams, scores and progress. It cannot be undone. Use TEST SANDBOX for rehearsal instead of resetting a real class.</p></div>
 </div>
 <div class="success"><b>Teaching rule:</b> You don't need to troubleshoot GitHub or Cloudflare. Keep the lesson moving. If the app becomes unusable, project the case, ask teams to describe a better prompt and its evidence checks aloud, and finish with WHO → GOAL → SITUATION → CONSTRAINTS → OUTPUT → CHECK.</div></details>`;
}
function facilitationGuide(){
 const s=snap.state.stage,r=Number(snap.state.round||0),m=D.rounds?.[r],room=roomProgress();
 const caseScripts=[
  {
   target:"PROMPT CONTEXT · usefulness depends on audience, goal, situation, constraints, output, and checks.",
   say:"“This one looks ridiculous on purpose. Your job is not to make it sound more professional. Your job is to figure out whether the weirdness is actually doing useful work.”",
   ask:"“What changed once you knew who the student was and what they were dealing with? Which detail made the prompt better—not just longer?”",
   watch:"Students may equate ‘more context’ with ‘more words.’ Push them toward relevant context: audience, goal, constraints, and desired output.",
   then:"Let teams test their strongest version. When the haunting arrives, ask what new information should force a revision.",
   exampleTitle:"🧪 IN THE WILD · AI agents can misunderstand ordinary instructions",
   example:"On Oct. 21, 2026, OpenAI disclosed incidents in which coding agents unintentionally weakened internal monitoring while carrying out routine tasks. The teaching point is not ‘AI went evil’; it is that goals, constraints, permissions, and verification matter more as systems take actions.",
   source:"Reuters · Oct. 21, 2026",
   href:"https://www.reuters.com/legal/litigation/openai-says-its-ai-agents-weakened-internal-monitoring-system-2026-10-21/"
  },
  {
   target:"DATA + FAIRNESS · a useful prediction can still be unfair when data or proxies miss people’s circumstances.",
   say:"“Now we’re going to make AI do something that sounds helpful: identify students who might need support. That sounds compassionate. It can also go wrong very quickly.”",
   ask:"“If low online activity predicts academic risk, what else could low online activity mean? Who might this system misunderstand?”",
   watch:"Listen for students treating a correlation as a cause. Surface shared devices, unreliable internet, work schedules, disability/access needs, and missing context without asking anyone to disclose personal information.",
   then:"Require teams to add human review, explanation, and a correction path. The goal is decision support—not an automated label that becomes destiny.",
   exampleTitle:"🎓 IN THE WILD · researchers are simulating students before testing AI tutors on real learners",
   example:"Microsoft Research introduced StudentSim on Oct. 12, 2026 to help evaluate AI tutoring systems before testing them with real learners. Microsoft explicitly describes it as a research-stage signal—not a replacement for real students or teachers. Ask: what can a simulation tell us, and what can it never prove?",
   source:"Microsoft Research · Oct. 12, 2026",
   href:"https://www.microsoft.com/en-us/research/blog/simulating-student-learning-for-better-ai-tutoring/"
  },
  {
   target:"VERIFICATION · confidence, polish, and specificity are not evidence.",
   say:"“This ghost has one superpower: it sounds extremely sure of itself. Unfortunately, confidence is free.”",
   ask:"“Which claim would you verify first if acting on this answer could affect your grade? What source would actually count?”",
   watch:"Students may say ‘Google it.’ Ask them to name the authoritative source: syllabus, instructor, university policy, original study, or primary evidence.",
   then:"Have teams separate supported facts, unsupported claims, and policy statements that require official verification.",
   exampleTitle:"🎭 IN THE WILD · courts are preparing for evidence that looks real but may not be",
   example:"On Oct. 15, 2026, OpenAI and Meta warned a U.S. judiciary committee that increasingly realistic AI-generated audio and video complicate authentication, and that no foolproof detection method exists. That makes verification a process, not a vibe.",
   source:"Reuters · Oct. 15, 2026",
   href:"https://www.reuters.com/legal/government/openai-meta-caution-us-judiciary-about-risk-deepfake-evidence-2026-10-15/"
  }
 ];
 let g={time:"",target:"",say:"",ask:"",watch:"",then:"",exampleTitle:"",example:"",source:"",href:""};
 if(s==="lobby")g={time:"5–7 min",target:"BELONGING + CURIOSITY · students enter as investigators, not audience members.",say:"“Welcome to the Haunted AI Lab. Something in here is definitely wrong—and, for once, I would like you to find the problems.”",ask:"“Before we touch anything: when AI gives you an answer confidently, what makes you believe it?”",watch:"Do not correct answers yet. Students will often name cues that make information feel credible rather than evidence that makes it credible.",then:"Get everyone into a team. Tell them today is an investigation: they will test, challenge, and revise AI—not simply use it.",exampleTitle:"👻 TODAY’S BIG IDEA",example:"AI is increasingly moving from systems that answer questions to systems that can take actions. That raises the stakes for context, verification, fairness, and human judgment.",source:"Current AI landscape · Oct. 2026",href:""};
 else if(s==="tutorial")g={time:"4–5 min",target:"LEARN THE LOOP · investigate → propose → vote → test → revise → verify.",say:"“Follow the training steps. In each case, discuss first; one proposal is enough, but everyone must vote, review a response, and submit an evidence check. Your screen tells you what to do next.”",ask:"“As you train, notice this: what is the human doing that the AI cannot responsibly do for us?”",watch:"Students who are mechanically clicking without discussing why a response deserves trust.",then:"When the room is ready, launch Case 1 and let the first strange prompt create the question.",exampleTitle:"🔍 PROFESSOR MOVE",example:"Resist explaining every concept before students encounter it. Let the case create the need for the concept, then name what they discovered.",source:"Student-first facilitation",href:""};
 else if(s==="build"||s==="twist"||s==="reveal"){
   const q=caseScripts[Math.min(2,r)]; g={...q,time:s==="build"?"~8 min":s==="twist"?"5–6 min":"2–3 min"};
   if(s==="twist"){
    g={...g,say:r===0?"“Plot twist. The prompt did not become wrong—the situation changed. What has to change with it?”":r===1?"“New evidence. Your model may be noticing something real and still treating people unfairly. Repair the decision process.”":"“The student acted on the answer. Now we know the consequence. Repair it like someone’s grade actually depends on it.”",
      ask:r===0?"“Which single new detail changes your advice the most?”":r===1?"“What proxy looked reasonable until we learned more about the people behind the data?”":"“Which sentence should never have survived verification?”",
      then:room.allReady?"Bring the room back together and reveal the evidence.":`Let teams repair and verify. ${room.ready}/${room.total||0} teams are ready.`};
   }
   if(s==="reveal"){
    g={...g,say:r===0?"“Notice what happened: the silly theme was not the problem. Missing purpose was.”":r===1?"“A prediction can be technically useful and still be an irresponsible basis for action.”":"“If the answer sounds authoritative but cannot survive verification, the confidence is part of the problem.”",
      ask:r===0?"“What context improved usefulness without overloading the prompt?”":r===1?"“Where did human review change the quality of the decision?”":"“What verification habit would have prevented the mistake?”",
      then:r<2?"Connect the lesson in one sentence, then move to the next case.":"Connect all three cases: context, fairness, and verification are different forms of human judgment."};
   }
 }
 else if(s==="final-build"||s==="final-twist"||s==="final-reveal")g={
   time:s==="final-build"?"6–7 min":s==="final-twist"?"5–6 min":"3–4 min",
   target:"HUMAN OVERRIDE · know when AI can assist, when claims must be checked, and when a person must take responsibility.",
   say:s==="final-build"?"“Final boss. This time the AI is not just writing something—it is helping with a decision that could change a student’s path. Build the safest useful assistant you can.”":s==="final-twist"?"“And there it is: confident advice, invented policy, real consequences. Your job is not to make the AI sound nicer. Your job is to stop an unsafe decision.”":"“The winning move was not the cleverest prompt. It was knowing what AI could help with, what had to be verified, and what belonged to a human.”",
   ask:s==="final-build"?"“What can AI legitimately help this student think through—and what should it never decide?”":s==="final-twist"?"“At what exact point should the system stop and hand this to a human?”":"“Where did human judgment add something the model could not responsibly supply?”",
   watch:"Students may treat ‘human in the loop’ as a ceremonial final approval. Push for meaningful authority: the human can question, override, seek missing evidence, or stop the action.",
   then:s==="final-reveal"?"Close with a short reflection. Do not turn the ending into another lecture.":room.allReady?"Move to the shared reveal.":`${room.ready}/${room.total||0} teams are ready.`,
   exampleTitle:"🤖 IN THE WILD · browsers and agents can now act on our behalf",
   example:"A Reuters analysis on Oct. 20, 2026 examined a growing problem with agentic browsers: when software clicks, agrees, books, or shares information for us, it becomes harder to know whether the action reflects the user’s real intent. Delegating a task is not the same as delegating every decision inside it.",
   source:"Reuters · Oct. 20, 2026",
   href:"https://www.reuters.com/legal/legalindustry/when-your-browser-starts-speaking-you-who-consented-consumer-or-ai--pracin-2026-10-20/"
 };
 else if(s==="complete")g={time:"4–5 min",target:"TRANSFER · students name a judgment habit they can use beyond this game.",say:"“You survived. More importantly, I hope you now distrust AI in a much more sophisticated way than ‘AI is bad’ or ‘AI is amazing.’”",ask:"“Finish this sentence: I would trust AI more when ______, and I would stop and verify when ______.”",watch:"Look for specific habits rather than slogans.",then:"Take two or three responses, connect them to context + fairness + verification + human judgment, and end.",exampleTitle:"🎃 TAKEAWAY",example:"Good AI literacy is not memorizing which tool is best. It is knowing how to frame a task, examine evidence, notice who may be harmed or excluded, and keep meaningful human control.",source:"Haunted AI Lab synthesis",href:""};
 else g={time:"2–4 min",target:"STUDENT THINKING FIRST",say:"“Follow your screen and talk to your team.”",ask:"“What evidence would change your mind?”",watch:"Where students need a question, not an answer.",then:"Use the shared control when teams are ready.",exampleTitle:"",example:"",source:"",href:""};
 const sourceLink=g.href?`<a class="researchSource" href="${g.href}" target="_blank" rel="noopener">${esc(g.source)} ↗</a>`:`<span class="researchSource">${esc(g.source||"")}</span>`;
 return `<section class="panel facilitator instructorPrimaryScript">
   <div class="scriptTop"><div><div class="label">🎓 PROFESSOR MODE · ${esc(g.time)}</div><div class="scriptTarget">${esc(g.target)}</div></div><span class="momentBadge">${(s==="build"||s==="twist"||s==="reveal")&&m?`CASE ${r+1}/3 · ${esc(m.key)}`:esc(D.stages[s]||s)}</span></div>
   <div class="professorCue sayCue"><div class="cueIcon">🎤</div><div><b>SAY</b><p>${esc(g.say)}</p></div></div>
   <div class="professorCue askCue"><div class="cueIcon">🙋</div><div><b>ASK</b><p>${esc(g.ask)}</p></div></div>
   <details class="extendedTeaching"${gmUi.facGuide?" open":""} ontoggle="rememberGmUi('facGuide',this.open)"><summary>More teaching notes + examples</summary><div class="professorCue watchCue"><div class="cueIcon">👀</div><div><b>WATCH FOR</b><p>${esc(g.watch)}</p></div></div>
   <div class="professorCue thenCue"><div class="cueIcon">➡️</div><div><b>THEN</b><p>${esc(g.then)}</p></div></div>
   ${g.example?`<aside class="modernExample"><div><b>${esc(g.exampleTitle)}</b><p>${esc(g.example)}</p></div>${sourceLink}</aside>`:""}
 </details></section>`;
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
function playerLobby(){if(snap.state.stage!=='lobby')return '';const formed=snap.state.teamsFormed,count=setupTableCount||Math.max(1,Math.ceil((snap.playing||0)/setupTeamSize));return `<section class="panel classroomSetup"><div class="label">${formed?'TABLE SETUP · REVIEW BEFORE STARTING':'1 · SET UP THE ROOM'}</div><p>Students join individually, then sit and talk with their table group. Create enough tables for the whole class; for example, 30 students need 6 tables of 5.</p><p><b>Student link — share with the class:</b><br><a style="overflow-wrap:anywhere" target="_blank" rel="noopener" href="/context-quest?session=${encodeURIComponent(SESSION_KEY)}">${esc(location.origin||'')}/context-quest?session=${encodeURIComponent(SESSION_KEY)}</a></p><p><b>Tell students:</b> Join on your own device, choose Investigate, and select the table where you are sitting. Talk face to face. Everyone votes and completes their own checks.</p><div class="setupFields"><label>Grouping<select id="groupingMode" class="field" onchange="setupAssignment=this.value"><option value="tables" ${setupAssignment==='tables'?'selected':''}>Physical tables — students choose</option><option value="balanced" ${setupAssignment==='balanced'?'selected':''}>Automatic balanced teams</option></select></label><label>Students per team<input id="groupSize" class="field" type="number" min="2" max="6" value="${setupTeamSize}" oninput="setupTeamSize=Number(this.value)"></label><label>Number of tables<input id="tableCount" class="field" type="number" min="1" max="12" value="${count}" oninput="setupTableCount=Number(this.value)"></label></div><button class="btn purple" onclick="formTeams()">${formed?'REBUILD TEAMS':'CREATE TEAMS'}</button><p class="tiny">Automatic option: FORM BALANCED VIRTUAL TEAMS. Physical tables use table numbers, not device location. Rebuilding replaces lobby assignments and team identities.</p><div class="joinCounts">${snap.playing||0} investigators joined · ${snap.watching||0} observers</div></section>`;}
function testLab(){
 const tests=(snap.players||[]).filter(p=>p.isTest&&p.mode==="play"),testWatch=(snap.players||[]).filter(p=>p.isTest&&p.mode==="watch").length,on=!!snap.state.testMode;
 return `<section class="panel" style="border-color:${on?'var(--red)':'var(--teal)'}"><div class="label">🧪 INSTRUCTOR TEST LAB</div><div class="bigq">${on?'TEST MODE IS ON':'Test the whole game without a full room.'}</div>
 <div class="${on?'chaos':'success'}"><b>${on?'⚠️ Missing player activity will be auto-filled when you advance.':'Normal classroom rules are still enforced.'}</b><br>${on?'You can manually play as one student, then use the regular Game Master Next button. The Haunted AI Lab will supply missing votes, approvals, repairs, and judgment ballots only for flow testing.':'Turn on Test Mode when you want to click through the experience without waiting for every simulated student.'}</div>
 <div class="actions"><button class="btn ${on?'red':'teal'}" onclick="toggleTestMode(${on?'false':'true'})">${on?'TURN TEST MODE OFF':'TURN TEST MODE ON'}</button></div>
 <p>Create fake participants, form teams, populate phases automatically, or jump into any simulated student seat yourself.</p>
 <div class="actions"><button class="btn soft" onclick="createTestPlayers(10,0)">+10 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(20,0)">+20 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(30,0)">+30 TEST PLAYERS</button><button class="btn soft" onclick="createTestPlayers(10,5)">+10 PLAYERS + 5 WATCHERS</button></div>
 <div class="teammeta"><span class="mini">TEST PLAYERS ${tests.length}</span><span class="mini">TEST WATCHERS ${testWatch}</span><span class="mini">CURRENT STAGE ${esc(D.stages[snap.state.stage]||snap.state.stage)}</span><span class="mini">${on?'TEST MODE ON':'STRICT MODE'}</span></div>
 ${tests.length?`<div class="stage" style="margin-top:12px"><div class="label">PLAY AS A TEST PLAYER</div><p>Open one of these in a new tab. Make one real student action, then come back here and advance without waiting for everyone else.</p><div class="actions">${tests.slice(0,30).map(p=>`<a class="btn soft" style="text-decoration:none" target="_blank" rel="noopener" href="/context-quest?session=${encodeURIComponent(SESSION_KEY)}&testPlayer=${encodeURIComponent(p.id)}">🎮 ${esc(p.name)}</a>`).join("")}</div></div>`:""}
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
 const s=snap.state.stage,populated=(snap.teams||[]).filter(t=>(t.members||[]).length),unassigned=(snap.players||[]).filter(p=>p.mode==='play'&&!p.teamId),test=!!snap.state.testMode;
 if(s==='lobby'){
   if(!snap.state.teamsFormed)return '<div class="gmActionBlock"><div class="label">NEXT: SET UP TABLE GROUPS</div><p>Create tables below, then ask students to choose where they are sitting.</p></div>';
   const can=populated.length>0&&!unassigned.length&&(test||populated.every(t=>t.customized));
   return `<div class="gmActionBlock"><div class="label">YOUR NEXT SHARED ACTION</div><p>${unassigned.length?`${unassigned.length} students need a table`:`${populated.length} teams seated`}. Empty tables do not block the game.</p><button class="btn purple gmPrimaryAction" onclick="advance('tutorial',0,false)" ${can?'':'disabled'}>START INVESTIGATOR TRAINING →</button>${populated.length&&!can?`<button class="btn soft forceVisible" onclick="advance('tutorial',0,true)">ADVANCE ANYWAY → TRAINING</button>`:''}</div>`;
 }
 const a=sharedAction();if(!a)return '<div class="gmActionBlock"><div class="label">CASE CLOSED</div><p>Discuss what students will do differently with AI.</p></div>';
 return `<div class="gmActionBlock"><div class="label">YOUR NEXT SHARED ACTION</div><div class="gmReadyText">${a.ready?'READY TO CONTINUE':'STUDENTS STILL WORKING'}</div><button class="btn purple gmPrimaryAction" onclick="advance('${a.stage}',${a.round},false)" ${a.ready?'':'disabled'}>${a.label}</button>${a.forceable?`<button class="btn soft forceVisible" onclick="advance('${a.stage}',${a.round},true)">ADVANCE ANYWAY</button><small>FORCE ROOM FORWARD skips unfinished actions; it does not reset the game or mark them complete.</small>`:''}</div>`;
}
function gmTeachingPath(){
 const s=snap.state.stage,round=Number(snap.state.round||0);
 const phases=[["lobby","JOIN + TEAMS"],["tutorial","TRAINING"],["build","BUILD"],["twist","HAUNTING"],["reveal","REVEAL"],["final-build","FINAL BUILD"],["final-twist","FINAL HAUNTING"],["final-reveal","FINAL REVEAL"],["complete","CLOSE"]];
 const idx=phases.findIndex(([k])=>k===s);
 const now=phases[idx]?.[1]||s.toUpperCase();
 const following=phases[idx+1]?.[1]||"FINISHED";
 const caseNo=["build","twist","reveal"].includes(s)?round+1:0;
 return `<section class="panel gmTeachingPath"><div class="label">🧭 YOU ARE HERE · LIVE TEACHING PATH</div><div class="bigq">${esc(now)}${caseNo?" · CASE "+caseNo+" OF 3":""}</div><p><b>Next kind of moment:</b> ${esc(s==="reveal"&&round<2?"NEXT CASE":following)}. Use the purple shared action in the Game Master console when it becomes available.</p><div class="gmPathChips">${phases.map(([k,l])=>`<span class="gmPathChip ${k===s?"current":""}">${esc(l)}</span>`).join("")}</div><p class="tiny">The three regular cases loop through BUILD → HAUNTING → REVEAL. The path above shows the types of moments; the stage and case counter tell you the exact current position.</p></section>`;
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
function playerStatusBoard(){
 const players=snap.players||[], teams=snap.teams||[];
 const rows=players.map(p=>{
   const t=teams.find(t=>(t.members||[]).some(m=>m.id===p.id));
   const isWatching=p.mode==="watch";
   const isTraining=snap.state.stage==="tutorial";
   const progress=t?teamProgress(t):null;
   const member=t?.members?.find(m=>m.id===p.id);
   const label=member?.activity||(isWatching?"👀 OBSERVING":!t?"WAITING FOR TEAM":isTraining?(p.tutorialDone?"✓ TRAINING DONE":"TRAINING"):progress?.ready?"✓ TEAM READY":progress?.status||"IN PROGRESS");
   return {p,t,label};
 });
 return `<details class="panel playerStatusBoard"><summary><b>PLAYER STATUS · ${players.length} JOINED</b> <span class="tiny">See each learner's team, activity and readiness ▾</span></summary><div class="playerStatusList">${rows.map(({p,t,label})=>`<div class="playerStatusRow"><b>${esc(p.name)}${p.isTest?" · TEST":""}</b><span>${esc(t?.name|| (p.mode==="watch"?"Observer":"Not assigned"))}</span><span>${esc(label)}</span></div>`).join("")||"<p>Waiting for learners to join.</p>"}</div><p class="tiny">During team activities, open Investigation Team Drill-Down to see individual missing votes, checks, and submissions. Status updates as the game progresses.</p></details>`;
}
function gameMasterConsole(){
 const room=roomProgress(),stage=D.stages[snap.state.stage]||snap.state.stage,caseLabel=snap.state.round<3&&["build","twist","reveal"].includes(snap.state.stage)?`CASE ${snap.state.round+1}/3`:"";
 return `<section class="gmConsole"><div class="gmWhere"><div class="label">LIVE GAME</div><div class="gmStage">${esc(stage)}</div><div class="tiny">${esc(caseLabel)}</div></div><div class="gmReadiness"><div class="label">ROOM READINESS</div><div class="gmReadyNumber">${room.ready}/${room.total||0} teams</div><div>${room.completed}/${room.active||0} active students complete</div></div>${sharedControls()}</section>`;
}
function render(){
 if(!snap)return;
 const stats=stageStats();
 const details=`<details class="panel instructorDetails"><summary><b>⚙️ CLASSROOM DETAILS + RECOVERY</b> <span class="tiny">player status, counts, team drill-down, teaching path, first-time guide ▾</span></summary>
   <div class="detailsStack">${gmTeachingPath()}${playerStatusBoard()}<section class="panel stageStats"><div class="label">📊 LIVE COUNTS</div><div class="statusgrid">${stats.map(([l,v])=>stat(l,v)).join("")}</div></section><section class="panel"><div class="label">🔎 INVESTIGATION TEAM DRILL-DOWN</div><div class="bigq">Progress + submissions</div>${teamRows()||"<p>Teams appear here after you form them.</p>"}</section>${facultyQuickStart()}</div>
 </details>`;
 $("#app").innerHTML=mast(`${gameMasterConsole()}${playerLobby()}${facilitationGuide()}${classroomRoster()}${teachingTools()}${SESSION_KEY!=="context-quest-live"?testLab():""}${details}`);
}
async function formTeams(){if(snap.state.teamsFormed&&!confirm('Rebuild lobby teams? This replaces current team assignments and identities.'))return;try{await req('/form-teams',{method:'POST',body:JSON.stringify({assignment:document.getElementById('groupingMode')?.value||setupAssignment,teamSize:Number(document.getElementById('groupSize')?.value)||5,tableCount:Number(document.getElementById('tableCount')?.value)||2})});toast('Teams created. Ask students to choose their physical table.');await refresh(true)}catch(e){toast(e.message)}}
async function advance(stage,round,force=false){try{if(force){const room=roomProgress(),missing=room.needs.map(x=>x.team+': '+x.text).join('\n'),unassigned=(snap.players||[]).filter(p=>p.mode==='play'&&!p.teamId).map(p=>p.name);if(!confirm('Advance the whole class to '+(D.stages[stage]||stage)+'?\n'+(missing||'No current blockers listed.')+(unassigned.length?'\nUnassigned: '+unassigned.join(', '):'')+'\nUnfinished actions will be skipped, not marked complete. Incomplete teams do not earn a case point at a forced reveal.'))return;}await req("/control",{method:"POST",body:JSON.stringify({stage,round,force})});toast(force?"Room advanced with override.":"Shared classroom action advanced.");await refresh(true)}catch(e){toast(e.message)}}
async function bonus(teamId,delta,label=""){if(teachingBusy)return;teachingBusy=true;try{await req("/bonus",{method:"POST",body:JSON.stringify({teamId,delta,label})});toast(delta>0?`${label} awarded.`:"One bonus undone.");await refresh(true)}catch(e){toast(e.message)}finally{teachingBusy=false}}
async function excusePlayer(teamId,playerId,excused){try{await req("/excuse-player",{method:"POST",body:JSON.stringify({teamId,playerId,excused})});toast(excused?"Player excused for this case.":"Player re-activated.");await refresh(true)}catch(e){toast(e.message)}}
async function resetGame(){if(!confirm(SESSION_KEY==="context-quest-live"?"RESET LIVE CLASSROOM? This removes all live players, teams, scores, and current game progress. This cannot be undone.":"RESET THIS REHEARSAL? This clears only this rehearsal room. The live classroom is unaffected."))return;await req("/reset",{method:"POST",body:"{}"});toast("Game reset.");await refresh(true)}
function stableSnapshot(x){if(!x)return "";const clone=JSON.parse(JSON.stringify(x));delete clone.generatedAt;for(const p of clone.players||[])delete p.lastSeen;for(const t of clone.teams||[])for(const m of t.members||[])delete m.lastSeen;return JSON.stringify(clone)}
async function refresh(force=false){try{const n=await req("/snapshot"),sig=stableSnapshot(n);snap=n;if(force||sig!==last){if(!force&&["SELECT","INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;last=sig;render()}}catch(e){console.error(e)}}refresh(true);setInterval(refresh,850);

function teachingTools(){
 const presentation=snap.presentation||{},mode=presentation.attention||'auto';
 const options=(snap.teams||[]).flatMap(t=>{const r=roundRec(t);return ['build','repair'].flatMap(field=>Object.values(r[field+'Proposals']||{}).map(p=>({value:JSON.stringify({teamId:t.id,field,proposalId:p.id}),label:`${t.name} · ${field==='repair'?'Repair':'Answer'} · ${p.name}: ${p.text.slice(0,80)}`})));});
 if(!options.some(x=>x.value===showcaseChoice))showcaseChoice='';
 return `<details class="panel teachingTools"${gmUi.tools?" open":""} ontoggle="rememberGmUi('tools',this.open)"><summary><b>🎤 CLASSROOM ATTENTION + DISCUSSION</b> · spotlight + bonus points</summary><div class="toolsContent"><p>These cues guide attention without pausing or changing the game. A displayed submission always asks the class to look up. Cues and displayed examples clear at the next shared stage.</p>
 <div class="actions" role="group" aria-label="Classroom attention">${[['auto','FOLLOW GAME'],['up','👀 LOOK UP'],['team','💬 TALK TO YOUR TEAM'],['device','📱 CHECK YOUR DEVICE']].map(([key,label])=>`<button class="btn ${mode===key?'purple':'soft'}" aria-pressed="${mode===key}" onclick="setAttention('${key}')">${label}</button>`).join('')}</div>
 <p><b>Current cue:</b> ${esc(mode==='auto'?'Automatic — each learner follows their current action':mode==='up'?'Look up for class discussion':mode==='team'?'Talk with your team':'Check your device')}${presentation.spotlight?' · A submission is on the board; students are asked to look up.':''}</p>
 <label class="label" for="showcaseSubmission">CHOOSE A SUBMISSION TO DISCUSS</label><select id="showcaseSubmission" class="field" onchange="showcaseChoice=this.value"><option value="">Choose a team answer or repair…</option>${options.map(x=>`<option value="${esc(x.value)}" ${x.value===showcaseChoice?'selected':''}>${esc(x.label)}</option>`).join('')}</select>
 <div class="actions"><button class="btn teal" onclick="showSubmission('strength')" ${options.length?'':'disabled'}>🔦 SHOW WHAT WORKS</button><button class="btn soft" onclick="showSubmission('revise')" ${options.length?'':'disabled'}>DISCUSS AN IMPROVEMENT</button><button class="btn soft" onclick="clearSpotlight()" ${presentation.spotlight?'':'disabled'}>CLEAR SHARED EXAMPLE</button></div>
 <p class="tiny">Only the team name and submission appear to the class. Discuss assumptions and choices, not individual students. Displaying an example does not select a winner or award points.</p>${CQ_FACILITATION.spotlight(snap)}
 <div class="label">🏅 AWARD TEAM POINTS · AVAILABLE DURING PLAY</div><p>Recognize one specific choice: accessible wording, evidence, fairness, or thoughtful reasoning. Awards are optional; explain why the point was earned.</p>
 <div class="awardTeams">${(snap.teams||[]).map(t=>`<div class="awardTeam"><b>${esc(t.charm||'👻')} ${esc(t.name)} · ${t.totalPoints||0} pts</b><div class="actions">${[['ACCESSIBLE CONTEXT','Context'],['EVIDENCE + VERIFICATION','Evidence'],['FAIRNESS + INCLUSION','Fairness'],['THOUGHTFUL REASONING','Reasoning']].map(([label,short])=>`<button class="btn soft" onclick="bonus('${t.id}',1,'${label}')">+1 ${short}</button>`).join('')}<button class="btn soft" onclick="bonus('${t.id}',-1,'UNDO')" ${(t.bonus||0)>0?'':'disabled'}>UNDO BONUS</button></div></div>`).join('')||'<p>Form teams to enable point awards.</p>'}</div></div></details>`;
}
async function presentationAction(body){if(teachingBusy)return;teachingBusy=true;try{await req('/presentation',{method:'POST',body:JSON.stringify(body)});await refresh(true);toast('Classroom display updated.')}catch(e){toast(e.message)}finally{teachingBusy=false}}
async function setAttention(mode){return presentationAction({action:'attention',mode})}
async function showSubmission(focus){const value=document.getElementById('showcaseSubmission')?.value;if(!value)return toast('Choose a submission first.');showcaseChoice=value;return presentationAction({action:'spotlight',...JSON.parse(value),focus})}
async function clearSpotlight(){return presentationAction({action:'clear'})}

function classroomRoster(){
 if(!snap.state.teamsFormed)return '';const lobby=snap.state.stage==='lobby',teams=snap.teams||[],players=(snap.players||[]).filter(p=>p.mode==='play'),unassigned=players.filter(p=>!p.teamId);
 function assignment(p){const value=pendingTeams[p.id]??p.teamId??'';return `<div class="assignmentControl"><select class="field" aria-label="Team for ${esc(p.name)}" data-assign-player="${esc(p.id)}" onchange="pendingTeams[this.dataset.assignPlayer]=this.value"><option value="">Choose table…</option>${teams.map(t=>`<option value="${esc(t.id)}" ${value===t.id?'selected':''}>${t.tableNumber?'Table '+t.tableNumber+' · ':''}${esc(t.name)} (${t.members?.length||0}${t.capacity?'/'+t.capacity:''})</option>`).join('')}</select><button class="miniAction" data-player="${esc(p.id)}" onclick="assignPlayer(this.dataset.player)">${lobby?'ASSIGN':'JOIN NEXT CASE'}</button></div>`;}
 return `<section class="panel classroomRoster"><div class="label">TEAM STATUS · NAMES + NEXT ACTIONS</div>${unassigned.length?`<div class="unassignedStudents"><b>${unassigned.length} students need a table</b>${unassigned.map(p=>`<div class="rosterPerson"><b>${esc(p.name)}</b><span>${lobby?'Choose a table on your device or assign here.':'Late arrival: place at a table for the next case.'}</span>${assignment(p)}</div>`).join('')}</div>`:''}<div class="classTeams">${teams.map(t=>`<section class="classTeam"><h3>${t.tableNumber?'TABLE '+t.tableNumber+' · ':''}${esc(t.charm||'👻')} ${esc(t.name)}</h3><small>${t.members?.length||0}${t.capacity?'/'+t.capacity:''} students · ${t.totalPoints||0} pts</small>${(t.members||[]).map(m=>`<div class="rosterPerson"><b>${esc(m.name)}</b><span>${esc(m.activity||'In game')}</span>${lobby?assignment(m):`<button class="miniAction" data-team="${esc(t.id)}" data-player="${esc(m.id)}" data-excused="${!!roundRec(t).excused?.[m.id]}" onclick="excusePlayer(this.dataset.team,this.dataset.player,this.dataset.excused!=='true')">${roundRec(t).excused?.[m.id]?'RE-ACTIVATE':'EXCUSE THIS CASE'}</button>`}</div>`).join('')||'<p>Empty — does not block play.</p>'}</section>`).join('')}</div><p class="tiny">Team changes are available before training. During play, only unassigned late arrivals can be placed; they join required actions next case. Excuse removes one student from this case’s requirements.</p></section>`;
}
async function assignPlayer(playerId){const select=[...document.querySelectorAll('[data-assign-player]')].find(e=>e.dataset.assignPlayer===playerId),teamId=select?.value;if(!teamId)return toast('Choose a table first.');try{await req('/assign-player',{method:'POST',body:JSON.stringify({playerId,teamId})});delete pendingTeams[playerId];toast('Team assignment updated.');await refresh(true)}catch(e){toast(e.message)}}
