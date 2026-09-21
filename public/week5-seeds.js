(()=>{
const VERSION='0.10.7';
const SESSION_PATH='/sessions/week5-multimodal.json';
const MARKER='showrunner-week5-seeded-v0107';
async function seed(){
  try{
    if(sessionStorage.getItem(MARKER)==='1')return;
    const session=await fetch(SESSION_PATH,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Could not load Week 5 session');return r.json()});
    const res=await fetch('/api/builder/session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(session)});
    if(!res.ok)throw new Error('Could not save Week 5 session');
    sessionStorage.setItem(MARKER,'1');
    location.reload();
  }catch(e){console.warn('Week 5 seed skipped',e)}
}
if(location.pathname==='/builder')seed();
})();