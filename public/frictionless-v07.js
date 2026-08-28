(function(){
  const studentMode=typeof instructor!=='undefined'&&!instructor&&!display;
  const roomMode=typeof display!=='undefined'&&display;
  const originalActivity=window.activityContent;
  if(typeof originalActivity!=='function')return;
  function simplifyStudent(){
    const s=session.steps[Math.max(0,Math.min(session.steps.length-1,snapshot.state.step))];
    const answered=s.key&&localAnswers[s.key]!==undefined;
    if(answered&&['vote','prompt','build'].includes(s.type)){
      return `<div class="v07-look"><div class="v07-mark">✓</div><div class="v07-look-title">Locked in.</div><div class="v07-look-sub">Look up.</div></div>`;
    }
    let h=`<div class="v07-stage"><div class="v07-question">${esc(s.title)}</div>${s.lead?`<div class="v07-lead">${esc(s.lead)}</div>`:''}`;
    if(s.type==='vote')h+=`<div class="v07-choices">${s.choices.map(c=>`<button ${snapshot.state.locked?'disabled':''} class="v07-choice ${localAnswers[s.key]===c?'selected':''}" onclick='answer(${JSON.stringify(s.key)},${JSON.stringify(c)})'>${esc(c)}</button>`).join('')}</div>`;
    else if(s.type==='prompt')h+=`<textarea id="prompt" class="v07-input" ${snapshot.state.locked?'disabled':''} placeholder="${esc(s.placeholder||'Type your response…')}">${esc(localAnswers[s.key]||'')}</textarea><button class="v07-send" ${snapshot.state.locked?'disabled':''} onclick="answer(${JSON.stringify(s.key)},document.getElementById('prompt').value.trim())">Commit response</button>`;
    else if(s.type==='build')h+=build(s);
    else h+=`<div class="v07-look-sub">Look up.</div>`;
    return h+'</div>';
  }
  function roomMoment(){
    const s=session.steps[Math.max(0,Math.min(session.steps.length-1,snapshot.state.step))];
    if(s.type==='compare'){
      const m=changedMinds();
      return `<div class="v07-room"><div class="v07-room-kicker">SHIFT</div><div class="v07-room-number">${m.changed}</div><div class="v07-room-copy">people changed their minds.</div><div class="v07-room-note">The algorithm didn't change. The information did.</div></div>`;
    }
    if(snapshot.state.spotlight){
      const text=typeof snapshot.state.spotlight.response==='string'?snapshot.state.spotlight.response:JSON.stringify(snapshot.state.spotlight.response);
      return `<div class="v07-room"><div class="v07-room-kicker">FROM THE ROOM</div><div class="v07-room-quote">“${esc(text)}”</div></div>`;
    }
    if(snapshot.state.resultsVisible&&s.choices)return `<div class="v07-room"><div class="v07-room-kicker">REVEAL</div><div class="v07-room-title">${esc(s.title)}</div>${bars(s.key,s.choices)}</div>`;
    return `<div class="v07-room"><div class="v07-room-kicker">${esc(s.label||'NOW')}</div><div class="v07-room-title">${esc(s.title)}</div>${s.lead?`<div class="v07-room-note">${esc(s.lead)}</div>`:''}</div>`;
  }
  window.activityContent=function(){if(studentMode)return simplifyStudent();if(roomMode)return roomMoment();return originalActivity()};
  const css=document.createElement('style');css.textContent=`
  body:not(.display){background:#f4f1e8;color:#151515}.v07-stage{max-width:760px;margin:8vh auto 0;padding:0 18px}.v07-question{font-family:Georgia,"Times New Roman",serif;font-size:clamp(42px,9vw,76px);line-height:.98;letter-spacing:-.04em}.v07-lead{font-size:18px;line-height:1.55;color:#625f57;margin:24px 0 34px;max-width:650px}.v07-choices{display:grid;gap:12px}.v07-choice,.v07-send{width:100%;text-align:left;border:1px solid #bdb8ad;background:transparent;color:#151515;padding:22px;border-radius:3px;font-size:20px;font-weight:700}.v07-choice.selected,.v07-send{background:#151515;color:#f4f1e8;border-color:#151515}.v07-input{background:#fff;color:#151515;border:1px solid #bdb8ad;border-radius:3px;min-height:160px;font-size:18px}.v07-send{text-align:center;margin-top:10px}.v07-look{height:72vh;display:grid;place-content:center;text-align:center}.v07-mark{font-size:34px}.v07-look-title{font-family:Georgia,"Times New Roman",serif;font-size:48px;margin-top:10px}.v07-look-sub{font-size:22px;color:#6c685f;margin-top:8px}.status,.sceneTag{display:none!important}.wrap{max-width:none!important;padding-top:20px!important}.display{background:#10100f!important}.display .wrap{padding:8vh 7vw!important}.v07-room{min-height:78vh;display:flex;flex-direction:column;justify-content:center}.v07-room-kicker{font-size:13px;letter-spacing:.2em;color:#d4aa44;margin-bottom:24px}.v07-room-title{font-family:Georgia,"Times New Roman",serif;font-size:clamp(64px,9vw,140px);line-height:.9;letter-spacing:-.05em;max-width:1300px}.v07-room-number{font-family:Georgia,"Times New Roman",serif;font-size:clamp(140px,22vw,320px);line-height:.75}.v07-room-copy{font-size:clamp(30px,4vw,64px);margin-top:25px}.v07-room-note{font-size:clamp(24px,2.6vw,42px);line-height:1.35;color:#c8c4b9;max-width:1100px;margin-top:28px}.v07-room-quote{font-family:Georgia,"Times New Roman",serif;font-size:clamp(48px,7vw,110px);line-height:1.08;max-width:1300px}.display .panel{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}.display .metricGrid{display:none!important}.display .barRow{margin:28px 0}.display .barLabel{font-size:clamp(20px,2vw,32px)}.display .bar{height:10px;background:#2b2a27}.display .bar span{background:#e0b64d}
  `;document.head.appendChild(css);
  setTimeout(()=>render(),0);
})();