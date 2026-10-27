import assert from 'node:assert/strict';
const origin=process.env.CLASSROOM_TEST_ORIGIN||'https://classroom.itsbadlabs.com';
const api=origin+'/api/session/context-quest-flow-'+(process.env.GITHUB_RUN_ID||Date.now())+'/cq';
async function req(path,body,expected=200){const response=await fetch(api+path,{method:body?'POST':'GET',headers:{'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const text=await response.text();assert.equal(response.status,expected,path+': '+text);return JSON.parse(text);}
try{
 await req('/reset',{});await req('/form-teams',{assignment:'tables',tableCount:3,teamSize:2});
 for(const id of ['a','b','c'])await req('/join',{playerId:id,name:'Flow '+id,mode:'play'});
 await req('/join',{playerId:'watch',name:'Flow observer',mode:'watch'});
 await req('/choose-team',{playerId:'a',teamId:'team-1'});await req('/choose-team',{playerId:'b',teamId:'team-1'});
 await req('/choose-team',{playerId:'c',teamId:'team-1'},409);await req('/choose-team',{playerId:'watch',teamId:'team-2'},403);
 await req('/control',{stage:'tutorial',round:0},409);
 await req('/assign-player',{playerId:'c',teamId:'team-2'});await req('/control',{stage:'tutorial',round:0});
 await req('/assign-player',{playerId:'a',teamId:'team-2'},409);
 await req('/control',{stage:'build',round:0},409);
 for(const playerId of ['a','b','c'])await req('/player-action',{playerId,action:'tutorialDone'});
 await req('/control',{stage:'build',round:0});
 await req('/player-action',{playerId:'a',action:'proposeBuild',text:'Give clear, relevant context and verify the response.'});
 let snap=await req('/snapshot');assert.equal(snap.teams.find(t=>t.id==='team-1').members.find(m=>m.id==='b').activity,'Needs to vote');
 for(const playerId of ['a','b'])await req('/player-action',{playerId,action:'voteBuild',proposalId:'a-build'});
 snap=await req('/snapshot');assert.equal(snap.teams.find(t=>t.id==='team-1').members.find(m=>m.id==='a').activity,'Needs response review');
 await req('/join',{playerId:'late',name:'Flow late',mode:'play'});await req('/assign-player',{playerId:'late',teamId:'team-2'});
 snap=await req('/snapshot');assert.equal(snap.teams.find(t=>t.id==='team-2').members.find(m=>m.id==='late').activity,'Excused this case');
 await req('/control',{stage:'twist',round:0},409);await req('/control',{stage:'twist',round:0,force:true});await req('/control',{stage:'reveal',round:0,force:true});
 snap=await req('/snapshot');assert.ok(snap.teams.every(t=>!t.totalPoints),'Forced unfinished teams must not earn a point');assert.equal(snap.teams.find(t=>t.id==='team-3').members.length,0);
 console.log('PASS deployed classroom workflow: table joins/full-table rejection, observer exclusion, assignment review, training gate, individual status, late placement, force without fabricated points, empty tables.');
}finally{await req('/reset',{});}
