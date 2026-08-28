// Keep the instructor cockpit visually stable while live data polls in the background.
// Structural changes still use the normal renderer; polling only mutates small live values.
(function(){
  window.liveBits=function(){
    status();
    const r=responseCount();
    const p=snapshot.participantCount?Math.round(r/snapshot.participantCount*100):0;
    const m=changed();
    [['mr',r],['mp',p+'%'],['mc',m.c]].forEach(([id,v])=>{
      const e=document.getElementById(id);
      if(e&&e.textContent!==String(v))e.textContent=v;
    });
  };
})();