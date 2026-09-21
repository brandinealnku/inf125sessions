window.SessionVisuals=window.SessionVisuals||{};
const svg=(body)=>`<svg viewBox="0 0 1200 675" role="img" aria-label="Classroom visual" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const bg=`<rect width="1200" height="675" rx="34" fill="#0b0b0a"/>`;
const gold="#d8aa3d", ink="#f7f2e8", muted="#9f998d", panel="#171612", coral="#e66d5a", blue="#75a7ff", green="#68c08a", purple="#a78bfa";

window.SessionVisuals['inf125-week05-session1-multimodal-communication']={
0:{type:'svg',kicker:'COLD OPEN',svg:svg(bg+
`<text x="70" y="72" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">SAME IDEA · DIFFERENT REALITY</text>
<text x="70" y="130" fill="${ink}" font-size="44" font-family="Georgia">“Stop procrastinating and start the assignment.”</text>
<g transform="translate(70,180)">
  <rect width="245" height="390" rx="28" fill="${panel}" stroke="#37342e"/>
  <circle cx="122" cy="33" r="5" fill="#5f5a51"/>
  <rect x="24" y="72" width="197" height="90" rx="18" fill="#25324a"/>
  <text x="42" y="104" fill="#9ec2ff" font-size="18" font-family="Arial" font-weight="700">TEXT</text>
  <text x="42" y="136" fill="${ink}" font-size="19" font-family="Arial">future you is begging</text>
  <text x="42" y="160" fill="${ink}" font-size="19" font-family="Arial">current you to start 😭</text>
  <text x="30" y="350" fill="${muted}" font-size="18" font-family="Arial">fast · clear · easy to ignore</text>
</g>
<g transform="translate(335,180)">
  <rect width="245" height="390" rx="28" fill="${panel}" stroke="#37342e"/>
  <rect x="30" y="68" width="185" height="118" rx="12" fill="#111820"/>
  <rect x="49" y="92" width="147" height="74" rx="8" fill="#202d3b"/>
  <rect x="70" y="145" width="105" height="7" rx="4" fill="#38495e"/>
  <rect x="70" y="145" width="12" height="7" rx="4" fill="${coral}"/>
  <text x="40" y="225" fill="${ink}" font-size="42" font-family="Georgia">11:58 PM</text>
  <text x="40" y="260" fill="${coral}" font-size="18" font-family="Arial" font-weight="800">UPLOAD: 3%</text>
  <text x="30" y="350" fill="${muted}" font-size="18" font-family="Arial">visual · emotional · panic</text>
</g>
<g transform="translate(600,180)">
  <rect width="245" height="390" rx="28" fill="${panel}" stroke="#37342e"/>
  <circle cx="122" cy="115" r="60" fill="#251f16" stroke="${gold}" stroke-width="3"/>
  <rect x="110" y="74" width="24" height="65" rx="12" fill="${gold}"/>
  <path d="M90 128 Q122 160 154 128" fill="none" stroke="${gold}" stroke-width="7" stroke-linecap="round"/>
  <text x="45" y="225" fill="${ink}" font-size="27" font-family="Georgia">“YOU HAVE</text>
  <text x="45" y="260" fill="${ink}" font-size="27" font-family="Georgia">TWO MINUTES.”</text>
  <text x="30" y="350" fill="${muted}" font-size="18" font-family="Arial">personal · dramatic · unskimmable</text>
</g>
<g transform="translate(865,180)">
  <rect width="245" height="390" rx="28" fill="${panel}" stroke="#37342e"/>
  <rect x="28" y="64" width="189" height="150" rx="18" fill="#1a1520"/>
  <polygon points="108,105 108,172 168,138" fill="${purple}"/>
  <text x="37" y="252" fill="${ink}" font-size="25" font-family="Georgia">POV:</text>
  <text x="37" y="286" fill="${ink}" font-size="23" font-family="Arial">you remembered</text>
  <text x="37" y="316" fill="${ink}" font-size="23" font-family="Arial">at 11:58 😬</text>
  <text x="30" y="350" fill="${muted}" font-size="18" font-family="Arial">funny · sticky · high effort</text>
</g>`)},

1:{type:'svg',kicker:'QUICK VOTE',svg:svg(bg+
`<text x="70" y="90" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">PICK YOUR WINNER</text>
<text x="70" y="155" fill="${ink}" font-size="62" font-family="Georgia">Which would actually work on you?</text>
<g transform="translate(85,235)"><circle cx="105" cy="105" r="92" fill="#18263b"/><text x="66" y="125" fill="${blue}" font-size="70" font-family="Arial">T</text><text x="62" y="235" fill="${ink}" font-size="24" font-family="Arial">TEXT</text></g>
<g transform="translate(350,235)"><circle cx="105" cy="105" r="92" fill="#2b2015"/><rect x="58" y="63" width="94" height="84" rx="12" fill="${gold}"/><circle cx="82" cy="88" r="11" fill="#2b2015"/><path d="M66 132 L92 105 L115 126 L140 92 L150 147 L58 147 Z" fill="#2b2015"/><text x="58" y="235" fill="${ink}" font-size="24" font-family="Arial">IMAGE</text></g>
<g transform="translate(615,235)"><circle cx="105" cy="105" r="92" fill="#173225"/><rect x="93" y="55" width="24" height="80" rx="12" fill="${green}"/><path d="M72 126 Q105 160 138 126" fill="none" stroke="${green}" stroke-width="8"/><text x="56" y="235" fill="${ink}" font-size="24" font-family="Arial">AUDIO</text></g>
<g transform="translate(880,235)"><circle cx="105" cy="105" r="92" fill="#2a1934"/><polygon points="88,72 88,138 145,105" fill="${purple}"/><text x="47" y="235" fill="${ink}" font-size="24" font-family="Arial">VIDEO</text></g>`)},

2:{type:'svg',kicker:'DEBRIEF',svg:svg(bg+
`<text x="70" y="90" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">SAME IDEA · DIFFERENT REACTION</text>
<text x="70" y="150" fill="${ink}" font-size="56" font-family="Georgia">What changed?</text>
<g transform="translate(90,220)">
${[
['👀','ATTENTION',blue],['😂','EMOTION',coral],['🧠','CLARITY',purple],
['♿','ACCESSIBILITY',green],['🤝','TRUST',gold],['⚡','EFFORT','#f59e0b']
].map((d,i)=>`<g transform="translate(${(i%3)*350},${Math.floor(i/3)*170})"><rect width="300" height="130" rx="24" fill="${panel}" stroke="#38342f"/><text x="28" y="62" font-size="44">${d[0]}</text><text x="92" y="58" fill="${d[2]}" font-size="23" font-family="Arial" font-weight="800">${d[1]}</text><text x="92" y="90" fill="${muted}" font-size="17" font-family="Arial">Did the format change this?</text></g>`).join('')}
</g>`)},

3:{type:'svg',kicker:'CORE MODEL',svg:svg(bg+
`<text x="70" y="90" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">THE MODEL WE KEEP COMING BACK TO</text>
<g transform="translate(70,210)">
${[['INPUT / DATA','photo · text · audio',blue],['MODEL / TOOL','processes it',purple],['OUTPUT','text · image · audio · video',gold],['HUMAN DECISION','verify · edit · act',green]].map((d,i)=>`<g transform="translate(${i*280},0)"><rect width="245" height="205" rx="28" fill="${panel}" stroke="#38342f"/><circle cx="42" cy="42" r="18" fill="${d[2]}"/><text x="28" y="100" fill="${ink}" font-size="27" font-family="Georgia">${d[0]}</text><text x="28" y="140" fill="${muted}" font-size="18" font-family="Arial">${d[1]}</text></g>${i<3?`<text x="${247+i*280+8}" y="115" fill="${gold}" font-size="36">→</text>`:''}`).join('')}
</g>
<text x="70" y="520" fill="${ink}" font-size="38" font-family="Georgia">The modality can change.</text>
<text x="70" y="565" fill="${gold}" font-size="38" font-family="Georgia">The human decision does not disappear.</text>`)},

4:{type:'svg',kicker:'ONE IDEA · FOUR REMIXES',svg:svg(bg+
`<text x="70" y="86" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">EXPLAIN PHISHING TO A FIRST-YEAR STUDENT</text>
<g transform="translate(70,155)">
<rect width="250" height="400" rx="28" fill="${panel}" stroke="#38342f"/><text x="28" y="55" fill="${blue}" font-size="20" font-family="Arial" font-weight="800">TEXT</text><text x="28" y="105" fill="${ink}" font-size="29" font-family="Georgia">“A message</text><text x="28" y="142" fill="${ink}" font-size="29" font-family="Georgia">designed to make</text><text x="28" y="179" fill="${ink}" font-size="29" font-family="Georgia">you act before</text><text x="28" y="216" fill="${ink}" font-size="29" font-family="Georgia">you think.”</text>
</g>
<g transform="translate(350,155)"><rect width="250" height="400" rx="28" fill="${panel}" stroke="#38342f"/><text x="28" y="55" fill="${gold}" font-size="20" font-family="Arial" font-weight="800">IMAGE</text><rect x="28" y="88" width="194" height="150" rx="14" fill="#1d242d"/><rect x="48" y="108" width="154" height="24" rx="6" fill="#f4f0e7"/><text x="54" y="126" fill="#222" font-size="11" font-family="Arial">URGENT: PASSWORD RESET</text><rect x="48" y="148" width="120" height="16" rx="4" fill="#6b7280"/><rect x="48" y="177" width="95" height="34" rx="7" fill="${coral}"/><text x="61" y="199" fill="#fff" font-size="13" font-family="Arial">VERIFY NOW</text><text x="28" y="285" fill="${coral}" font-size="18" font-family="Arial">⚠ logo + urgency + fake link</text></g>
<g transform="translate(630,155)"><rect width="250" height="400" rx="28" fill="${panel}" stroke="#38342f"/><text x="28" y="55" fill="${green}" font-size="20" font-family="Arial" font-weight="800">AUDIO</text><path d="M35 176 Q55 120 75 176 T115 176 T155 176 T195 176" fill="none" stroke="${green}" stroke-width="7"/><text x="28" y="255" fill="${ink}" font-size="25" font-family="Georgia">“Your account</text><text x="28" y="288" fill="${ink}" font-size="25" font-family="Georgia">will be locked…”</text><text x="28" y="330" fill="${muted}" font-size="18" font-family="Arial">pause + spot the clue</text></g>
<g transform="translate(910,155)"><rect width="220" height="400" rx="28" fill="${panel}" stroke="#38342f"/><text x="24" y="55" fill="${purple}" font-size="20" font-family="Arial" font-weight="800">VIDEO</text><rect x="24" y="88" width="172" height="185" rx="18" fill="#1b1621"/><polygon points="86,145 86,218 150,181" fill="${purple}"/><text x="24" y="318" fill="${ink}" font-size="24" font-family="Georgia">POV:</text><text x="24" y="350" fill="${ink}" font-size="20" font-family="Arial">you clicked it.</text></g>
</g>`)},

5:{type:'svg',kicker:'TRADEOFFS',svg:svg(bg+
`<text x="70" y="95" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">EVERY MODALITY GIVES YOU SOMETHING — AND TAKES SOMETHING AWAY</text>
<g transform="translate(70,165)">
${[
['TEXT','precise · searchable','dense · easy to ignore',blue],
['IMAGE','fast · memorable','can oversimplify',gold],
['AUDIO','human · conversational','hard to skim',green],
['VIDEO','immersive · demonstrates','high effort · easy to fake',purple]
].map((d,i)=>`<g transform="translate(${i*275},0)"><rect width="245" height="355" rx="28" fill="${panel}" stroke="#38342f"/><circle cx="45" cy="50" r="20" fill="${d[3]}"/><text x="28" y="108" fill="${ink}" font-size="34" font-family="Georgia">${d[0]}</text><text x="28" y="175" fill="${green}" font-size="18" font-family="Arial" font-weight="800">GIVES</text><text x="28" y="205" fill="${ink}" font-size="18" font-family="Arial">${d[1]}</text><text x="28" y="270" fill="${coral}" font-size="18" font-family="Arial" font-weight="800">TAKES</text><text x="28" y="300" fill="${ink}" font-size="18" font-family="Arial">${d[2]}</text></g>`).join('')}
</g>`)},

6:{type:'svg',kicker:'LIVE REMIX',svg:svg(bg+
`<text x="70" y="90" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">KEEP THE IDEA CONSTANT · CHANGE THE MODALITY</text>
<rect x="70" y="145" width="1060" height="115" rx="24" fill="${panel}" stroke="#38342f"/>
<text x="105" y="188" fill="${muted}" font-size="19" font-family="Arial">PROMPT</text>
<text x="105" y="226" fill="${ink}" font-size="30" font-family="Georgia">Explain why multifactor authentication matters to someone tired of cybersecurity.</text>
<g transform="translate(90,330)">
${[['1','What improved?',blue],['2','What got worse?',coral],['3','What would you verify?',gold],['4','What still needs a human?',green]].map((d,i)=>`<g transform="translate(${i*270},0)"><circle cx="42" cy="42" r="40" fill="${d[2]}"/><text x="29" y="54" fill="#0b0b0a" font-size="32" font-family="Arial" font-weight="900">${d[0]}</text><text x="0" y="120" fill="${ink}" font-size="21" font-family="Arial">${d[1]}</text></g>`).join('')}
</g>`)},

7:{type:'svg',kicker:'AUDIENCE FIRST',svg:svg(bg+
`<text x="70" y="88" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">WHO ARE YOU DESIGNING FOR?</text>
<text x="70" y="140" fill="${ink}" font-size="48" font-family="Georgia">“Everyone” is not an audience.</text>
<g transform="translate(80,205)">
${[
['🎓','FIRST-YEAR','clarity + relevance',blue],['💼','EXECUTIVE','speed + decision value',gold],['🛍️','CUSTOMER','plain language',green],
['📱','SCROLLER','reason to stop',purple],['🧒','YOUNGER LEARNER','concrete examples',coral],['🧪','DOMAIN EXPERT','precision + evidence','#7dd3fc']
].map((d,i)=>`<g transform="translate(${(i%3)*365},${Math.floor(i/3)*180})"><rect width="320" height="145" rx="25" fill="${panel}" stroke="#38342f"/><text x="24" y="57" font-size="38">${d[0]}</text><text x="82" y="52" fill="${d[3]}" font-size="20" font-family="Arial" font-weight="900">${d[1]}</text><text x="82" y="84" fill="${ink}" font-size="18" font-family="Arial">${d[2]}</text></g>`).join('')}
</g>`)},

8:{type:'svg',kicker:'AI REMIX CHALLENGE',svg:svg(bg+
`<text x="70" y="85" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">YOUR TURN</text>
<text x="70" y="220" fill="${ink}" font-size="170" font-family="Georgia">15</text>
<text x="300" y="220" fill="${gold}" font-size="72" font-family="Arial" font-weight="900">MIN</text>
<g transform="translate(70,310)">
<rect width="255" height="150" rx="26" fill="#18263b"/><text x="28" y="58" fill="${blue}" font-size="19" font-family="Arial" font-weight="800">1 · ONE IDEA</text><text x="28" y="102" fill="${ink}" font-size="27" font-family="Georgia">Keep it constant.</text>
<rect x="280" width="255" height="150" rx="26" fill="#2b2015"/><text x="308" y="58" fill="${gold}" font-size="19" font-family="Arial" font-weight="800">2 · TWO MODALITIES</text><text x="308" y="102" fill="${ink}" font-size="27" font-family="Georgia">Make them different.</text>
<rect x="560" width="255" height="150" rx="26" fill="#173225"/><text x="588" y="58" fill="${green}" font-size="19" font-family="Arial" font-weight="800">3 · ONE AUDIENCE</text><text x="588" y="102" fill="${ink}" font-size="27" font-family="Georgia">Design for them.</text>
<rect x="840" width="255" height="150" rx="26" fill="#2a1934"/><text x="868" y="58" fill="${purple}" font-size="19" font-family="Arial" font-weight="800">4 · SAVE IT</text><text x="868" y="102" fill="${ink}" font-size="27" font-family="Georgia">Artifact + revision.</text>
</g>
<text x="70" y="560" fill="${coral}" font-size="22" font-family="Arial" font-weight="800">STOP PERFECTING. MAKE THE COMPARISON USEFUL.</text>`)},

9:{type:'svg',kicker:'MULTIMODAL SHOWDOWN',svg:svg(bg+
`<text x="70" y="92" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">NOT “BEST ART.” · BEST REASONING.</text>
<g transform="translate(100,185)">
<g><circle cx="120" cy="110" r="90" fill="#2b2015"/><text x="75" y="137" font-size="78">🏆</text><text x="40" y="245" fill="${ink}" font-size="24" font-family="Georgia">MOST USEFUL</text></g>
<g transform="translate(285,0)"><circle cx="120" cy="110" r="90" fill="#18263b"/><text x="75" y="137" font-size="78">🎯</text><text x="18" y="245" fill="${ink}" font-size="24" font-family="Georgia">BEST AUDIENCE FIT</text></g>
<g transform="translate(570,0)"><circle cx="120" cy="110" r="90" fill="#341d1a"/><text x="75" y="137" font-size="78">😬</text><text x="-10" y="245" fill="${ink}" font-size="22" font-family="Georgia">MOST POLISHED / WRONG</text></g>
<g transform="translate(855,0)"><circle cx="120" cy="110" r="90" fill="#173225"/><text x="75" y="137" font-size="78">🛟</text><text x="20" y="245" fill="${ink}" font-size="24" font-family="Georgia">BEST HUMAN SAVE</text></g>
</g>`)},

10:{type:'svg',kicker:'POLISHED ≠ ACCURATE',svg:svg(bg+
`<text x="70" y="88" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">LOOKS LEGIT ≠ IS LEGIT</text>
<g transform="translate(80,155)">
<rect width="500" height="390" rx="30" fill="#f4efe3"/>
<rect x="34" y="32" width="432" height="70" rx="14" fill="#111827"/>
<text x="56" y="75" fill="#fff" font-size="25" font-family="Arial" font-weight="800">NKU STUDENT SUCCESS</text>
<text x="42" y="160" fill="#1f2937" font-size="38" font-family="Georgia">FREE TUTORING</text>
<text x="42" y="210" fill="#1f2937" font-size="25" font-family="Arial">Room 999 · Unicorn Hall</text>
<text x="42" y="260" fill="#1f2937" font-size="23" font-family="Arial">“87% of students improve instantly.”</text>
<rect x="42" y="302" width="210" height="52" rx="12" fill="#2563eb"/><text x="70" y="336" fill="#fff" font-size="18" font-family="Arial" font-weight="800">RESERVE A SPOT</text>
<circle cx="445" cy="330" r="35" fill="${green}"/><text x="428" y="343" fill="#0b0b0a" font-size="32">✓</text>
</g>
<g transform="translate(650,170)">
<text x="0" y="55" fill="${coral}" font-size="34" font-family="Arial" font-weight="900">STILL WRONG 🚨</text>
${['FAKE LOCATION','MADE-UP STAT','NO SOURCE','POLISHED DESIGN ≠ PROOF'].map((x,i)=>`<g transform="translate(0,${95+i*72})"><circle cx="18" cy="18" r="17" fill="${coral}"/><text x="10" y="25" fill="#0b0b0a" font-size="18" font-family="Arial" font-weight="900">!</text><text x="52" y="26" fill="${ink}" font-size="22" font-family="Arial">${x}</text></g>`).join('')}
</g>`)},

11:{type:'svg',kicker:'EXIT PULSE',svg:svg(bg+
`<text x="70" y="92" fill="${gold}" font-size="22" font-family="Arial" font-weight="800" letter-spacing="4">BEFORE YOU LEAVE</text>
<text x="70" y="158" fill="${ink}" font-size="48" font-family="Georgia">What matters more:</text>
<text x="70" y="215" fill="${muted}" font-size="42" font-family="Georgia">the “best” AI tool — or the right modality for the audience?</text>
<g transform="translate(85,310)">
<rect width="320" height="180" rx="28" fill="#18263b"/><text x="28" y="55" fill="${blue}" font-size="19" font-family="Arial" font-weight="900">ONE SURPRISE</text><text x="28" y="100" fill="${ink}" font-size="26" font-family="Georgia">What worked better</text><text x="28" y="134" fill="${ink}" font-size="26" font-family="Georgia">than expected?</text>
<rect x="360" width="320" height="180" rx="28" fill="#341d1a"/><text x="388" y="55" fill="${coral}" font-size="19" font-family="Arial" font-weight="900">ONE LIMITATION</text><text x="388" y="100" fill="${ink}" font-size="26" font-family="Georgia">What did AI get wrong</text><text x="388" y="134" fill="${ink}" font-size="26" font-family="Georgia">or flatten?</text>
<rect x="720" width="320" height="180" rx="28" fill="#173225"/><text x="748" y="55" fill="${green}" font-size="19" font-family="Arial" font-weight="900">ONE HUMAN MOVE</text><text x="748" y="100" fill="${ink}" font-size="26" font-family="Georgia">What did you decide,</text><text x="748" y="134" fill="${ink}" font-size="26" font-family="Georgia">edit, or verify?</text>
</g>`)}
};