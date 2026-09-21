(()=>{
function ctx(){
  try{
    if(typeof session==='undefined'||!session||typeof index==='undefined')return null;
    const visual=(((window.SessionVisuals||{})[session.id]||{})[index])||null;
    return visual?{visual,index,sessionId:session.id}:null;
  }catch(_){return null}
}
function visualHTML(v){
  if(v?.type==='svg'&&v.svg)return '<div style="width:100%;min-height:320px;display:flex;align-items:center;justify-content:center;background:#050505;border-radius:12px;overflow:hidden">'+v.svg+'</div>';
  return '';
}
function paint(){
  const c=ctx();if(!c)return;
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