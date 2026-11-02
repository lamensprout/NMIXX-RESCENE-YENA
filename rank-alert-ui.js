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
  rows.forEach(row=>{
   const item=document.createElement("div");item.className="rank-alert-item"+(!row.read_at?" unread":"");
   const movement=Number(row.rank_change), verb=movement>0?"상승":"하락";
   const title=document.createElement("strong");title.textContent=row.artist_name+" · "+row.song_title;
   const detail=document.createElement("div");detail.textContent="#"+row.old_rank+" → #"+row.new_rank+" ("+Math.abs(movement)+"계단 "+verb+")";
   const time=document.createElement("small");time.textContent=new Date(row.created_at).toLocaleString("ko-KR");
   item.append(title,detail,time);list.appendChild(item);
  });
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