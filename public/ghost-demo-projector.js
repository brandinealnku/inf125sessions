(()=>{const C=window.Classroom;let pc=null,nonce=null,busy=false,frameReady=false,connectionStarted=0;const holder=document.createElement('div');holder.id='demoViewer';holder.style.cssText='display:none;position:fixed;inset:0;z-index:100;background:#000;align-items:center;justify-content:center';
holder.innerHTML='<video id="demoVideo" autoplay playsinline muted style="height:100%;width:100%;object-fit:contain"></video><div id="demoViewerStatus" role="status" style="position:absolute;bottom:8px;left:10px;background:#171b2b;color:#fff;padding:6px;font-size:12px">Connecting screen share…</div>';document.body.appendChild(holder);
const waitIce=p=>new Promise(resolve=>{if(p.iceGatheringState==='complete')return resolve();const f=()=>{if(p.iceGatheringState==='complete'){p.removeEventListener('icegatheringstatechange',f);resolve()}};p.addEventListener('icegatheringstatechange',f);setTimeout(resolve,9000)});
async function check(){if(busy)return;busy=true;try{const d=(await C.api('/demo-signal')).demo;
if(!d?.active){if(pc){pc.close();pc=null}nonce=null;frameReady=false;holder.style.display='none';return}
if(d.nonce===nonce){if(!frameReady&&connectionStarted&&Date.now()-connectionStarted>12000){document.getElementById('demoViewerStatus').textContent='Live video unavailable — check browser/network connection';holder.style.display='none';}return;}
if(pc)pc.close();nonce=d.nonce;frameReady=false;connectionStarted=Date.now();holder.style.display='none';document.getElementById('demoViewerStatus').textContent='Connecting screen share…';
pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
pc.ontrack=e=>{const v=document.getElementById('demoVideo');v.srcObject=e.streams[0]||new MediaStream([e.track]);v.play().catch(()=>{});};
const video=document.getElementById('demoVideo');video.addEventListener('playing',()=>{if(video.videoWidth>0){frameReady=true;holder.style.display='flex';document.getElementById('demoViewerStatus').textContent='LIVE DEMO'}},{once:true});
pc.onconnectionstatechange=()=>{if(pc?.connectionState==='failed'||pc?.connectionState==='disconnected'){frameReady=false;holder.style.display='none';document.getElementById('demoViewerStatus').textContent='Stream disconnected — slides restored'}};
await pc.setRemoteDescription(d.offer);await pc.setLocalDescription(await pc.createAnswer());await waitIce(pc);
await C.api('/demo-signal',{method:'POST',body:JSON.stringify({action:'answer',nonce:d.nonce,sdp:pc.localDescription})});
}catch(e){document.getElementById('demoViewerStatus').textContent='Demo connection failed: '+String(e.message||e).slice(0,70)}finally{busy=false}}
setInterval(check,1600);setTimeout(check,900);
})();