window.CQ_DATA={
title:"CONTEXT QUEST: THE HAUNTED AI LAB",
tagline:"Investigate AI. Spot its blind spots. Keep humans in control.",
rounds:[
{
 key:"THE MISSING CONTEXT",icon:"🧛",title:"This prompt sounds ridiculous. Is it?",style:"match",
 bad:"Tell me how to survive college like I’m a vampire.",
 context:[["CASE FILE 01","A strange prompt can be useful when the context explains why it exists."]],
 twist:"The student works late shifts, feels overwhelmed by daytime obligations, and remembers advice better when it is funny and themed.",
 nudge:"Investigate the prompt. Which context clue makes the strange request actually useful?",
 sampleResponse:"A vampire survival guide for college could include: protect your sleep schedule, carry easy snacks for late shifts, find one reliable study routine, and ask for help before you feel overwhelmed. The playful framing can make practical advice easier to remember.",
 choices:[
  {label:"🦇 Clue A",text:"A first-year student works late shifts, is adjusting to college, and remembers advice better through funny themed analogies.",prompt:"Help a first-year college student who works late shifts adjust to college life. Frame the advice like a vampire survival guide, but keep the recommendations practical, reassuring, and easy to remember.",why:"The Halloween framing now serves the student's actual situation and memory needs."},
  {label:"📜 Clue B",text:"The registrar needs a formal summary of academic policy for an accreditation report.",prompt:"Summarize academic policy like a vampire survival guide.",why:"The theme conflicts with the audience and professional purpose."},
  {label:"💼 Clue C",text:"An employer needs a legally careful interview guide for hiring interns.",prompt:"Write an intern interview guide as if the applicant is a vampire.",why:"The style distracts from the real goal and adds no useful context."}
 ],
 best:0
},
{
 key:"THE BIASED CRYSTAL BALL",icon:"🔮",title:"A clever recommendation can miss the whole picture.",style:"secret",
 bad:"Use AI to choose which students should receive extra academic support.",
 context:[["CASE FILE 02","A school's fictional AI system flags students for academic support. Each investigator holds evidence the others lack."]],
 twist:"NEW EVIDENCE: The model used prior online login activity as a strong risk signal. Some students share devices or lack reliable internet. The team must reconsider whether that proxy is fair.",
 nudge:"Each investigator has a different clue. Share them before proposing an accountable decision-support prompt. No real student data.",
 sampleResponse:"This hypothetical model should not decide which students receive support by itself. Review the quality and representativeness of the data, especially whether online activity unfairly flags students with limited access. Include staff review, student context, an explanation of the alert, and a way to correct errors. Test outcomes across relevant groups before deployment.",
 secrets:[
  ["GOAL CLUE","The aim is offering supportive outreach, not punishing students"],
  ["DATA CLUE","The model uses assignment activity and frequency of online logins"],
  ["MISSING PERSPECTIVE","Some students have limited internet access or share devices"],
  ["FAIRNESS CLUE","Low logins may reflect access barriers, not lack of effort"],
  ["OVERSIGHT CLUE","A human advisor must confirm the recommendation and allow correction"]
 ],
 builders:{
  audience:["a student-support advisor reviewing a fictional AI alert","an AI system that makes final enrollment decisions","a marketer selecting the most popular study app"],
  goal:["evaluate whether an academic-support alert is fair and useful","automatically penalize students with few logins","maximize a risk score without reviewing it"],
  constraint:["using only fictional examples, noting missing data and access barriers, and requiring human review","assuming that every low login count means disengagement","with no explanation or appeal"],
  output:["Give a short recommendation, two possible biases, and a human verification step.","Give a risk label without explaining it.","Provide only an unexplained yes or no."]
 }

},
{
 key:"THE CONFIDENTLY WRONG GHOST",icon:"👻",title:"The AI sounds confident. Something is still wrong.",style:"spot",
 bad:"Can I trust this answer?",
 context:[["HAUNTED AI RESPONSE","“87% of college students who use AI get better grades, so you should use it for every assignment. Your university allows ChatGPT in all classes.”"]],
 twist:"The student followed the answer—and discovered their professor prohibits AI-generated work on this assignment.",
 nudge:"Ghost-hunt the failures. Mark what does not deserve trust, then build a verification response.",
 sampleResponse:"I should not claim that AI improves grades or that every course allows ChatGPT without evidence. Course policies vary by instructor and assignment. Before acting, check the syllabus or ask the instructor. Treat unsupported statistics and policy claims as uncertain until verified.",
 issues:[
  {label:"🕸️ Phantom statistic",text:"The 87% claim appears from nowhere and has no source.",repair:"Identify factual claims that are unsupported or uncertain. For each important claim, explain how I should verify it before relying on it."},
  {label:"🏚️ Ghost policy",text:"The AI claims to know university or course policy without an official source.",repair:"Do not assume university or course policy. Flag policy claims that require verification and direct me to the appropriate official source or instructor."},
  {label:"🧟 Zombie generalization",text:"“Use it for every assignment” keeps walking even though different assignments have different rules and goals.",repair:"Evaluate when AI would and would not be appropriate for this student's schoolwork. Account for assignment goals and course-specific rules."},
  {label:"🔮 False certainty",text:"The answer sounds certain, but confidence is not evidence.",repair:"Separate supported facts from assumptions, label uncertainty clearly, and tell me what must be checked before I act."}
 ]
}
],
final:{
 style:"freeform",
 name:"THE HUMAN OVERRIDE",
 bad:"Your team advises a first-year student using AI to decide whether to drop an important class. Should they accept the AI recommendation, revise it, or pause and consult a person? Write a responsible assistant prompt and explain who makes the final decision.",
 twist:"The AI confidently cites an invented prerequisite and ignores financial-aid implications. The student is about to act. STOP, CHECK, and decide when a human advisor must take over.",
 cards:[
  ["WHO","A first-year college student"],
  ["GOAL","Help the student make an informed course decision"],
  ["SITUATION","University policies + the student's actual situation"],
  ["CONSTRAINTS","Do not invent requirements; protect private data"],
  ["OUTPUT","Clear next steps + visible uncertainty"],
  ["CHECK","Verify high-stakes claims or escalate to a human"]
 ],
 sampleResponse:"I can help you think through a course decision, but I should not invent requirements or make the decision for you. Tell me your goal, the specific course choice, any official policy or degree information you already have, and constraints such as schedule or prerequisites. I will separate verified facts from assumptions, show what still needs confirmation, and direct you to an advisor or official source for high-stakes questions."
},
moments:["THE MISSING CONTEXT","THE BIASED CRYSTAL BALL","THE CONFIDENTLY WRONG GHOST"],
bonusTypes:[
 {key:"context",label:"🔮 CONTEXT CLAIRVOYANT",description:"Best use of audience, goal, or situational context."},
 {key:"recovery",label:"🧟 CURSE BREAKER",description:"Strongest adaptation after the Plot Twist."},
 {key:"evidence",label:"👻 GHOST HUNTER",description:"Best verification or uncertainty judgment."}
],
framework:["WHO","GOAL","SITUATION","CONSTRAINTS","OUTPUT","CHECK"],
progressLabels:{
 "ENTER_LAB":"ENTER LAB",
 "INVESTIGATOR_TRAINING":"INVESTIGATOR TRAINING",
 "SUBMIT_ANSWER":"SUBMIT ONE ANSWER",
 "TEAM_VOTE":"TEAM VOTE",
 "TEST_CHAMBER":"TEST CHAMBER",
 "READY_HAUNTING":"READY FOR THE HAUNTING",
 "THE_HAUNTING":"THE HAUNTING",
 "SUBMIT_REPAIR":"SUBMIT ONE REPAIR",
 "REPAIR_VOTE":"TEAM VOTE · REPAIR",
 "EVIDENCE_CHECK":"EVIDENCE CHECK",
 "READY_REVEAL":"READY FOR EVIDENCE REVEAL",
 "EVIDENCE_REVEAL":"EVIDENCE REVEAL",
 "FINAL_BOSS":"FINAL BOSS",
 "READY_FINAL_CURSE":"READY FOR FINAL CURSE",
 "FINAL_CURSE":"FINAL CURSE",
 "CASE_CLOSED":"CASE CLOSED"
},
stages:{lobby:"The Lab Lobby",tutorial:"Investigator Training",build:"Case Investigation",twist:"The Haunting",reveal:"Evidence Reveal","final-build":"Final Boss","final-twist":"Final Curse","final-reveal":"Final Reveal",complete:"Case Closed"}
};