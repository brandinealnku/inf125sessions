import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
// Exercise the actual CQ handler with in-memory Durable Object storage.
const source=readFileSync(new URL('../src/index-v0104.js',import.meta.url),'utf8').replace("import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';",'const baseHandler={}; class BaseClassroomSession { constructor(state){this.state=state;} }');
const {ClassroomSession}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const data=new Map();const worker=new ClassroomSession({storage:{get:async k=>structuredClone(data.get(k)),put:async(k,v)=>data.set(k,structuredClone(v)),delete:async k=>data.delete(k)}});
async function call(path,body){const res=await worker.fetch(new Request('https://test/cq/'+path,{method:body?'POST':'GET',...(body?{body:JSON.stringify(body),headers:{'content-type':'application/json'}}:{})}));assert.equal(res.status,200,await res.clone().text());return res.json();}
const players={a:{id:'a',name:'Alex',mode:'play',isTest:true,teamId:'one'},b:{id:'b',name:'Blair',mode:'play',isTest:true,teamId:'one'},c:{id:'c',name:'Casey',mode:'play',isTest:true,teamId:'two'},d:{id:'d',name:'Drew',mode:'play',isTest:true,teamId:'two'},watch:{id:'watch',mode:'watch',isTest:true}};
for(const [round,key] of [[0,'0'],[1,'1'],[2,'2'],[3,'final']]){
 const final=key==='final';data.set('cqPlayers',players);data.set('cqState',{stage:final?'final-build':'build',round});data.set('cqTeams',{one:{id:'one',members:['a','b'],rounds:{}},two:{id:'two',members:['c','d'],rounds:{}}});
 await call('player-action',{playerId:'a',action:'proposeBuild',text:'MANUAL '+key});
 // Include an old simulator duplicate and a vote pointing to it.
 let teams=data.get('cqTeams');teams.one.rounds[key].buildProposals['sim-build-a']={id:'sim-build-a',playerId:'a',name:'Alex',text:'OLD',at:1};teams.one.rounds[key].buildVotes={b:'sim-build-a'};
 await call('simulate-test-stage',{});await call('simulate-test-stage',{});
 teams=data.get('cqTeams');const r=teams.one.rounds[key];assert.equal(Object.keys(r.buildProposals).length,2);assert.equal(r.build,'MANUAL '+key);assert.equal(r.buildVotes.b,'a-build');assert.equal(r.buildWinner,'a-build');assert.equal(teams.two.rounds[key].build.includes('MANUAL'),false);
 const expected=['vampire','internet-access','87%','drop a course'][round];assert.ok(teams.two.rounds[key].build.includes(expected));
 await call('player-action',{playerId:'a',action:'proposeBuild',text:'UPDATED '+key});assert.equal(Object.keys(data.get('cqTeams').one.rounds[key].buildProposals).length,2);
 data.set('cqState',{stage:final?'final-twist':'twist',round});await call('simulate-test-stage',{});await call('simulate-test-stage',{});teams=data.get('cqTeams');assert.equal(Object.keys(teams.one.rounds[key].repairProposals).length,2);assert.ok(teams.one.rounds[key].repair);assert.ok(teams.two.rounds[key].repair.includes(['late shifts','shared devices','prohibits','financial-aid'][round]));
}
// Manual-only votes also finalize the selected text; tied votes do not.
data.set('cqState',{stage:'build',round:0});data.set('cqTeams',{one:{id:'one',members:['a','b'],rounds:{}},two:{id:'two',members:['c','d'],rounds:{}}});
for(const id of ['a','b'])await call('player-action',{playerId:id,action:'proposeBuild',text:id+' prompt'});
await call('player-action',{playerId:'a',action:'voteBuild',proposalId:'a-build'});await call('player-action',{playerId:'b',action:'voteBuild',proposalId:'b-build'});assert.equal(data.get('cqTeams').one.rounds['0'].build,undefined);
await call('player-action',{playerId:'b',action:'voteBuild',proposalId:'a-build'});assert.equal(data.get('cqTeams').one.rounds['0'].build,'a prompt');
console.log('PASS: all cases/finale; selected prompts; manual and mixed votes; legacy duplicate migration; repeated simulation; manual resubmission; repairs; team isolation; tie handling.');

// Facilitation controls never change game answers, votes, readiness, or scores.
data.get('cqTeams').one.name='Ghost Hunters';
const before=structuredClone(data.get('cqTeams'));
await call('presentation',{action:'spotlight',teamId:'one',field:'build',proposalId:'a-build',focus:'revise'});
let snapshot=await call('snapshot');assert.equal(snapshot.presentation.spotlight.text,'a prompt');assert.equal(snapshot.presentation.spotlight.teamName,'Ghost Hunters');assert.equal(snapshot.presentation.spotlight.playerId,undefined);assert.equal(snapshot.presentation.spotlight.name,undefined);
assert.deepEqual(data.get('cqTeams'),before);
await call('presentation',{action:'attention',mode:'team'});assert.equal((await call('snapshot')).presentation.attention,'team');
await call('presentation',{action:'clear'});assert.equal((await call('snapshot')).presentation.spotlight,null);
assert.deepEqual(data.get('cqTeams'),before);
// Published text is a stable copy even if its author edits afterward.
await call('presentation',{action:'spotlight',teamId:'one',field:'build',proposalId:'a-build',focus:'strength'});
await call('player-action',{playerId:'a',action:'proposeBuild',text:'a revised prompt'});
assert.equal((await call('snapshot')).presentation.spotlight.text,'a prompt');
for(const body of [{action:'attention',mode:'invalid'},{action:'spotlight',teamId:'absent',field:'build',proposalId:'x'},{action:'spotlight',teamId:'one',field:'repair',proposalId:'a-build'}]){
 const res=await worker.fetch(new Request('https://test/cq/presentation',{method:'POST',body:JSON.stringify(body)}));assert.ok(res.status>=400);
}
// Stage transitions clear stale guidance and examples; reset clears the presentation as well.
await call('control',{stage:'twist',round:0,force:true});assert.equal(data.has('cqPresentation'),false);
await call('presentation',{action:'attention',mode:'up'});await call('reset',{});assert.equal((await call('snapshot')).presentation.attention,'auto');
// Undo a bonus must never subtract an earned case point.
data.set('cqTeams',{one:{id:'one',members:['a','b'],rounds:{},position:1,totalPoints:1,bonus:0}});
let res=await worker.fetch(new Request('https://test/cq/bonus',{method:'POST',body:JSON.stringify({teamId:'one',delta:-1})}));assert.equal(res.status,409);assert.equal(data.get('cqTeams').one.totalPoints,1);
await call('bonus',{teamId:'one',delta:1,label:'FAIRNESS'});assert.equal(data.get('cqTeams').one.totalPoints,2);await call('bonus',{teamId:'one',delta:-1});assert.equal(data.get('cqTeams').one.totalPoints,1);
// Shared display renderer: personal cues, global overrides, spectators and inert text.
const context={window:{}};vm.createContext(context);vm.runInContext(readFileSync(new URL('../public/context-quest-facilitation.js',import.meta.url),'utf8'),context);
const f=context.window.CQ_FACILITATION,p={id:'a',mode:'play'},t={progressPhase:'build',rounds:{'0':{buildProposals:{x:{text:'answer'}}}}};
const ss={state:{stage:'build',round:0},presentation:{attention:'auto'}};
assert.match(f.cue(ss,p,t).title,/VOTE IS NEEDED/);t.rounds['0'].buildVotes={a:'x'};assert.match(f.cue(ss,p,t).title,/LOOK TO YOUR TEAM/);
t.progressPhase='test';assert.match(f.cue(ss,p,t).title,/REVIEW THE AI/);t.rounds['0'].tested={a:1};assert.match(f.cue(ss,p,t).title,/COMPARE RESULTS/);
t.progressPhase='ready-twist';assert.match(f.cue(ss,p,t).title,/TEAM IS READY/);
for(const mode of ['up','team','device']){ss.presentation.attention=mode;assert.equal(f.cue(ss,p,t).kind,mode);}
ss.presentation={attention:'device',spotlight:{teamName:'<img src=x onerror=alert(1)>',text:'<script>bad</script>',field:'repair',focus:'revise'}};
assert.equal(f.cue(ss,p,t).kind,'up');const html=f.spotlight(ss);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));
ss.presentation={attention:'auto'};assert.match(f.cue(ss,{mode:'watch'},null).title,/OBSERVE/);
console.log('PASS: attention overrides, personal cues, safe shared examples, immutable snapshot, clear/advance/reset, invalid selections, bonus/undo protection, escaped rendering.');

// All four pages load the shared presenter before their surface script.
for(const page of ['context-quest','context-quest-instructor','context-quest-board','context-quest-test']){
 const html=readFileSync(new URL('../public/'+page+'.html',import.meta.url),'utf8');assert.ok(html.includes('context-quest-facilitation.js'));assert.ok(html.indexOf('context-quest-facilitation.js')<html.indexOf('/'+page+'.js'));
}
// Instructor renders controls in the main console and sends rehearsal actions to its own session.
const app={innerHTML:''},doc={querySelector:s=>s==='#app'?app:{},activeElement:null};
const gm={window:{CQ_DATA:{stages:{build:'Case Investigation'},rounds:[{key:'Case 1'}],progressLabels:{}}},document:doc,location:{search:'?session=context-quest-sandbox'},URLSearchParams,CQ_FACILITATION:f,console,setTimeout:()=>0};
vm.createContext(gm);
let gmCode=readFileSync(new URL('../public/context-quest-instructor.js',import.meta.url),'utf8').replace('refresh(true);setInterval(refresh,850);','');vm.runInContext(gmCode,gm);
vm.runInContext(`snap={state:{stage:'build',round:0,teamsFormed:true},presentation:{attention:'up'},players:[],teams:[{id:'team-1',name:'Ghost Hunters',members:[],rounds:{'0':{buildProposals:{x:{id:'x',name:'Alex',text:'<img src=x>',playerId:'a'}}}}}]};`,gm);
const toolsHtml=vm.runInContext('teachingTools()',gm);assert.ok(toolsHtml.includes('SHOW WHAT WORKS'));assert.ok(toolsHtml.includes('+1 Fairness'));assert.ok(toolsHtml.includes('aria-pressed="true"'));assert.ok(!toolsHtml.includes('<img src=x>'));
assert.equal(vm.runInContext('API',gm),'/api/session/context-quest-sandbox/cq');assert.ok(vm.runInContext("mast('')",gm).includes('board?session=context-quest-sandbox'));
console.log('PASS: shared script loading, instructor teaching panel, safe selector rendering, isolated Game Master routing.');
