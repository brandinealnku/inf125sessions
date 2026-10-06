window.CQ_DATA={
rounds:[
{
 key:"CONTEXT MATCH",icon:"🎭",title:"Why would anyone ask THAT?",style:"match",
 bad:"Tell me how to survive college like I’m a medieval knight.",
 context:[["MOMENT 1","A ridiculous prompt can make perfect sense once you know the context."]],
 twist:"The student is homesick, overwhelmed, and says playful analogies help them remember advice.",
 nudge:"Match the strange prompt to the context that makes it useful.",
 choices:[
  {label:"🛡️ Context A",text:"A first-year student is anxious about living away from home and learns best through playful analogy.",prompt:"Help a first-year college student adjust to living away from home. Explain the advice as if they are a medieval knight beginning a quest. Keep it reassuring, practical, and easy to remember.",why:"The odd style now serves a real audience and learning need."},
  {label:"📑 Context B",text:"A registrar needs a formal policy summary for an accreditation report.",prompt:"Summarize college survival tips as a medieval knight.",why:"The playful framing conflicts with the user's professional goal."},
  {label:"💼 Context C",text:"A hiring manager needs a legally careful interview guide.",prompt:"Tell a hiring manager how to survive college like a medieval knight.",why:"The audience and goal do not fit the strange framing."}
 ],
 best:0
},
{
 key:"BUILD + TEST",icon:"🧩",title:"Your team has the missing pieces.",style:"secret",
 bad:"Help me choose an AI tool.",
 context:[["MOMENT 2","No one teammate has the whole situation. Talk before you build."]],
 twist:"The student now says they have only 10 minutes, are on a phone, and cannot upload private course material.",
 nudge:"Reveal your secret context card, combine the pieces, and build one usable prompt.",
 secrets:[
  ["WHO","A first-year student"],
  ["GOAL","Choose an AI tool for studying"],
  ["CONSTRAINT","It must be free or already provided by the school"],
  ["PRIVACY","The student cannot upload private course materials"],
  ["OUTPUT","Give only three short bullets"]
 ],
 builders:{
  audience:["a first-year student","a graduate student","a professor"],
  goal:["choose an AI tool for studying","write an entire assignment","find the most popular AI app"],
  constraint:["that is free or already provided by the school and does not require uploading private course material","with no restrictions","that stores all class files"],
  output:["Give three short bullets with one reason for each recommendation.","Write a long essay.","Give only product names."]
 }
},
{
 key:"CHAOS + REPAIR",icon:"💥",title:"The AI sounds confident. Should you trust it?",style:"spot",
 bad:"Can I trust this answer?",
 context:[["AI RESPONSE","“87% of college students who use AI get better grades, so you should use it for every assignment. Your university allows ChatGPT in all classes.”"]],
 twist:"A student acted on the answer—and learned that their professor prohibits AI-generated work on this assignment.",
 nudge:"Hunt for the failures, build a verification prompt, then repair when the consequence appears.",
 issues:[
  {label:"📊 Unsupported statistic",text:"The 87% claim has no source or evidence.",repair:"Identify factual claims that are unsupported or uncertain. For each important claim, explain how I should verify it before relying on it."},
  {label:"🏫 Invented policy",text:"It claims to know university/course policy without an official source.",repair:"Do not assume university or course policy. Flag policy claims that require verification and direct me to the appropriate official source or instructor."},
  {label:"🎯 Overgeneralization",text:"“Use it for every assignment” ignores different goals and course rules.",repair:"Evaluate when AI would and would not be appropriate for this student's schoolwork. Account for assignment goals and course-specific rules."},
  {label:"✅ Confidence ≠ evidence",text:"The answer sounds certain, but certainty is not verification.",repair:"Separate supported facts from assumptions, label uncertainty clearly, and tell me what must be checked before I act."}
 ]
}
],
final:{
 style:"freeform",
 bad:"Build an AI assistant that helps first-year students make course decisions.",
 twist:"The AI confidently gives a student incorrect high-stakes information.",
 cards:[["WHO","A first-year student"],["WHAT","Course-decision help"],["WHY","Help the student make an informed choice"],["CONTEXT","University policies and the student's situation"],["CONSTRAINTS","Do not invent requirements; protect private data"],["OUTPUT","Clear next steps plus uncertainty"],["CHECK","Verify high-stakes claims or escalate to a human"]]
},
moments:["CONTEXT MATCH","BUILD + TEST","CHAOS + REPAIR"],
bonusTypes:[
 {key:"context",label:"🧠 CONTEXT MVP",description:"Best use of audience, goal, or situational context."},
 {key:"recovery",label:"🔧 BEST RECOVERY",description:"Strongest repair after the Plot Twist."},
 {key:"evidence",label:"🔍 EVIDENCE DETECTIVE",description:"Best verification or uncertainty judgment."}
],
stages:{lobby:"Lobby",tutorial:"Tutorial",build:"Game Moment",test:"Test It",twist:"Plot Twist",check:"Judge It",reveal:"Score + Move", "final-build":"Final Boss","final-test":"Final Test","final-twist":"Final Plot Twist","final-check":"Final Judgment","final-reveal":"Final Move","complete":"Complete"}
};