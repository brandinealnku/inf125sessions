(()=>{
const WEEK5='inf125-week05-session1-multimodal-communication';
const DECK='1-g7tK_8ghPqr8zzmbBgrbb3Z-rNCTVqGQLWMIbcQ4VY';
const SLIDES=[
  null,
  {id:'p1',title:'AI REMIX LAB'},
  {id:'p2',title:'COLD OPEN'},
  {id:'p3',title:'QUICK VOTE'},
  {id:'p4',title:'DEBRIEF'},
  {id:'p5',title:'MINI LESSON'},
  {id:'p6',title:'CORE MODEL'},
  {id:'p7',title:'One idea. Four remixes.'},
  {id:'p8',title:'TRADEOFFS'},
  {id:'p9',title:'WATCH THE IDEA CHANGE'},
  {id:'p10',title:'AI Remix Challenge'},
  {id:'p11',title:'CHOOSE AN AUDIENCE'},
  {id:'p12',title:'REMIX IN PROGRESS…'},
  {id:'p13',title:'THE MULTIMODAL SHOWDOWN'},
  {id:'p14',title:'POLISHED ≠ ACCURATE'},
  {id:'p15',title:'HUMAN JUDGMENT'},
  {id:'p16',title:'EXIT PULSE'}
];
const MAP8=[
  {start:1,end:4,phase:'EXPERIENCE'},
  {start:5,end:6,phase:'UNDERSTAND'},
  {start:7,end:8,phase:'COMPARE'},
  {start:9,end:9,phase:'LIVE TRANSFORM'},
  {start:10,end:11,phase:'COMMIT'},
  {start:12,end:12,phase:'CREATE'},
  {start:13,end:15,phase:'SHARE + QUESTION'},
  {start:16,end:16,phase:'REFLECT'}
];
const MAP12=[
  {start:2,end:2,phase:'COLD OPEN'},
  {start:3,end:3,phase:'QUICK VOTE'},
  {start:4,end:4,phase:'DEBRIEF'},
  {start:5,end:6,phase:'CORE MODEL'},
  {start:7,end:7,phase:'FOUR REMIXES'},
  {start:8,end:8,phase:'TRADEOFFS'},
  {start:9,end:9,phase:'LIVE REMIX'},
  {start:10,end:11,phase:'AUDIENCE'},
  {start:12,end:12,phase:'CREATE'},
  {start:13,end:13,phase:'SHOWDOWN'},
  {start:14,end:15,phase:'HUMAN JUDGMENT'},
  {start:16,end:16,phase:'EXIT PULSE'}
];

function context(){
  try{
    if(typeof session==='undefined'||!session||typeof index==='undefined'||session.id!==WEEK5)return null;
    const visual=(((window.SessionVisuals||{})[session.id]||{})[index])||null;
    const map=session.steps.length===12?MAP12:MAP8;
    const range=map[index]||null;
    return {visual,index,sessionId:session.id,range};
  }catch(_){return null}
}
function visualHTML(v){
  if(v?.type==='svg'&&v.svg)return '<div style="width:100%;min-height:320px;display:flex;align-items:center;justify-content:center;background:#050505;border-radius:12px;overflow:hidden">'+v.svg+'</div>';
  return '';
}
function slideLabel(range){
  if(!range)return '';
  return range.start===range.end?'Slide '+range.start:'Slides '+range.start+'–'+range.end;
}
function slideTitles(range){
  if(!range)return '';
  const rows=[];
  for(let n=range.start;n<=range.end;n++)if(SLIDES[n])rows.push('<span style="display:inline-flex;gap:5px;align-items:center"><b style="color:#d7a93d">'+n+'</b> '+escapeHtml(SLIDES[n].title)+'</span>');
  return rows.join('<span style="color:#5f5a51"> • </span>');
}
function escapeHtml(v){
  return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function deckLink(range){
  const id=SLIDES[range?.start]?.id||'p1';
  return 'https://docs.google.com/presentation/d/'+DECK+'/edit#slide=id.'+id;
}
function mappingHTML(range){
  if(!range)return '';
  return '<section class="w5-slide-context" style="border:1px solid #3d382c;background:linear-gradient(135deg,#18150f,#10100e);border-radius:14px;padding:14px 16px;margin:14px 0 18px">'+
    '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">'+
      '<div><div class="eyebrow">Google Slides context</div>'+
      '<div style="font:500 22px Georgia,serif;margin-top:4px">'+escapeHtml(range.phase)+' · '+slideLabel(range)+'</div>'+
      '<div style="color:#aaa398;font-size:12px;line-height:1.55;margin-top:7px">'+slideTitles(range)+'</div></div>'+
      '<a class="btn" target="_blank" rel="noopener" href="'+deckLink(range)+'">Open '+slideLabel(range)+'</a>'+
    '</div>'+
    '<div style="border-top:1px solid #2d2b26;margin-top:12px;padding-top:10px;color:#8f897f;font-size:11px">Edit the interaction below with these slides in view. Slide mapping is fixed for this Week 05 experience; interaction content remains editable.</div>'+
  '</section>';
}
function paint(){
  const c=context();if(!c)return;
  const editor=document.getElementById('momentEditor');
  const teach=document.getElementById('openInstructor');
  if(teach)teach.href='/google-slides-live?session='+encodeURIComponent(c.sessionId);
  if(editor){
    const roomLink=editor.querySelector('.editorTop a.btn');
    if(roomLink)roomLink.href='/google-slides-room?session='+encodeURIComponent(c.sessionId);
  }
  if(editor&&c.range){
    const key=c.sessionId+':'+c.index+':'+c.range.start+'-'+c.range.end;
    let box=editor.querySelector('.w5-slide-context');
    if(!box||box.dataset.contextKey!==key){
      if(box)box.remove();
      const top=editor.querySelector('.editorTop');
      if(top){
        top.insertAdjacentHTML('afterend',mappingHTML(c.range));
        box=editor.querySelector('.w5-slide-context');
        if(box)box.dataset.contextKey=key;
      }
    }
  }
  const html=visualHTML(c.visual);if(!html)return;
  const key=c.sessionId+':'+c.index;
  const preview=document.querySelector('#momentEditor .preview');
  if(preview&&preview.dataset.week5VisualKey!==key){
    preview.dataset.week5VisualKey=key;
    preview.innerHTML='<div class="eyebrow">Room preview</div>'+html;
  }
  const room=document.getElementById('roomStage');
  if(room&&room.dataset.week5VisualKey!==key){
    room.dataset.week5VisualKey=key;
    room.innerHTML=html;
  }
}
function schedule(){requestAnimationFrame(paint)}
window.addEventListener('load',()=>{schedule();setTimeout(paint,300)});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-mode],.moment,[data-i],#prevRehearse,#nextRehearse'))setTimeout(paint,0);
});
const target=document.getElementById('work')||document.body;
new MutationObserver(schedule).observe(target,{childList:true,subtree:true});
})();