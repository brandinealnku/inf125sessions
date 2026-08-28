(function(){
  const style=document.createElement('style');
  style.textContent=`
    .rail>.kicker:first-child{font-size:0}.rail>.kicker:first-child:after{content:'SHOWRUNNER';font-size:11px;letter-spacing:.15em;color:var(--muted)}
    .rail button{border-bottom:1px solid rgba(0,0,0,.05);padding:11px 0}
    .rail button:last-child{border-bottom:0}
    .showrunner-toggle{display:none;border:1px solid var(--ink);background:var(--ink);color:var(--paper);padding:10px 13px;border-radius:4px;font-weight:800;cursor:pointer}
    .showrunner-drawer{display:none;position:fixed;inset:0;z-index:80;background:rgba(21,21,21,.28);backdrop-filter:blur(4px)}
    .showrunner-sheet{position:absolute;top:0;bottom:0;left:0;width:min(86vw,390px);overflow:auto;background:var(--paper);padding:22px 18px 110px;border-right:1px solid var(--line);box-shadow:20px 0 60px rgba(0,0,0,.16)}
    .showrunner-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:15px;border-bottom:1px solid var(--line);margin-bottom:8px}
    .showrunner-head strong{font-family:Georgia,"Times New Roman",serif;font-size:28px;font-weight:500}
    .showrunner-close{width:44px;height:44px;border:1px solid var(--line);background:transparent;border-radius:4px;font-size:22px;cursor:pointer}
    .showrunner-list button{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--muted);padding:14px 4px;cursor:pointer}
    .showrunner-list button.active{color:var(--ink);font-weight:800}
    .showrunner-list .sr-time{font-size:11px;color:var(--accent);font-weight:800}
    .showrunner-list .sr-label{display:block;font-size:13px}
    .showrunner-list .sr-title{display:block;font-family:Georgia,"Times New Roman",serif;font-size:17px;line-height:1.15;margin-top:3px;color:inherit}
    @media(max-width:1000px){
      .showrunner-toggle{display:inline-flex;align-items:center}
      .showrunner-drawer.open{display:block}
      .top{gap:10px}
      .top>div:first-child{flex:1}
    }
  `;
  document.head.appendChild(style);

  const top=document.querySelector('.top');
  if(!top)return;
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='showrunner-toggle';
  toggle.textContent='Showrunner';
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','showrunner-drawer');
  top.appendChild(toggle);

  const drawer=document.createElement('div');
  drawer.id='showrunner-drawer';
  drawer.className='showrunner-drawer';
  drawer.innerHTML='<aside class="showrunner-sheet" aria-label="Showrunner"><div class="showrunner-head"><div><div class="kicker">75-minute session</div><strong>Showrunner</strong></div><button type="button" class="showrunner-close" aria-label="Close Showrunner">×</button></div><div class="showrunner-list" id="showrunner-list"></div></aside>';
  document.body.appendChild(drawer);

  const list=drawer.querySelector('#showrunner-list');
  const close=drawer.querySelector('.showrunner-close');
  function open(){drawer.classList.add('open');toggle.setAttribute('aria-expanded','true');close.focus()}
  function shut(){drawer.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus()}
  function ready(){return typeof session!=='undefined'&&Array.isArray(session.steps)&&session.steps.length>0}
  function render(){
    if(!ready())return;
    const active=(typeof snapshot!=='undefined'&&snapshot.state)?snapshot.state.step||0:0;
    list.innerHTML=session.steps.map((s,i)=>`<button type="button" data-step="${i}" class="${i===active?'active':''}"><span class="sr-time">${elapsed(i)}–${elapsed(i)+s.minutes}</span><span><span class="sr-label">${esc(s.label)}</span><span class="sr-title">${esc(s.title)}</span></span></button>`).join('');
  }
  toggle.addEventListener('click',()=>{render();open()});
  close.addEventListener('click',shut);
  drawer.addEventListener('click',e=>{if(e.target===drawer)shut();const b=e.target.closest('[data-step]');if(b){go(Number(b.dataset.step));shut()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))shut()});

  const rail=document.getElementById('rail');
  if(rail)new MutationObserver(render).observe(rail,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  const tryRender=()=>{render();if(!ready())setTimeout(tryRender,120)};
  tryRender();
})();