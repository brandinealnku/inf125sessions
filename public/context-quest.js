const VERSION="cq-simplified-2026-10-05";
const ROUNDS=[
  {
    key:"WHO",icon:"👤",title:"WHO is this for?",
    bad:"Explain artificial intelligence.",
    context:[["WHO","A first-year College of Informatics student"]],
    twist:"The student has never used an AI tool before.",
    nudge:"Make the audience specific enough that the answer can meet them where they are."
  },
  {
    key:"GOAL",icon:"🎯",title:"What are they trying to accomplish?",
    bad:"Help me with AI for school.",
    context:[["WHO","A first-year college student"],["GOAL","Decide when AI is useful for schoolwork—and when it is not."]],
    twist:"They have an assignment due tonight and are tempted to let AI do the whole thing.",
    nudge:"Tell the AI what a useful outcome looks like, not just the topic."
  },
  {
    key:"CONSTRAINTS",icon:"🧱",title:"What must the answer respect?",
    bad:"Recommend an AI tool for me.",
    context:[["WHO","A first-year student"],["GOAL","Choose a tool for studying"],["CONSTRAINTS","Free or already available through school; no private course data; explain in 3 bullets."]],
    twist:"The student only has 10 minutes and is using a phone.",
    nudge:"Constraints make an answer usable in the real situation."
  },
  {
    key:"CHECK",icon:"🛡️",title:"What needs verification?",
    bad:"Tell me if this AI answer is correct.",
    context:[["WHO","A first-year student"],["GOAL","Decide whether to rely on an AI-generated answer"],["CONSTRAINTS","Separate facts from assumptions"],["CHECK","Flag uncertain claims and say how important claims should be verified."]],
    twist:"The answer includes a confident statistic but gives no source.",
    nudge:"A polished answer is not the same thing as a supported answer."
  }
];
const FINAL={
  bad:"Build an AI assistant that helps first-year students make course decisions.",
  stakeholders:["STUDENT","ACADEMIC ADVISOR","PROFESSOR","UNIVERSITY","PARENT","ACCESSIBILITY OFFICE"],
  twist:"The AI confidently gives a student incorrect high-stakes information."
};
let S={team:"",screen:"start",tutorialStep:0,tutorialDraft:"",round:0,phase:"build",draft:"",checks:[],stakeholder:"STUDENT",complete:false};
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function save(){localStorage.setItem("inf128-context-quest-v3",JSON.stringify(S))}
function load(){try{const x=JSON.parse(localStorage.getItem("inf128-context-quest-v3"));if(x)S={...S,...x}}catch(_){}}
function toast(t){const e=$("#toast");if(!e)return;e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1600)}
function mast(inner){return `<header class="mast"><div><div class="logo">CONTEXT <span>QUEST</span></div><div class="tiny">INF 128 · AI LITERACY</div></div><div class="pill">MAKE THE PROMPT FIT THE SITUATION</div></header>${inner}<div class="footer">BAD PROMPT → GET CONTEXT → IMPROVE IT → TEST IT → PLOT TWIST → FIX IT</div>`}
function progress(active=S.round){
  const labels=[["✓","TUTORIAL"],["👤","WHO"],["🎯","GOAL"],["🧱","CONSTRAINTS"],["🛡️","CHECK"],["👾","FINAL"]];
  const idx=S.screen==="tutorial"?0:S.screen==="final"?5:Math.min(4,(active||0)+1);
  return `<section class="panel" style="padding:14px 16px"><div class="tiny" style="margin-bottom:9px">YOUR PATH</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:7px">${labels.map((x,i)=>`<div style="border:3px solid var(--ink);border-radius:12px;padding:9px 5px;text-align:center;font-weight:1000;font-size:10px;background:${i<idx?"#d8efd9":i===idx?"var(--yellow)":"white"}"><div style="font-size:20px">${x[0]}</div>${x[1]}</div>`).join("")}</div></section>`;
}
function start(){
  $("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">A 75-MINUTE AI LITERACY GAME</div><h1>CONTEXT<br>QUEST.</h1><p><b>You’re given a bad AI prompt. Make it better. Then something changes, and you have to fix it again.</b></p></section>
  <section class="panel"><div class="label">START HERE</div><div class="bigq">Name your team.</div><input id="team" class="field" maxlength="50" placeholder="e.g. Prompt Goblins" value="${esc(S.team)}"><div class="success" style="margin-top:14px">No rules lecture. The first 60–90 seconds are the tutorial, and playing it teaches you what to do.</div><div class="actions"><button class="btn purple" onclick="begin()">PLAY THE TUTORIAL →</button></div></section>`);
}
function begin(){S={team:$("#team").value.trim()||"Team Context",screen:"tutorial",tutorialStep:0,tutorialDraft:"Tell me about AI.",round:0,phase:"build",draft:"",checks:[],stakeholder:"STUDENT",complete:false};save();tutorial()}
function tutorial(){
  const step=S.tutorialStep||0;
  let body="";
  if(step===0) body=`<div class="label">1 · BAD PROMPT</div><div class="bigq">“Tell me about AI.”</div><p>This is not wrong. It is just missing information.</p><div class="gamecard"><small>GET CONTEXT · WHO</small><b>A first-year college student</b></div><p><b>Your move:</b> rewrite the prompt so the AI knows who the answer is for.</p><textarea id="draft" class="prompt">${esc(S.tutorialDraft)}</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I IMPROVED IT →</button></div>`;
  if(step===1) body=`<div class="label">2 · GET MORE CONTEXT</div><div class="gamecard"><small>GOAL</small><b>Help the student decide when AI is useful for school.</b></div><p>Add the goal. Now the AI knows <b>who</b> it is helping and <b>what success means</b>.</p><textarea id="draft" class="prompt">${esc(S.tutorialDraft)}</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I ADDED THE GOAL →</button></div>`;
  if(step===2) body=`<div class="label">3 · TEST IT</div><div class="bigq">Now actually run your prompt.</div><div class="success"><b>COPY PROMPT → OPEN CHATGPT → PASTE IT → READ THE ANSWER</b></div><textarea id="draft" class="prompt">${esc(S.tutorialDraft)}</textarea><div class="actions"><button class="btn purple" onclick="copyDraft()">COPY PROMPT</button><button class="btn teal" onclick="tutorialNext()">I READ THE ANSWER →</button></div>`;
  if(step===3) body=`<div class="label">4 · PLOT TWIST</div><div class="chaos"><h3>💥 NEW INFORMATION</h3><b>The student has never used AI before.</b></div><p>Does your prompt still fit? <b>Fix it if the new information matters.</b></p><textarea id="draft" class="prompt">${esc(S.tutorialDraft)}</textarea><div class="actions"><button class="btn purple" onclick="tutorialNext()">I FIXED IT →</button></div>`;
  if(step===4) body=`<div class="label">5 · WHAT JUST HAPPENED?</div><div class="bigq">Your words weren’t necessarily bad. Your context was incomplete.</div><p>That is the whole game.</p><div class="rules"><div class="rule"><b>BAD PROMPT</b>Start with something weak or incomplete.</div><div class="rule"><b>GET CONTEXT</b>Learn one thing that changes what “good” means.</div><div class="rule"><b>TEST + FIX</b>Run it, judge the answer, and adapt when the situation changes.</div></div><div class="actions"><button class="btn purple" onclick="finishTutorial()">START ROUND 1 →</button></div>`;
  $("#app").innerHTML=mast(progress()+`<section class="panel"><div class="tiny">PLAYABLE TUTORIAL · ${Math.min(step+1,5)} OF 5</div>${body}</section>`);
}
function tutorialNext(){const d=$("#draft");if(d){S.tutorialDraft=d.value.trim();if(!S.tutorialDraft)return toast("Change the prompt before moving on.");}S.tutorialStep++;save();tutorial()}
function finishTutorial(){S.screen="round";S.round=0;S.phase="build";S.draft="";S.checks=[];save();renderRound()}
function contextCards(r){return `<div class="cards">${r.context.map(([k,v])=>`<div class="gamecard"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>`}
function loopStrip(active){
  const xs=["BAD PROMPT","GET CONTEXT","IMPROVE IT","TEST IT","PLOT TWIST","FIX IT"];
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 16px">${xs.map((x,i)=>`<span class="pill" style="background:${x===active?"var(--yellow)":"white"}">${i+1}. ${x}</span>`).join("")}</div>`;
}
function renderRound(){
  const r=ROUNDS[S.round]; if(!r){S.screen="final";save();return renderFinal()}
  let body="";
  if(S.phase==="build") body=`${loopStrip("IMPROVE IT")}<div class="label">1 · BAD PROMPT</div><div class="bigq">“${esc(r.bad)}”</div><div class="label">2 · GET CONTEXT</div>${contextCards(r)}<div class="label" style="margin-top:18px">3 · IMPROVE IT</div><p>${esc(r.nudge)}</p><textarea id="draft" class="prompt" placeholder="Rewrite the prompt using the context above...">${esc(S.draft||r.bad)}</textarea><div class="actions"><button class="btn purple" onclick="toTest()">I IMPROVED THE PROMPT →</button></div>`;
  if(S.phase==="test") body=`${loopStrip("TEST IT")}<div class="label">4 · TEST IT</div><div class="bigq">Run the prompt you just built.</div><div class="success"><b>COPY PROMPT → OPEN CHATGPT → PASTE IT → READ THE ANSWER</b></div><textarea id="draft" class="prompt">${esc(S.draft)}</textarea><div class="actions"><button class="btn purple" onclick="copyDraft()">COPY PROMPT</button><button class="btn teal" onclick="toTwist()">I READ THE ANSWER →</button></div>`;
  if(S.phase==="twist") body=`${loopStrip("PLOT TWIST")}<div class="label">5 · PLOT TWIST</div><div class="chaos"><h3>💥 NEW INFORMATION</h3><b>${esc(r.twist)}</b></div><p><b>Does your prompt still work?</b> Repair it so the prompt fits the situation now.</p><textarea id="draft" class="prompt">${esc(S.draft)}</textarea><div class="actions"><button class="btn purple" onclick="toCheck()">I FIXED IT →</button></div>`;
  if(S.phase==="check") body=`${loopStrip("FIX IT")}<div class="label">6 · CHECK THE AI RESPONSE</div><div class="bigq">Don’t score the writing. Judge whether the answer works.</div><div class="stage"><div class="judge">
    <label><input type="checkbox" class="check" value="audience"> Did the response fit the audience?</label>
    <label><input type="checkbox" class="check" value="goal"> Did it accomplish the goal?</label>
    <label><input type="checkbox" class="check" value="constraints"> Did it follow the constraints?</label>
    <label><input type="checkbox" class="check" value="evidence"> Is anything important unsupported or uncertain?</label>
    </div></div><div class="success"><b>3–4 checks = success.</b> 0–2 checks = repair the prompt and try again.</div><div class="actions"><button class="btn teal" onclick="scoreRound()">CHECK MY RESPONSE →</button></div>`;
  $("#app").innerHTML=mast(progress()+`<section class="panel"><div class="tiny">ROUND ${S.round+1} OF 4 · ${r.icon} ${r.key}</div><div class="bigq">${esc(r.title)}</div>${body}</section>`);
}
function toTest(){const d=$("#draft").value.trim();if(!d||d===ROUNDS[S.round].bad)return toast("Rewrite the bad prompt first.");S.draft=d;S.phase="test";save();renderRound()}
function toTwist(){const d=$("#draft");if(d)S.draft=d.value.trim();S.phase="twist";save();renderRound()}
function toCheck(){const d=$("#draft").value.trim();if(!d)return toast("Repair the prompt first.");S.draft=d;S.phase="check";save();renderRound()}
function scoreRound(){
  const n=[...document.querySelectorAll(".check:checked")].length;
  if(n<3){S.phase="twist";save();toast("0–2 checks: repair the prompt and test again.");return setTimeout(renderRound,700)}
  const learned=ROUNDS[S.round].key; const next=S.round+1;
  $("#app").innerHTML=mast(progress()+`<section class="panel eventCard"><div class="icon">✅</div><div class="label">ROUND COMPLETE</div><h2>${learned} UNLOCKED</h2><p>You used the response itself as evidence. When the answer did not fit, the move was to improve the context—not hunt for magic wording.</p><button class="btn purple" onclick="advanceRound()">${next<4?"NEXT ROUND":"GO TO FINAL CHALLENGE"} →</button></section>`);
}
function advanceRound(){S.round++;S.phase="build";S.draft="";S.checks=[];if(S.round>=4)S.screen="final";save();S.screen==="final"?renderFinal():renderRound()}
function copyDraft(){const d=$("#draft");if(d)S.draft=d.value.trim();save();if(!S.draft)return toast("Build the prompt first.");navigator.clipboard?.writeText(S.draft);toast("Copied. Open ChatGPT, paste it, and read the answer.")}
function renderFinal(){
  S.screen="final"; save();
  const cards=[["WHO","A first-year student"],["WHAT","Course-decision help"],["WHY","Help the student make an informed choice"],["CONTEXT","University policies and the student's situation"],["CONSTRAINTS","Do not invent requirements; protect private data"],["OUTPUT","Clear next steps plus uncertainty"],["CHECK","Verify high-stakes claims or escalate to a human"]];
  $("#app").innerHTML=mast(progress()+`<section class="panel final"><div class="label" style="color:var(--yellow)">👾 FINAL CHALLENGE</div><h2 style="font-size:44px;margin:8px 0">PUT THE WHOLE MODEL TOGETHER.</h2><p>A university wants an AI assistant that helps first-year students make course decisions.</p><div class="turn"><div class="stage"><div class="label">YOUR STAKEHOLDER</div><div class="bigq">${esc(S.stakeholder)}</div><div class="cards">${cards.map(([k,v])=>`<div class="gamecard"><small>${k}</small><b>${v}</b></div>`).join("")}</div><textarea id="draft" class="prompt" style="margin-top:14px" placeholder="Design the prompt / AI interaction using WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK">${esc(S.draft)}</textarea><div class="actions"><button class="btn soft" onclick="swapStakeholder()">CHANGE STAKEHOLDER</button><button class="btn purple" onclick="copyDraft()">COPY + TEST</button></div></div><aside class="stage"><div class="label">FINAL PLOT TWIST</div><div class="chaos"><h3>🚨 CONSEQUENCE</h3><b>${esc(FINAL.twist)}</b></div><p>Repair the interaction. Add verification, boundaries, uncertainty, escalation, or human judgment where needed.</p><div class="judge">
    <label><input type="checkbox" class="bosscheck"> Fits the stakeholder</label>
    <label><input type="checkbox" class="bosscheck"> Accomplishes the goal</label>
    <label><input type="checkbox" class="bosscheck"> Respects constraints / consequences</label>
    <label><input type="checkbox" class="bosscheck"> Important claims are verified or uncertainty is clear</label>
  </div><button class="btn red" style="margin-top:12px" onclick="finishBoss()">CHECK FINAL DESIGN →</button></aside></div></section>`);
}
function swapStakeholder(){const old=S.stakeholder;const i=FINAL.stakeholders.indexOf(old);S.draft=$("#draft")?.value||S.draft;S.stakeholder=FINAL.stakeholders[(i+1)%FINAL.stakeholders.length];save();renderFinal()}
function finishBoss(){S.draft=$("#draft")?.value.trim()||S.draft;if(!S.draft)return toast("Build and repair the final prompt first.");const n=[...document.querySelectorAll(".bosscheck:checked")].length;if(n<3)return toast("0–2 checks: repair the design before finishing.");S.complete=true;S.screen="complete";save();results()}
function results(){
  $("#app").innerHTML=mast(`<section class="panel hero"><div class="tiny">QUEST COMPLETE</div><h1>CONTEXT<br>CHANGES EVERYTHING.</h1><p>You experienced the pattern instead of memorizing a prompt formula.</p></section><section class="panel"><div class="label">THE MODEL YOU JUST USED</div><div class="bigq">WHO → WHAT → WHY → CONTEXT → CONSTRAINTS → OUTPUT → CHECK</div><p><b>The lesson:</b> a “good prompt” is not magic wording. It is an interaction designed for a person, goal, situation, constraints, evidence needs, and consequences.</p><div class="actions"><button class="btn soft" onclick="restart()">PLAY AGAIN</button></div></section>`);
}
function restart(){localStorage.removeItem("inf128-context-quest-v3");S={team:"",screen:"start",tutorialStep:0,tutorialDraft:"",round:0,phase:"build",draft:"",checks:[],stakeholder:"STUDENT",complete:false};start()}
load();
if(S.complete||S.screen==="complete")results();else if(S.screen==="tutorial")tutorial();else if(S.screen==="round")renderRound();else if(S.screen==="final")renderFinal();else start();
