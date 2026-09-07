(()=>{
  function enhanceMedia(){
    const C=window.Classroom;
    const room=document.getElementById('room');
    const x=C&&C.current?C.current():null;
    if(!C||!room||!x||!x.mediaUrl||x.mediaFit!=='contain') return;
    if(C.snapshot&&C.snapshot.state&&C.snapshot.state.resultsVisible) return;
    const stage=room.querySelector('.stage');
    if(!stage||stage.dataset.mediaMode==='foreground') return;
    stage.dataset.mediaMode='foreground';
    stage.classList.add('sr-media-stage');
    const bg=stage.querySelector('.bg'); if(bg) bg.remove();
    const veil=stage.querySelector('.veil'); if(veil) veil.remove();
    const content=stage.querySelector('.content'); if(!content) return;
    const image=document.createElement('img');
    image.className='sr-learning-media';
    image.src=x.mediaUrl;
    image.alt=x.title||'Instructional visual';
    content.innerHTML='';
    content.classList.add('sr-media-content');
    const frame=document.createElement('div');
    frame.className='sr-media-frame';
    frame.appendChild(image);
    content.appendChild(frame);
    if(x.key){
      const status=document.createElement('div');
      status.className='sr-media-status';
      const count=C.participation?C.participation().count:0;
      status.textContent=count+' committed · results stay hidden.';
      content.appendChild(status);
    }
  }
  let last='';
  setInterval(()=>{
    const C=window.Classroom;
    const x=C&&C.current?C.current():null;
    const state=C&&C.snapshot?C.snapshot.state:null;
    const count=C&&C.participation?C.participation().count:0;
    const sig=[x&&x.key,x&&x.mediaUrl,x&&x.mediaFit,state&&state.resultsVisible,count].join('|');
    if(sig!==last){last=sig;setTimeout(enhanceMedia,0);}
  },220);
  setTimeout(enhanceMedia,700);
})();