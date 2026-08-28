// Prevent live snapshot polling from rebuilding the instructor cockpit.
// Only mutate the small live fields that actually change between structural events.
(function(){
  window.liveBits=function(){
    status();
    const s=current();
    const r=responseCount();
    const p=snapshot.participantCount?Math.round(r/snapshot.participantCount*100):0;
    const m=changed();
    [['mr',r],['mp',p+'%'],['mc',m.c]].forEach(([id,v])=>{
      const e=document.getElementById(id);
      if(e&&e.textContent!==String(v))e.textContent=v;
    });

    // Update Live Read / Next Best Move text in place rather than replacing #main.
    const lr=liveRead(s);
    const readLabel=document.getElementById('live-read-label');
    const readText=document.getElementById('live-read-text');
    const moveText=document.getElementById('next-best-move');
    if(readLabel)readLabel.textContent='LIVE READ · '+lr.label;
    if(readText)readText.textContent=lr.text;
    if(moveText)moveText.textContent=lr.move;

    // Update response bars in place.
    if(s.key&&s.choices){
      const {rows,out}=agg(s.key),total=rows.length;
      s.choices.forEach((c,i)=>{
        const n=out[c]||0,pct=total?Math.round(n/total*100):0;
        const pctEl=document.getElementById('pulse-pct-'+i);
        const barEl=document.getElementById('pulse-bar-'+i);
        if(pctEl)pctEl.textContent=pct+'%';
        if(barEl)barEl.style.width=pct+'%';
      });
    }

    // Room-memory numbers can change, but the sidebar itself stays mounted.
    const memory=document.getElementById('room-memory-text');
    if(memory){
      const open=agg('predict_me_open');
      let text='Opening vote not yet populated.';
      if(open.rows.length){
        const prove=open.out['PROVE IT — an app could predict me pretty well']||0;
        const no=open.out['NO CHANCE — it would get important things about me wrong']||0;
        const total=open.rows.length;
        text=`Opening prediction: ${Math.round(prove/total*100)}% PROVE IT · ${Math.round(no/total*100)}% NO CHANCE.`;
      }
      memory.textContent=text;
    }
  };
})();