(()=>{
const WEEK5='inf125-week05-session1-multimodal-communication';
const DECK='1-g7tK_8ghPqr8zzmbBgrbb3Z-rNCTVqGQLWMIbcQ4VY';
const SLIDES={
1:{deck:1,id:'p1',title:'AI REMIX LAB'},2:{deck:2,id:'p2',title:'COLD OPEN'},3:{deck:4,id:'p3',title:'QUICK VOTE'},4:{deck:6,id:'p4',title:'DEBRIEF'},
5:{deck:8,id:'p5',title:'MINI LESSON'},6:{deck:10,id:'p6',title:'CORE MODEL'},7:{deck:11,id:'p7',title:'One idea. Four remixes.'},
8:{deck:12,id:'p8',title:'TRADEOFFS'},9:{deck:13,id:'p9',title:'WATCH THE IDEA CHANGE'},10:{deck:14,id:'p10',title:'AI Remix Challenge'},
11:{deck:15,id:'p11',title:'CHOOSE AN AUDIENCE'},12:{deck:16,id:'p12',title:'REMIX IN PROGRESS…'},13:{deck:17,id:'p13',title:'THE MULTIMODAL SHOWDOWN'},
14:{deck:18,id:'p14',title:'POLISHED ≠ ACCURATE'},15:{deck:19,id:'p15',title:'HUMAN JUDGMENT'},16:{deck:20,id:'p16',title:'EXIT PULSE'}
};
const MAP8=[
{start:1,end:4,phase:'EXPERIENCE'},{start:5,end:6,phase:'UNDERSTAND'},{start:7,end:8,phase:'COMPARE'},
{start:9,end:9,phase:'LIVE TRANSFORM'},{start:10,end:11,phase:'COMMIT'},{start:12,end:12,phase:'CREATE'},
{start:13,end:15,phase:'SHARE + QUESTION'},{start:16,end:16,phase:'REFLECT'}
];
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function ctx(){
  try{
    if(typeof s==='undefined'||!s||typeof idx==='undefined'||s.id!==WEEK5||s.steps.length!==8)return null;
    return MAP8[idx]?{range:MAP8[idx],index:idx}:null;
  }catch(_){return null}
}
function deckNumbers(r){const a=[];for(let n=r.start;n<=r.end;n++)if(SLIDES[n])a.push(SLIDES[n].deck);return a}
function slideLabel(r){const d=deckNumbers(r);return d.length===1?'Deck slide '+d[0]:'Deck slides '+d.join(', ')}
function titles(r){const a=[];for(let n=r.start;n<=r.end;n++)if(SLIDES[n])a.push('<span><b>'+SLIDES[n].deck+'</b> '+esc(SLIDES[n].title)+'</span>');return a.join('<span class="w5sep">•</span>')}
function slideUrl(r){return 'https://docs.google.com/presentation/d/'+DECK+'/edit#slide=id.'+(SLIDES[r.start]?.id||'p1')}
function paint(){
  const c=ctx();if(!c)return;
  const editor=document.getElementById('editor');if(!editor)return;
  const teach=document.getElementById('teach');if(teach)teach.href='/google-slides-live?session='+encodeURIComponent(WEEK5);
  const key=WEEK5+':'+c.index+':'+c.range.start+'-'+c.range.end;
  let box=editor.querySelector('.w5-slide-context');
  if(box?.dataset.key===key)return;
  box?.remove();
  const anchor=editor.querySelector(':scope > .eyebrow');
  if(!anchor)return;
  const html='<section class="w5-slide-context" data-key="'+key+'">'+
    '<div><div class="eyebrow">Google Slides context</div><h3>'+esc(c.range.phase)+' · '+slideLabel(c.range)+'</h3>'+
    '<div class="w5titles">'+titles(c.range)+'</div></div>'+
    '<div class="w5actions"><a class="btn" target="_blank" rel="noopener" href="'+slideUrl(c.range)+'">Open '+slideLabel(c.range)+'</a>'+
    '<a class="btn" target="_blank" rel="noopener" href="/google-slides-room?session='+encodeURIComponent(WEEK5)+'">Projection</a></div>'+
    '<p>Edit the interaction below with these slides in view. ShowRunner skips blank deck slides 3, 5, 7, and 9. Prompts, choices, timing, and instructor cues remain editable.</p>'+
  '</section>';
  anchor.insertAdjacentHTML('afterend',html);
}
function schedule(){requestAnimationFrame(paint)}
window.addEventListener('load',()=>{schedule();setTimeout(paint,250)});
document.addEventListener('click',e=>{if(e.target.closest('.moment,[data-i],[data-mode],#prevR,#nextR'))setTimeout(paint,0)});
const root=document.getElementById('work')||document.body;
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
})();