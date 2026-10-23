(()=>{const C=window.Classroom;let pc=null,stream=null,watch=null,nonce=null;
const bar=document.createElement('div');bar.id='demoControls';bar.style.cssText='position:fixed;right:16px;top:58px;z-index:100;background:#10192d;border:1px solid #89a1c2;padding:10px;border-radius:12px;color:#fff;display:flex;align-items:center;gap:8px';
bar.innerHTML='<button id="demoStart" type="button">🖥 Share Screen to Projector</button><button id="demoStop" type="button" disabled>Stop Sharing</button><span id="demoStatus" role="status" style="font:12px sans-serif">Slides showing</span>';
document.body.appendChild(bar);
const status=t=>document.getElementById('demoStatus').textContent=t;
const waitIce=p=>new Promise(resolve=>{if(p.iceGatheringState==='complete')return resolve();const done=()=>{if(p.iceGatheringState==='complete'){p.removeEventListener('icegatheringstatechange',done);resolve()}};p.addEventListener('icegatheringstatechange',done);setTimeout(resolve,9000)});
async function stop(){clearInterval(watch);watch=null;stream?.getTracks().forEach(t=>t.stop());stream=null;pc?.close();pc=null;document.getElementById('demoStart').disabled=false;document.getElementById('demoStop').disabled=true;status('Slides showing');try{await C.api('/demo-signal',{method:'POST',body:JSON.stringify({action:'stop'})})}catch(e){status('Stopped locally; server clear failed')}}
document.getElementById('demoStop').onclick=stop;
document.getElementById('demoStart').onclick=async()=>{try{
  document.getElementById('demoStart').disabled=true;status('Choose a screen or browser tab…');
  stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:15},audio:false});
  stream.getVideoTracks()[0].addEventListener('ended',stop,{once:true});
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
  stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  nonce=crypto.randomUUID();await pc.setLocalDescription(await pc.createOffer());await waitIce(pc);
  await C.api('/demo-signal',{method:'POST',body:JSON.stringify({action:'offer',nonce,sdp:pc.localDescription})});
  document.getElementById('demoStop').disabled=false;status('Waiting for projector…');
  watch=setInterval(async()=>{try{const d=(await C.api('/demo-signal')).demo;if(d?.nonce===nonce&&d.answer&&pc&&!pc.currentRemoteDescription){await pc.setRemoteDescription(d.answer);status('Screen is live on projector')}}catch(e){status('Connection issue: '+String(e.message||e).slice(0,60))}},1300);
}catch(e){status('Could not share: '+String(e.message||e).slice(0,100));await stop()}};
})();