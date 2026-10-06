import baseHandler, { ClassroomSession as BaseClassroomSession } from './index-v0103.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const short=(v,n=500)=>String(v??'').slice(0,n);

export class ClassroomSession extends BaseClassroomSession {
  async fetch(request) {
    const url=new URL(request.url),method=request.method.toUpperCase();
    // Context Quest live classroom game — individual join + virtual teams
    const cqInitial=()=>({stage:'lobby',round:0,resultsVisible:false,teamsFormed:false,testMode:false,updatedAt:Date.now()});
    const cqState=async()=>(await this.state.storage.get('cqState'))||cqInitial();
    const cqTeams=async()=>(await this.state.storage.get('cqTeams'))||{};
    const cqPlayers=async()=>(await this.state.storage.get('cqPlayers'))||{};
    const cqRoundKey=(round,final=false)=>final?'final':String(Math.max(0,Math.min(3,Number(round)||0)));
    const cqRoles=['PROMPT BUILDER','CONTEXT DETECTIVE','SKEPTIC','CHAOS CAPTAIN','JUDGE'];
    const cqTeamNames=['Context Crushers','Prompt Pirates','Chaos Crew','Evidence Squad','Constraint Club','Goal Getters','Human Override','Plot Twisters'];
    const cqPalette=['#7654d8','#ed5c8f','#f2a13b','#42b9b1','#4b83d1','#db5a50','#5bbd82','#9b6bd6'];
    const cqCharms=['🚀','🤖','💡','🧭','🎮','🔍','⚡','🧠','🛸','🎲','🧩','🦾'];
    const cqRole=(team,playerId,round=0)=>{
      const members=Array.isArray(team?.members)?team.members:[];
      const i=Math.max(0,members.indexOf(playerId));
      return cqRoles[(i+(Number(round)||0))%cqRoles.length];
    };
    const cqPublicPlayer=p=>({id:p.id,name:p.name,mode:p.mode,teamId:p.teamId||null,tutorialDone:!!p.tutorialDone,isTest:!!p.isTest,lastSeen:p.lastSeen,joinedAt:p.joinedAt});
    const cqHydrate=(team,players,state)=>({
      ...team,
      members:(team.members||[]).map(id=>cqPublicPlayer(players[id]||{id,name:'Player',mode:'play'})),
      roles:Object.fromEntries((team.members||[]).map(id=>[id,cqRole(team,id,state.round)]))
    });
    const cqUpdateCandidate=(team,key,field)=>{
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key];
      const proposals=r[field+'Proposals']||{},votes=r[field+'Votes']||{},rows=Object.values(proposals),counts={};
      for(const v of Object.values(votes))counts[v]=(counts[v]||0)+1;
      rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||(a.at||0)-(b.at||0));
      const top=rows[0],topCount=top?(counts[top.id]||0):0,second=rows[1]?(counts[rows[1].id]||0):0;
      const allVoted=Object.keys(votes).length===(team.members||[]).length&&(team.members||[]).length>0;
      const tie=!!top&&topCount===second&&topCount>0;
      r[field+'AllVoted']=allVoted;r[field+'Tie']=tie;r[field+'Candidate']=allVoted&&!tie&&top?{id:top.id,text:top.text,name:top.name,votes:topCount,totalVotes:Object.keys(votes).length}:null;
      if(!r[field+'Candidate']||r[field+'ApprovedId']!==r[field+'Candidate']?.id){r[field+'Approved']=false;r[field+'ApprovedId']=null;r[field+'ApprovedAt']=null;}
      return r[field+'Candidate'];
    };
    const cqFinalizeChoice=(team,key,field)=>{
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key];
      const proposals=r[field+'Proposals']||{},votes=r[field+'Votes']||{};
      const rows=Object.values(proposals);
      if(!rows.length)return;
      const counts={};for(const v of Object.values(votes))counts[v]=(counts[v]||0)+1;
      rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||(a.at||0)-(b.at||0));
      const winner=rows[0];r[field]=winner.text;r[field+'Winner']=winner.id;r[field+'FinalizedAt']=Date.now();
    };
    const cqFinalizeChecks=(team,key)=>{
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key];
      if(r.completedAt)return;
      const ballots=Object.values(r.checkBallots||{});if(!ballots.length)return;
      const totals=[0,0,0,0];for(const b of ballots)for(let i=0;i<4;i++)if(b.checks?.[i])totals[i]++;
      const threshold=Math.ceil(ballots.length/2),checks=totals.map(n=>n>=threshold),n=checks.filter(Boolean).length;
      r.teamChecks=checks;r.checkCount=n;r.ballotCount=ballots.length;r.checkedAt=Date.now();
      if(n<3){r.status='needs-repair';r.hadLowCheck=true;r.move=0;return;}
      const move=n===4?3:2;r.move=move;r.points=move;r.completedAt=Date.now();r.status='complete';
      team.position=(Number(team.position)||0)+move;team.totalPoints=(Number(team.totalPoints)||0)+move;
    };
    if(url.pathname.endsWith('/cq/snapshot')&&method==='GET'){
      const state=await cqState(),teams=await cqTeams(),players=await cqPlayers();
      const rows=Object.values(teams).map(t=>cqHydrate(t,players,state)).sort((a,b)=>(b.position||0)-(a.position||0)||(b.totalPoints||0)-(a.totalPoints||0)||String(a.name).localeCompare(String(b.name)));
      const playerRows=Object.values(players).map(cqPublicPlayer);
      return json({state,teams:rows,players:playerRows,charms:cqCharms,joined:playerRows.length,playing:playerRows.filter(p=>p.mode==='play').length,watching:playerRows.filter(p=>p.mode==='watch').length,generatedAt:Date.now()});
    }
    if(url.pathname.endsWith('/cq/join')&&method==='POST'){
      const b=await request.json().catch(()=>({}));if(!b.playerId)return json({error:'playerId is required'},400);
      const players=await cqPlayers(),id=short(b.playerId,100),now=Date.now(),existing=players[id]||{},mode=b.mode==='watch'?'watch':'play';
      players[id]={...existing,id,name:short(b.name||existing.name||'Player',50),mode,teamId:mode==='watch'?null:(existing.teamId||null),joinedAt:existing.joinedAt||now,lastSeen:now};
      const state=await cqState(),teams=await cqTeams();
      if(mode==='play'&&state.teamsFormed&&!players[id].teamId&&Object.keys(teams).length){
        const smallest=Object.values(teams).sort((a,b)=>(a.members?.length||0)-(b.members?.length||0))[0];
        smallest.members=smallest.members||[];smallest.members.push(id);players[id].teamId=smallest.id;teams[smallest.id]=smallest;await this.state.storage.put('cqTeams',teams);
      }
      await this.state.storage.put('cqPlayers',players);
      const team=players[id].teamId?teams[players[id].teamId]:null;
      return json({ok:true,player:cqPublicPlayer(players[id]),team:team?cqHydrate(team,players,state):null,state});
    }
    if(url.pathname.endsWith('/cq/test-players')&&method==='POST'){
      try{
        const body=await request.json().catch(()=>({}));
        const players=await cqPlayers();
        const teams=await cqTeams();
        const state=await cqState();
        const now=Date.now();
        const count=Math.max(1,Math.min(60,parseInt(body.count,10)||10));
        const watcherCount=Math.max(0,Math.min(20,parseInt(body.watchers,10)||0));
        const names=['Alex','Jordan','Taylor','Morgan','Casey','Riley','Avery','Cameron','Quinn','Parker','Drew','Reese','Skyler','Rowan','Hayden','Emerson','Finley','Sawyer','Dakota','Charlie','Jamie','Kendall','Logan','Bailey','Harper','Reagan','Blake','Sydney','Mason','Devon'];
        for(let i=0;i<count;i++){
          const id='test-player-'+String(i+1);
          const prev=players[id]||{};
          const player={id,name:names[i%names.length]+' '+String(Math.floor(i/names.length)+1),mode:'play',isTest:true,teamId:prev.teamId||null,tutorialDone:state.stage!=='lobby',joinedAt:prev.joinedAt||now+i,lastSeen:now};
          if(state.teamsFormed&&!player.teamId&&Object.keys(teams).length){
            const list=Object.values(teams).sort((x,y)=>(x.members?.length||0)-(y.members?.length||0));
            const smallest=list[0];
            if(smallest){
              smallest.members=Array.isArray(smallest.members)?smallest.members:[];
              if(!smallest.members.includes(id))smallest.members.push(id);
              player.teamId=smallest.id;
              teams[smallest.id]=smallest;
            }
          }
          players[id]=player;
        }
        for(let i=0;i<watcherCount;i++){
          const id='test-watcher-'+String(i+1);
          const prev=players[id]||{};
          players[id]={id,name:'Guest '+String(i+1),mode:'watch',isTest:true,teamId:null,tutorialDone:false,joinedAt:prev.joinedAt||now+count+i,lastSeen:now};
        }
        await this.state.storage.put('cqPlayers',players);
        if(state.teamsFormed)await this.state.storage.put('cqTeams',teams);
        return json({ok:true,created:count,watchers:watcherCount,total:Object.keys(players).length});
      }catch(err){
        return json({error:'Unable to create test players',detail:short(err?.message||String(err),300)},500);
      }
    }
    if(url.pathname.endsWith('/cq/clear-test-players')&&method==='POST'){
      const players=await cqPlayers(),teams=await cqTeams();
      const testIds=new Set(Object.values(players).filter(p=>p.isTest).map(p=>p.id));
      for(const id of testIds)delete players[id];
      for(const team of Object.values(teams))team.members=(team.members||[]).filter(id=>!testIds.has(id));
      await this.state.storage.put('cqPlayers',players);await this.state.storage.put('cqTeams',teams);
      return json({ok:true,removed:testIds.size});
    }
    if(url.pathname.endsWith('/cq/simulate-test-stage')&&method==='POST'){
      const state=await cqState(),players=await cqPlayers(),teams=await cqTeams(),now=Date.now(),final=String(state.stage).startsWith('final'),key=cqRoundKey(state.round,final);
      const testPlayers=Object.values(players).filter(p=>p.isTest&&p.mode==='play'&&p.teamId);
      if(!testPlayers.length)return json({error:'No test players are available'},400);
      for(const p of testPlayers){
        const team=teams[p.teamId];if(!team)continue;
        team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key];
        const base=final?'Help a first-year student make a safe course decision using verified university information.':[
          'Explain AI to a first-year College of Informatics student using plain language and one example.',
          'Help a first-year student decide when AI is useful for schoolwork and when it is not.',
          'Recommend a free study AI tool for a first-year student in three bullets without using private course data.',
          'Evaluate this AI answer, separate facts from assumptions, and flag claims that need verification.'
        ][Math.min(3,state.round||0)];
        if(state.stage==='tutorial'){p.tutorialDone=true;}
        if(state.stage==='build'||state.stage==='final-build'){
          r.buildProposals=r.buildProposals||{};const pid='sim-build-'+p.id;r.buildProposals[pid]={id:pid,playerId:p.id,name:p.name,text:base,at:now};
          r.buildVotes=r.buildVotes||{};r.buildVotes[p.id]='sim-build-'+(team.members?.[0]||p.id);r.status='building';cqUpdateCandidate(team,key,'build');
        }
        if(state.stage==='test'||state.stage==='final-test'){r.tested=r.tested||{};r.tested[p.id]=now;r.status='tested';}
        if(state.stage==='twist'||state.stage==='final-twist'){
          r.repairProposals=r.repairProposals||{};const pid='sim-repair-'+p.id;r.repairProposals[pid]={id:pid,playerId:p.id,name:p.name,text:base+' Also account for the new information and state uncertainty clearly.',at:now};
          r.repairVotes=r.repairVotes||{};r.repairVotes[p.id]='sim-repair-'+(team.members?.[0]||p.id);r.status='repairing';cqUpdateCandidate(team,key,'repair');
        }
        if(state.stage==='check'||state.stage==='final-check'){
          r.checkBallots=r.checkBallots||{};
          const variant=(p.id.charCodeAt(p.id.length-1)||0)%5;
          r.checkBallots[p.id]={playerId:p.id,name:p.name,checks:variant===0?[true,true,true,false]:[true,true,true,true],at:now};r.status='checking';
        }
        team.rounds[key]=r;teams[team.id]=team;players[p.id]=p;
      }
      await this.state.storage.put('cqPlayers',players);await this.state.storage.put('cqTeams',teams);
      return json({ok:true,stage:state.stage,simulated:testPlayers.length});
    }
    if(url.pathname.endsWith('/cq/form-teams')&&method==='POST'){
      const b=await request.json().catch(()=>({})),players=await cqPlayers(),play=Object.values(players).filter(p=>p.mode==='play');
      if(play.length<2)return json({error:'At least 2 players are needed to form teams'},400);
      const target=Math.max(2,Math.min(6,Number(b.teamSize)||5)),teamCount=Math.max(2,Math.ceil(play.length/target)),teams={};
      for(let i=0;i<teamCount;i++){const id='team-'+(i+1);teams[id]={id,name:cqTeamNames[i%cqTeamNames.length],color:cqPalette[i%cqPalette.length],charm:null,customized:false,position:0,totalPoints:0,bonus:0,rounds:{},members:[],stakeholder:['STUDENT','ACADEMIC ADVISOR','PROFESSOR','UNIVERSITY','PARENT','ACCESSIBILITY OFFICE'][i%6]};}
      play.sort((a,b)=>(a.joinedAt||0)-(b.joinedAt||0)).forEach((p,i)=>{const id='team-'+((i%teamCount)+1);teams[id].members.push(p.id);players[p.id].teamId=id;});
      await this.state.storage.put('cqPlayers',players);await this.state.storage.put('cqTeams',teams);
      const state={...(await cqState()),teamsFormed:true,updatedAt:Date.now()};await this.state.storage.put('cqState',state);
      return json({ok:true,state,teams:Object.values(teams).map(t=>cqHydrate(t,players,state))});
    }
    if(url.pathname.endsWith('/cq/team-customize')&&method==='POST'){
      const b=await request.json().catch(()=>({})),players=await cqPlayers(),teams=await cqTeams(),player=players[short(b.playerId,100)];
      if(!player||player.mode!=='play'||!player.teamId)return json({error:'Player is not assigned to a team'},403);
      const team=teams[player.teamId];if(!team)return json({error:'Team not found'},404);
      if(typeof b.name==='string'){
        const name=short(b.name.trim(),32);
        if(name.length<2)return json({error:'Team name must be at least 2 characters'},400);
        const taken=Object.values(teams).some(t=>t.id!==team.id&&String(t.name||'').toLowerCase()===name.toLowerCase());
        if(taken)return json({error:'That team name is already taken'},409);
        team.name=name;
      }
      if(typeof b.charm==='string'){
        const charm=short(b.charm,8);
        if(!cqCharms.includes(charm))return json({error:'Choose one of the available charms'},400);
        const used=Object.values(teams).some(t=>t.id!==team.id&&t.charm===charm);
        if(used)return json({error:'Another team already chose that charm'},409);
        team.charm=charm;
      }
      team.customized=!!team.charm&&!!team.name;
      team.customizedAt=Date.now();team.customizedBy=player.id;
      teams[team.id]=team;await this.state.storage.put('cqTeams',teams);
      return json({ok:true,team:cqHydrate(team,players,await cqState()),charms:cqCharms});
    }
    if(url.pathname.endsWith('/cq/test-mode')&&method==='POST'){
      const b=await request.json().catch(()=>({})),state=await cqState();
      state.testMode=!!b.enabled;state.updatedAt=Date.now();
      await this.state.storage.put('cqState',state);
      return json({ok:true,state});
    }
    if(url.pathname.endsWith('/cq/heartbeat')&&method==='POST'){
      const b=await request.json().catch(()=>({})),players=await cqPlayers(),id=short(b.playerId,100);
      if(players[id]){players[id].lastSeen=Date.now();await this.state.storage.put('cqPlayers',players)}return json({ok:true});
    }
    if(url.pathname.endsWith('/cq/player-action')&&method==='POST'){
      const b=await request.json().catch(()=>({})),players=await cqPlayers(),teams=await cqTeams(),id=short(b.playerId,100),player=players[id];
      if(!player)return json({error:'Player not found'},404);if(player.mode!=='play')return json({error:'Spectators cannot submit team actions'},403);
      const team=teams[player.teamId];if(!team)return json({error:'Teams have not been formed yet'},409);
      const state=await cqState(),now=Date.now(),key=cqRoundKey(state.round,String(state.stage).startsWith('final'));
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key];
      if(b.action==='tutorialDone'){player.tutorialDone=true;}
      if(b.action==='note'){r.notes=r.notes||{};r.notes[id]={playerId:id,name:player.name,text:short(b.text,800),at:now};}
      if(b.action==='proposeBuild'){
        r.buildProposals=r.buildProposals||{};const pid=id+'-'+now;r.buildProposals[pid]={id:pid,playerId:id,name:player.name,text:short(b.text,5000),at:now};r.status='building';
      }
      if(b.action==='voteBuild'){r.buildVotes=r.buildVotes||{};const pid=short(b.proposalId,150);if(r.buildVotes[id]===pid||!pid)delete r.buildVotes[id];else r.buildVotes[id]=pid;cqUpdateCandidate(team,key,'build');}
      if(b.action==='tested'){r.tested=r.tested||{};r.tested[id]=now;r.status='tested';}
      if(b.action==='proposeRepair'){
        r.repairProposals=r.repairProposals||{};const pid=id+'-'+now;r.repairProposals[pid]={id:pid,playerId:id,name:player.name,text:short(b.text,5000),at:now};r.status='repairing';
      }
      if(b.action==='voteRepair'){r.repairVotes=r.repairVotes||{};const pid=short(b.proposalId,150);if(r.repairVotes[id]===pid||!pid)delete r.repairVotes[id];else r.repairVotes[id]=pid;cqUpdateCandidate(team,key,'repair');}
      if(b.action==='checks'){const checks=Array.isArray(b.checks)?b.checks.slice(0,4).map(Boolean):[];r.checkBallots=r.checkBallots||{};r.checkBallots[id]={playerId:id,name:player.name,checks,at:now};r.status='checking';}
      player.lastSeen=now;players[id]=player;teams[team.id]=team;await this.state.storage.put('cqPlayers',players);await this.state.storage.put('cqTeams',teams);
      return json({ok:true,player:cqPublicPlayer(player),team:cqHydrate(team,players,state),state});
    }
    if(url.pathname.endsWith('/cq/review-team')&&method==='POST'){
      const b=await request.json().catch(()=>({})),state=await cqState(),teams=await cqTeams(),team=teams[short(b.teamId,80)];
      if(!team)return json({error:'Team not found'},404);
      const field=b.field==='repair'?'repair':'build',key=cqRoundKey(state.round,String(state.stage).startsWith('final')),r=team.rounds?.[key]||{};
      const candidate=cqUpdateCandidate(team,key,field);
      if(!candidate)return json({error:r[field+'Tie']?'Team vote is tied. The team must resolve the tie first.':'Every team member must vote before instructor review.'},409);
      r[field+'Approved']=true;r[field+'ApprovedId']=candidate.id;r[field+'ApprovedAt']=Date.now();
      team.rounds[key]=r;teams[team.id]=team;await this.state.storage.put('cqTeams',teams);
      return json({ok:true,teamId:team.id,field,candidate});
    }
    const cqTestFillChoice=(team,key,field)=>{
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key],now=Date.now();
      const propKey=field+'Proposals',voteKey=field+'Votes';
      r[propKey]=r[propKey]||{};r[voteKey]=r[voteKey]||{};
      let rows=Object.values(r[propKey]);
      if(!rows.length){
        const id='test-auto-'+field+'-'+team.id+'-'+now;
        const text=field==='build'?'[TEST MODE] Sample team answer for flow testing.':'[TEST MODE] Sample repaired answer for flow testing.';
        r[propKey][id]={id,playerId:'test-mode',name:'Test Mode',text,at:now};rows=[r[propKey][id]];
      }
      const counts={};for(const v of Object.values(r[voteKey]))counts[v]=(counts[v]||0)+1;
      rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||(a.at||0)-(b.at||0));
      const winner=rows[0];
      for(const memberId of team.members||[])if(!r[voteKey][memberId])r[voteKey][memberId]=winner.id;
      cqUpdateCandidate(team,key,field);
      r[field+'Approved']=true;r[field+'ApprovedId']=r[field+'Candidate']?.id||winner.id;r[field+'ApprovedAt']=now;
      return r;
    };
    const cqTestFillChecks=(team,key)=>{
      team.rounds=team.rounds||{};team.rounds[key]=team.rounds[key]||{};const r=team.rounds[key],now=Date.now();
      r.checkBallots=r.checkBallots||{};
      for(const memberId of team.members||[])if(!r.checkBallots[memberId])r.checkBallots[memberId]={playerId:memberId,name:'Test Mode',checks:[true,true,true,true],at:now};
      return r;
    };
    if(url.pathname.endsWith('/cq/control')&&method==='POST'){
      const b=await request.json().catch(()=>({})),current=await cqState(),teams=await cqTeams(),players=await cqPlayers();let next={...current,updatedAt:Date.now()};
      const allowed=['lobby','tutorial','build','test','twist','check','reveal','final-build','final-test','final-twist','final-check','final-reveal','complete'];
      const oldStage=current.stage;if(allowed.includes(b.stage))next.stage=b.stage;if(Number.isFinite(b.round))next.round=Math.max(0,Math.min(4,Number(b.round)));if(typeof b.resultsVisible==='boolean')next.resultsVisible=b.resultsVisible;
      if(oldStage==='lobby'&&next.stage==='tutorial'){
        const unfinished=Object.values(teams).filter(t=>!t.customized);
        if(unfinished.length&&current.testMode){
          const used=new Set(Object.values(teams).map(t=>t.charm).filter(Boolean));
          for(const t of unfinished){t.charm=t.charm||cqCharms.find(ch=>!used.has(ch))||'🎲';used.add(t.charm);t.customized=true;t.customizedAt=Date.now();t.customizedBy='test-mode';}
        }else if(unfinished.length)return json({error:`Waiting for ${unfinished.map(t=>t.name).join(', ')} to choose a team name and charm.`},409);
      }
      const oldFinal=String(oldStage).startsWith('final'),oldKey=cqRoundKey(current.round,oldFinal);
      if((oldStage==='build'&&next.stage==='test')||(oldStage==='final-build'&&next.stage==='final-test')){
        for(const t of Object.values(teams)){
          if(current.testMode)cqTestFillChoice(t,oldKey,'build');
          const candidate=cqUpdateCandidate(t,oldKey,'build'),r=t.rounds?.[oldKey]||{};
          if(!candidate)return json({error:r.buildTie?`${t.name} has a tied vote. The team must resolve it.`:`${t.name} is still waiting for every member to vote.`},409);
          if(!r.buildApproved||r.buildApprovedId!==candidate.id)return json({error:`${t.name}'s winning answer still needs instructor review.`},409);
          cqFinalizeChoice(t,oldKey,'build');
        }
      }
      if((oldStage==='twist'&&next.stage==='check')||(oldStage==='final-twist'&&next.stage==='final-check')){
        for(const t of Object.values(teams)){
          if(current.testMode)cqTestFillChoice(t,oldKey,'repair');
          const candidate=cqUpdateCandidate(t,oldKey,'repair'),r=t.rounds?.[oldKey]||{};
          if(!candidate)return json({error:r.repairTie?`${t.name} has a tied repair vote. The team must resolve it.`:`${t.name} is still waiting for every member to vote on a repair.`},409);
          if(!r.repairApproved||r.repairApprovedId!==candidate.id)return json({error:`${t.name}'s winning repair still needs instructor review.`},409);
          cqFinalizeChoice(t,oldKey,'repair');
        }
      }
      if((oldStage==='check'&&next.stage==='reveal')||(oldStage==='final-check'&&next.stage==='final-reveal'))for(const t of Object.values(teams)){if(current.testMode)cqTestFillChecks(t,oldKey);cqFinalizeChecks(t,oldKey);}
      await this.state.storage.put('cqTeams',teams);await this.state.storage.put('cqState',next);return json(next);
    }
    if(url.pathname.endsWith('/cq/bonus')&&method==='POST'){
      const b=await request.json().catch(()=>({})),teams=await cqTeams(),id=short(b.teamId,80),team=teams[id];if(!team)return json({error:'Team not found'},404);
      const delta=Math.max(-1,Math.min(1,Number(b.delta)||0)),label=short(b.label||'',80),now=Date.now();
      team.position=Math.max(0,(Number(team.position)||0)+delta);team.totalPoints=Math.max(0,(Number(team.totalPoints)||0)+delta);team.bonus=(Number(team.bonus)||0)+delta;
      team.awards=Array.isArray(team.awards)?team.awards:[];
      if(delta>0&&label)team.awards.push({label,at:now,round:(await cqState()).round});
      if(delta<0&&team.awards.length)team.awards.pop();
      teams[id]=team;await this.state.storage.put('cqTeams',teams);return json({ok:true,team});
    }
    if(url.pathname.endsWith('/cq/reset')&&method==='POST'){
      await this.state.storage.delete('cqState');await this.state.storage.delete('cqTeams');await this.state.storage.delete('cqPlayers');const initial=cqInitial();await this.state.storage.put('cqState',initial);return json({ok:true,state:initial});
    }
    if(url.pathname.endsWith('/research/pulse')&&method==='POST'){
      const b=await request.json().catch(()=>({}));
      if(!b.pulse||!b.device||!b.value)return json({error:'pulse, device, and value are required'},400);
      const pulses=(await this.state.storage.get('researchPulses'))||{};
      const id=short(b.pulse,80);pulses[id]||={};
      pulses[id][short(b.device,120)]={pulse:id,question:short(b.question,240),value:short(b.value,120),comment:short(b.comment,500),moment:short(b.moment,120),at:Date.now()};
      await this.state.storage.put('researchPulses',pulses);return json({ok:true});
    }
    if(url.pathname.endsWith('/research/report')&&method==='GET'){
      const participants=(await this.state.storage.get('participants'))||{},answers=(await this.state.storage.get('answers'))||{},pulses=(await this.state.storage.get('researchPulses'))||{},transitions=(await this.state.storage.get('researchTransitions'))||[];
      const answering=new Set();for(const rows of Object.values(answers))for(const d of Object.keys(rows||{}))answering.add(d);
      const pulseSummary={};const comments=[];
      for(const [id,rows] of Object.entries(pulses)){const vals=Object.values(rows||{}),counts={};for(const r of vals){counts[r.value]=(counts[r.value]||0)+1;if(r.comment)comments.push({pulse:id,comment:r.comment,at:r.at})}pulseSummary[id]={n:vals.length,counts};}
      const moments=[];for(let i=0;i<transitions.length;i++){const t=transitions[i],next=transitions[i+1];moments.push({step:t.step,startedAt:t.at,observedSeconds:next?Math.max(0,(next.at-t.at)/1000):null});}
      return json({joined:Object.keys(participants).length,answering:answering.size,pulses:pulseSummary,comments,moments,startedAt:transitions[0]?.at||null,lastTransitionAt:transitions.at(-1)?.at||null});
    }
    if(url.pathname.endsWith('/review/start')&&method==='POST'){
      const b=await request.json().catch(()=>({}));if(!b.device)return json({error:'device is required'},400);
      const progress=(await this.state.storage.get('reviewProgress'))||{},device=short(b.device,120),now=Date.now();
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),startedAt:progress[device]?.startedAt||now,lastSeen:now,status:'started'};
      await this.state.storage.put('reviewProgress',progress);return json({ok:true});
    }
    if(url.pathname.endsWith('/review/answer')&&method==='POST'){
      const b=await request.json().catch(()=>({}));
      if(!b.device||!b.question)return json({error:'device and question are required'},400);
      const all=(await this.state.storage.get('reviewAnswers'))||{},device=short(b.device,120);
      all[device]||={};
      all[device][String(b.question)]={question:Number(b.question),level:Number(b.level)||0,skill:short(b.skill,80),concept:short(b.concept,120),selected:b.selected,correct:!!b.correct,at:Date.now()};
      await this.state.storage.put('reviewAnswers',all);
      const progress=(await this.state.storage.get('reviewProgress'))||{};
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),startedAt:progress[device]?.startedAt||Date.now(),lastSeen:Date.now()};
      await this.state.storage.put('reviewProgress',progress);
      return json({ok:true});
    }
    if(url.pathname.endsWith('/review/complete')&&method==='POST'){
      const b=await request.json().catch(()=>({}));if(!b.device)return json({error:'device is required'},400);
      const progress=(await this.state.storage.get('reviewProgress'))||{},device=short(b.device,120);
      progress[device]={...(progress[device]||{}),device,name:short(b.name||progress[device]?.name||'Anonymous',80),score:Number(b.score)||0,total:Number(b.total)||25,percent:Number(b.percent)||0,minutes:Number(b.minutes)||0,skills:Array.isArray(b.skills)?b.skills.slice(0,20):[],xp:Number(b.xp)||0,rank:short(b.rank||'',80),bestStreak:Number(b.bestStreak)||0,recovered:Number(b.recovered)||0,status:'complete',startedAt:progress[device]?.startedAt||Date.now(),lastSeen:Date.now(),completedAt:Date.now()};
      await this.state.storage.put('reviewProgress',progress);return json({ok:true});
    }
    if(url.pathname.endsWith('/review/report')&&method==='GET'){
      const participants=(await this.state.storage.get('participants'))||{},answers=(await this.state.storage.get('reviewAnswers'))||{},progress=(await this.state.storage.get('reviewProgress'))||{};
      const ids=new Set([...Object.keys(participants),...Object.keys(answers),...Object.keys(progress)]),skillAgg={};
      const rows=[...ids].map(device=>{
        const p=participants[device]||{},g=progress[device]||{},a=Object.values(answers[device]||{}),correct=a.filter(x=>x.correct).length;
        for(const x of a){if(!x.skill)continue;skillAgg[x.skill]||={skill:x.skill,n:0,c:0};skillAgg[x.skill].n++;if(x.correct)skillAgg[x.skill].c++;}
        return {device,name:short(g.name||p.name||'Anonymous',80),answered:a.length,correct,percent:g.completedAt?g.percent:(a.length?Math.round(correct/a.length*100):null),xp:g.xp||0,rank:g.rank||'',bestStreak:g.bestStreak||0,recovered:g.recovered||0,status:g.status||(g.completedAt?'complete':'started'),startedAt:g.startedAt||p.joinedAt||null,lastSeen:g.lastSeen||p.lastSeen||null,completedAt:g.completedAt||null,minutes:g.minutes||null};
      }).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
      const skills=Object.values(skillAgg).map(x=>({...x,percent:x.n?Math.round(x.c/x.n*100):0})).sort((a,b)=>a.percent-b.percent);
      return json({rows,skills,generatedAt:Date.now()});
    }
    const clone=request.clone();const response=await super.fetch(request);
    if(response.ok&&method==='POST'&&url.pathname.endsWith('/state')){
      try{const b=await clone.json();if(Number.isFinite(b.step)){const arr=(await this.state.storage.get('researchTransitions'))||[],last=arr[arr.length-1];if(!last||last.step!==b.step){arr.push({step:b.step,at:Date.now()});await this.state.storage.put('researchTransitions',arr.slice(-200));}}}catch(_){ }
    }
    return response;
  }
}

function addBefore(html, marker, value) { return html.includes(value.match(/(?:href|src)=\"([^\"]+)/)?.[1] || value) ? html : html.replace(marker, value + marker); }

export default {
  async fetch(request, env) {
    const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/rehearsal') { const u = new URL('/rehearsal-v01019.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/powerpoint-overlay') { const u = new URL('/powerpoint-overlay.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/powerpoint-live') { const u = new URL('/powerpoint-live.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-overlay') { const u = new URL('/google-slides-overlay.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-live') { const u = new URL('/google-slides-live.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/google-slides-room') { const u = new URL('/google-slides-room.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/week5-powerpoint-test') { const u = new URL('/week5-powerpoint-test.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/pilot-report') { const u = new URL('/pilot-report-v01021.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest' || path === '/context-quest/team' || path === '/inf128-context-quest') { const u = new URL('/context-quest.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest/instructor') { const u = new URL('/context-quest-instructor.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest/board') { const u = new URL('/context-quest-board.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/context-quest.js') { const u = new URL('/context-quest.js', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/midterm-quest' || path === '/review') { const u = new URL('/midterm-quest.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/midterm-quest-report' || path === '/review-report') { const u = new URL('/midterm-quest-report.html', request.url); return env.ASSETS.fetch(new Request(u, request)); }
    if (path === '/instructor') { const u = new URL(request.url); u.pathname = '/instructor-v2.html'; return env.ASSETS.fetch(new Request(u, request)); }
    const response = await baseHandler.fetch(request, env); if (!response.ok) return response;
    const type = response.headers.get('content-type') || ''; if (!type.includes('text/html')) return response;
    const classroomSurface = ['/builder','/student','/instructor','/room','/display'].includes(path); if (!classroomSurface) return response;
    let html = await response.text();
    html = addBefore(html, '</head>', '<link rel="stylesheet" href="/v0109-icons.css">'); html = addBefore(html, '</body>', '<script src="/v0109-icons.js"></script>');
    if (path === '/builder') {
      // Builder is now self-contained. Do not inject legacy Builder layers here:
      // several older scripts target retired DOM/state names and can disable current controls.
      // Session-specific enhancements are loaded directly by public/builder.html.
    }
    if(path==='/student'){
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      html=addBefore(html,'</body>','<script src="/v01021-student-research.js"></script>');
      html=addBefore(html,'</body>','<script src="/v01022-student-a11y.js"></script>');
    }
    if (path === '/instructor') {
      html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01010-navigation.css">'); html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01019.css">');html=addBefore(html,'</head>','<link rel="stylesheet" href="/v01021-research.css">');
      for (const f of ['v01010-navigation.js','v01019-moment-guides.js','v01020-guides.js','v01019-instructor.js','v01021-instructor-research.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    if (path === '/room' || path === '/display') {
      for (const f of ['v01016-room.css','v01024-room-media.css','v01028-room-match.css']) html=addBefore(html,'</head>',`<link rel="stylesheet" href="/${f}">`);
      for (const f of ['v01016-room.js','v01016-room-media-fix.js']) html=addBefore(html,'</body>',`<script src="/${f}"></script>`);
    }
    const headers = new Headers(response.headers); headers.delete('content-length'); headers.set('cache-control','no-store'); return new Response(html,{status:response.status,headers});
  }
};
