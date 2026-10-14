import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Exercise the actual CQ handler with in-memory Durable Object storage.
const source=readFileSync(new URL('../src/index-v0104.js',import.meta.url),'utf8').replace("import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';",'const baseHandler={}; class BaseClassroomSession { constructor(state){this.state=state;} }');
const {ClassroomSession}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const data=new Map();const worker=new ClassroomSession({storage:{get:async k=>structuredClone(data.get(k)),put:async(k,v)=>data.set(k,structuredClone(v))}});
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
