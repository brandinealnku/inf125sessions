window.CQ_DATA={
rounds:[
{
 key:"WHO",icon:"👤",title:"WHO is this for?",style:"cards",
 bad:"Explain artificial intelligence.",
 context:[["WHO","The audience changes what a useful answer sounds like."]],
 twist:"The student has never used an AI tool before.",
 nudge:"Choose an audience card. Context Quest will build the first version for you.",
 choices:[
  {label:"🎓 First-year student",value:"a first-year College of Informatics student",prompt:"Explain artificial intelligence to a first-year College of Informatics student using plain language and one concrete example."},
  {label:"👩‍🏫 Professor",value:"a college professor",prompt:"Explain artificial intelligence to a college professor, focusing on practical teaching uses and limitations."},
  {label:"👪 Parent",value:"a parent of a college student",prompt:"Explain artificial intelligence to a parent of a college student, focusing on what it can and cannot safely do for schoolwork."},
  {label:"💼 Employer",value:"a hiring manager",prompt:"Explain artificial intelligence to a hiring manager, focusing on how an entry-level employee might use it responsibly at work."}
 ]
},
{
 key:"GOAL",icon:"🎯",title:"Which prompt actually has a goal?",style:"pickbest",
 bad:"Help me with AI for school.",
 context:[["WHO","A first-year college student"],["GOAL","Decide when AI is useful for schoolwork—and when it is not."]],
 twist:"They have an assignment due tonight and are tempted to let AI do the whole thing.",
 nudge:"Choose the prompt that gives the AI the clearest job to do.",
 choices:[
  {label:"A",text:"Tell me about AI for college.",why:"Topic only. The AI still does not know what the student needs to decide."},
  {label:"B",text:"Help a first-year college student decide when AI is useful for schoolwork and when they should do the work themselves. Give three examples of each.",why:"Strong: audience + decision goal + useful output."},
  {label:"C",text:"Give me the best AI tools for students.",why:"It asks for recommendations, but not the actual decision this student needs to make."}
 ],
 best:1
},
{
 key:"CONSTRAINTS",icon:"🧩",title:"Can your team assemble the missing context?",style:"secret",
 bad:"Recommend an AI tool for studying.",
 context:[["MISSION","Your team has pieces of the situation. No one person sees everything."]],
 twist:"The student only has 10 minutes and is using a phone.",
 nudge:"Tell your teammates your secret card. Then assemble a prompt that respects the whole situation.",
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
 key:"CHECK",icon:"🕵️",title:"Spot what is wrong with the AI answer.",style:"spot",
 bad:"Can I trust this answer?",
 context:[["AI RESPONSE","“87% of college students who use AI get better grades, so you should use it for every assignment. Your university allows ChatGPT in all classes.”"]],
 twist:"The answer includes a confident statistic but gives no source.",
 nudge:"Find the problems before you decide whether the answer is trustworthy.",
 issues:[
  {label:"📊 Unsupported statistic",text:"The 87% claim has no source or evidence.",repair:"Identify any factual claims in this answer that are unsupported or uncertain. For each important claim, explain how I should verify it before relying on it."},
  {label:"🏫 Invented policy",text:"It claims to know the university's policy without citing an official source.",repair:"Do not assume university or course policy. Flag policy claims that require verification and direct me to the appropriate official source or instructor."},
  {label:"🎯 Overgeneralization",text:"“Use it for every assignment” ignores different goals and course rules.",repair:"Evaluate when AI would and would not be appropriate for this student's schoolwork. Account for assignment goals and course-specific rules."},
  {label:"✅ Sounds confident",text:"Confidence is not evidence.",repair:"Separate supported facts from assumptions, label uncertainty clearly, and tell me what must be checked before I act."}
 ]
}
],
final:{
 style:"freeform",
 bad:"Build an AI assistant that helps first-year students make course decisions.",
 twist:"The AI confidently gives a student incorrect high-stakes information.",
 cards:[["WHO","A first-year student"],["WHAT","Course-decision help"],["WHY","Help the student make an informed choice"],["CONTEXT","University policies and the student's situation"],["CONSTRAINTS","Do not invent requirements; protect private data"],["OUTPUT","Clear next steps plus uncertainty"],["CHECK","Verify high-stakes claims or escalate to a human"]]
},
stages:{lobby:"Lobby",tutorial:"Tutorial",build:"Play the Round",test:"Test It",twist:"Plot Twist",check:"Check It",reveal:"Move!", "final-build":"Final Build","final-test":"Final Test","final-twist":"Final Plot Twist","final-check":"Final Check","final-reveal":"Final Move","complete":"Complete"}
};