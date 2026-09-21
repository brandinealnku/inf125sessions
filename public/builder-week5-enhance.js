(()=>{
function getVisual(){
  try{
    if(typeof session==='undefined'||!session||typeof index==='undefined') return null;
    return (((window.SessionVisuals||{})[session.id]||{})[index])||null;
  }catch(_){return null}
}
function visualHTML(v){
  if(!v)return'';
  if(v.type==='svg'&&v.svg)return '<div style="width:100%;min-height:320px;display:flex;align-items:center;justify-content:center;background:#050505;border-radius:12px;overflow:hidden">'+v.svg+'</div>';
  return '';
}
function paintEdit(){
  const v=getVisual(),html=visualHTML(v);
  if(!html)return;
  const preview=document.querySelector('#momentEditor .preview');
  if(!preview)return;
  preview.innerHTML='<div class="eyebrow">Room preview</div>'+html;
}
function paintRehearse(){
  const v=getVisual(),html=visualHTML(v);
  if(!html)return;
  const room=document.getElementById('roomStage');
  if(room)room.innerHTML=html;
}
function wrap(name,after){
  try{
    const fn=window[name]||eval(name);
    if(typeof fn!=='function')return;
    const wrapped=function(...args){const out=fn.apply(this,args);try{after()}catch(_){}return out};
    try{window[name]=wrapped}catch(_){}
    try{eval(name+'=wrapped')}catch(_){}
  }catch(_){}
}
function repaint(){paintEdit();paintRehearse()}
window.addEventListener('load',()=>{setTimeout(repaint,0);setTimeout(repaint,500)});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-mode="rehearse"],[data-mode="edit"],.moment,[data-i],#prevRehearse,#nextRehearse'))setTimeout(repaint,0);
});
const obs=new MutationObserver(()=>{if(document.getElementById('momentEditor'))requestAnimationFrame(repaint)});
obs.observe(document.body,{childList:true,subtree:true});
})();