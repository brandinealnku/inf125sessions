(()=>{
  const app=document.getElementById('app');
  if(!app)return;

  function enhance(){
    const name=document.getElementById('nameInput');
    if(name){
      name.setAttribute('aria-label','First name or nickname');
      name.setAttribute('autocomplete','name');
    }

    const response=document.getElementById('responseInput');
    if(response)response.setAttribute('aria-label','Your response');

    const error=document.getElementById('error');
    if(error){
      error.setAttribute('role','alert');
      error.setAttribute('aria-live','assertive');
      error.setAttribute('aria-atomic','true');
    }

    for(const button of app.querySelectorAll('button')){
      if(!button.hasAttribute('type'))button.setAttribute('type','button');
    }

    const commit=document.getElementById('commitBtn');
    if(commit){
      const hint=app.querySelector('.hint');
      if(hint&&!hint.id)hint.id='selectionHint';
      for(const choice of app.querySelectorAll('.choice')){
        choice.setAttribute('aria-pressed',String(choice.classList.contains('selected')));
        if(hint)choice.setAttribute('aria-describedby',hint.id);
        if(!choice.dataset.a11yStateSync){
          choice.dataset.a11yStateSync='1';
          choice.addEventListener('click',()=>requestAnimationFrame(()=>{
            choice.setAttribute('aria-pressed',String(choice.classList.contains('selected')));
          }));
        }
      }
    }

    const locked=app.querySelector('.lock');
    if(locked){
      locked.setAttribute('role','status');
      locked.setAttribute('aria-label','Response submitted');
    }
  }

  enhance();
  new MutationObserver(enhance).observe(app,{childList:true,subtree:true});
})();
