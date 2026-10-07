window.CQ_DATA={
title:"CONTEXT QUEST: THE HAUNTED PROMPT LAB",
tagline:"Find the missing context. Test the answer. Survive the twist.",
rounds:[
{
 key:"THE MYSTERY PROMPT",icon:"🧛",title:"This prompt sounds ridiculous. Is it?",style:"match",
 bad:"Tell me how to survive college like I’m a vampire.",
 context:[["CASE FILE 01","A strange prompt can be useful when the context explains why it exists."]],
 twist:"The student works late shifts, feels overwhelmed by daytime obligations, and remembers advice better when it is funny and themed.",
 nudge:"Investigate the prompt. Which context clue makes the strange request actually useful?",
 choices:[
  {label:"🦇 Clue A",text:"A first-year student works late shifts, is adjusting to college, and remembers advice better through funny themed analogies.",prompt:"Help a first-year college student who works late shifts adjust to college life. Frame the advice like a vampire survival guide, but keep the recommendations practical, reassuring, and easy to remember.",why:"The Halloween framing now serves the student's actual situation and memory needs."},
  {label:"📜 Clue B",text:"The registrar needs a formal summary of academic policy for an accreditation report.",prompt:"Summarize academic policy like a vampire survival guide.",why:"The theme conflicts with the audience and professional purpose."},
  {label:"💼 Clue C",text:"An employer needs a legally careful interview guide for hiring interns.",prompt:"Write an intern interview guide as if the applicant is a vampire.",why:"The style distracts from the real goal and adds no useful context."}
 ],
 best:0
},
{
 key:"THE MISSING CLUES",icon:"🔮",title:"No one teammate has the whole story.",style:"secret",
 bad:"Help me choose an AI tool.",
 context:[["CASE FILE 02","The prompt is haunted by missing information. Each investigator holds one clue."]],
 twist:"The student now says they have only 10 minutes, are using a phone, and cannot upload private course material.",
 nudge:"Reveal your clue aloud. Combine the team's evidence before anyone builds the prompt.",
 secrets:[
  ["WHO CLUE","A first-year college student"],
  ["GOAL CLUE","Choose an AI tool for studying"],
  ["CONSTRAINT CLUE","It must be free or already provided by the school"],
  ["PRIVACY CLUE","The student cannot upload private course materials"],
  ["OUTPUT CLUE","Give only three short bullets"]
 ],
 builders:{
  audience:["a first-year college student","a graduate student","a professor"],
  goal:["choose an AI tool for studying","write an entire assignment","find the most popular AI app"],
  constraint:["that is free or already provided by the school and does not require uploading private course material","with no restrictions","that stores all class files"],
  output:["Give three short bullets with one reason for each recommendation.","Write a long essay.","Give only product names."]
 }
},
{
 key:"THE HAUNTED ANSWER",icon:"👻",title:"The AI sounds confident. Something is still wrong.",style:"spot",
 bad:"Can I trust this answer?",
 context:[["HAUNTED AI RESPONSE","“87% of college students who use AI get better grades, so you should use it for every assignment. Your university allows ChatGPT in all classes.”"]],
 twist:"The student followed the answer—and discovered their professor prohibits AI-generated work on this assignment.",
 nudge:"Ghost-hunt the failures. Mark what does not deserve trust, then build a verification response.",
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
 name:"THE CURSE OF THE CONFIDENT AI",
 bad:"Build an AI assistant that helps first-year students make course decisions.",
 twist:"The assistant confidently gives a first-year student incorrect high-stakes course information—and the student is about to act on it.",
 cards:[
  ["WHO","A first-year college student"],
  ["WHAT","Course-decision help"],
  ["WHY","Help the student make an informed choice"],
  ["CONTEXT","University policies + the student's actual situation"],
  ["CONSTRAINTS","Do not invent requirements; protect private data"],
  ["OUTPUT","Clear next steps + visible uncertainty"],
  ["CHECK","Verify high-stakes claims or escalate to a human"]
 ]
},
moments:["THE MYSTERY PROMPT","THE MISSING CLUES","THE HAUNTED ANSWER"],
bonusTypes:[
 {key:"context",label:"🔮 CONTEXT CLAIRVOYANT",description:"Best use of audience, goal, or situational context."},
 {key:"recovery",label:"🧟 CURSE BREAKER",description:"Strongest adaptation after the Plot Twist."},
 {key:"evidence",label:"👻 GHOST HUNTER",description:"Best verification or uncertainty judgment."}
],
framework:["WHO","WHAT","WHY","CONTEXT","CONSTRAINTS","OUTPUT","CHECK"],
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