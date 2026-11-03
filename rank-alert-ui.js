(() => {
 const toggle=document.getElementById("rankAlertToggle"),panel=document.getElementById("rankAlertPanel"),badge=document.getElementById("rankAlertBadge"),list=document.getElementById("rankAlertList");
 if(!toggle||!panel||!badge||!list)return;
 let opened=false;
 const close=()=>{panel.hidden=true;toggle.setAttribute("aria-expanded","false");};
 const render=async()=>{
  if(!window.MonitorStore||!MonitorStore.isReady()){badge.hidden=true;list.innerHTML='<p class="rank-alert-empty">로그인하면 알림을 확인할 수 있어요.</p>';return;}
  const rows=await MonitorStore.getRankAlertNotifications(30);
  badge.hidden=!rows.some(row=>!row.read_at);
  list.innerHTML="";
  if(!rows.length){list.innerHTML='<p class="rank-alert-empty">아직 도착한 알림이 없어요.</p>';return;}
  const rankedRows=[...rows].sort((a,b)=>Number(a.new_rank)-Number(b.new_rank));
  const top=rankedRows[0];
  const item=document.createElement("p");item.className="rank-alert-item"+(rows.some(row=>!row.read_at)?" unread":"");
  const message=document.createElement("strong");
  message.textContent=top.artist_name+" · "+top.song_title+(rows.length>1?" 외 "+(rows.length-1)+"곡":"")+"의 순위 변동이 감지되었습니다.";
  item.appendChild(message);list.appendChild(item);
  await MonitorStore.markRankAlertNotificationsRead();
  badge.hidden=true;
 };
 toggle.addEventListener("click",async()=>{
  opened=panel.hidden;panel.hidden=!opened;toggle.setAttribute("aria-expanded",String(opened));
  if(opened)await render();
 });
 document.addEventListener("click",event=>{if(!panel.hidden&&!event.target.closest(".rank-alert-menu"))close();});
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!panel.hidden)close();});
 window.addEventListener("melonitor-auth-change",render);
 window.addEventListener("melonitor-profile-ready",render);
 setInterval(()=>{if(document.visibilityState==="visible")render();},60000);
 if(window.MonitorStore){MonitorStore.init().then(render).catch(()=>{});}
})();