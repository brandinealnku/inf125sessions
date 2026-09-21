(()=>{
const WEEK5='inf125-week05-session1-multimodal-communication';
const DECK='1-g7tK_8ghPqr8zzmbBgrbb3Z-rNCTVqGQLWMIbcQ4VY';
const SLIDES={
1:'AI REMIX LAB',2:'COLD OPEN',3:'QUICK VOTE',4:'DEBRIEF',5:'MINI LESSON',6:'CORE MODEL',7:'One idea. Four remixes.',
8:'TRADEOFFS',9:'WATCH THE IDEA CHANGE',10:'AI Remix Challenge',11:'CHOOSE AN AUDIENCE',12:'REMIX IN PROGRESS…',
13:'THE MULTIMODAL SHOWDOWN',14:'POLISHED ≠ ACCURATE',15:'HUMAN JUDGMENT',16:'EXIT PULSE'
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
function slideLabel(r){return r.start===r.end?'Slide '+r.start:'Slides '+r.start+'–'+r.end}
function titles(r){const a=[];for(let n=r.start;n<=r.end;n++)a.push('<span><b>'+n+'</b> '+esc(SLIDES[n])+'</span>');return a.join('<span class="w5sep">•</span>')}
function slideUrl(r){return 'https://docs.google.com/presentation/d/'+DECK+'/edit#slide=id.p'+r.start}
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
    '<p>Edit the interaction below with these slides in view. The slide mapping is fixed for this Week 05 experience; prompts, choices, timing, and instructor cues are editable.</p>'+
  '</section>';
  anchor.insertAdjacentHTML('afterend',html);
}
function schedule(){requestAnimationFrame(paint)}
window.addEventListener('load',()=>{schedule();setTimeout(paint,250)});
document.addEventListener('click',e=>{if(e.target.closest('.moment,[data-i],[data-mode],#prevR,#nextR'))setTimeout(paint,0)});
const root=document.getElementById('work')||document.body;
new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
})();