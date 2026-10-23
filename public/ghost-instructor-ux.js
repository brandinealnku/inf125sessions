(()=>{const C=window.Classroom;const consoleEl=document.getElementById('console');if(!consoleEl)return;
const timer=document.createElement('div');timer.id='activityTimerControls';timer.innerHTML='<label for="activityMinutes">Activity timer</label><input id="activityMinutes" type="number" min="1" max="60" value="5" aria-label="Timer duration in minutes"><button id="activityStart" type="button">Start</button><button id="activityPause" type="button">Stop</button><strong id="activityRemaining" role="timer">—</strong>';
consoleEl.querySelector('.controls').append(timer);
const mins=document.getElementById('activityMinutes'),remaining=document.getElementById('activityRemaining');
let lastStep=-1,lastInput='',expanded=false;
function tick(){const step=Number(C.snapshot.state.step||0),current=C.current();if(step!==lastStep){lastStep=step;const target=Math.max(1,Math.min(60,Number(current.minutes)||5));mins.value=target;lastInput=String(target)}const end=C.snapshot.state.timerEndsAt;if(end){const secs=Math.max(0,Math.ceil((end-Date.now())/1000));remaining.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');remaining.style.color=secs<=30?'#FFC6BA':'#8DF0D2'}else remaining.textContent='—';}
async function setTimer(end){try{await C.state({timerEndsAt:end});await C.refresh();tick()}catch(e){remaining.textContent='Timer error'}}
document.getElementById('activityStart').onclick=()=>{const n=Math.max(1,Math.min(60,Number(mins.value)||5));setTimer(Date.now()+n*60000)};
document.getElementById('activityPause').onclick=()=>setTimer(null);
const notes= document.getElementById('instructorRunbook');if(notes){notes.open=false}
const panels=[document.getElementById('projectorAppControls')].filter(Boolean);
const dock=document.createElement('button');dock.id='showToolsButton';dock.type='button';dock.textContent='Tools ▾';dock.setAttribute('aria-expanded','false');dock.onclick=()=>{expanded=!expanded;document.body.classList.toggle('toolsExpanded',expanded);dock.setAttribute('aria-expanded',String(expanded));dock.textContent=expanded?'Tools ▴':'Tools ▾'};document.body.append(dock);
document.body.classList.add('instructorOptimized');setInterval(tick,450);tick();
})();