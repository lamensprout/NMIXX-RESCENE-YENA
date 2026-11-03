(() => {
 const toggle=document.getElementById("rankAlertToggle"),panel=document.getElementById("rankAlertPanel"),badge=document.getElementById("rankAlertBadge"),list=document.getElementById("rankAlertList");
 if(!toggle||!panel||!badge||!list)return;
 let opened=false;
 const close=()=>{panel.hidden=true;toggle.setAttribute("aria-expanded","false");};
 const normalizeArtist=value=>String(value||"").toLowerCase().replace(/\\s+/g,"").replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g,"");
 const artistAliases=[
  ["NMIXX","엔믹스","믹스"],
  ["RESCENE","RESCENE (리센느)","리센느","리센"],
  ["YENA","YENA (최예나)","최예나","예나"],
  ["i-dle","아이들","(여자)아이들","여자아이들","(G)I-DLE","GIDLE","G-I-DLE"]
 ];
 const sameArtist=(a,b)=>{
  const na=normalizeArtist(a),nb=normalizeArtist(b);
  if(!na||!nb)return false;
  if(na===nb)return true;
  return artistAliases.some(group=>{
   const forms=group.map(normalizeArtist);
   return forms.includes(na)&&forms.includes(nb);
  });
 };
 const render=async()=>{
  if(!window.MonitorStore||!MonitorStore.isReady()){badge.hidden=true;list.innerHTML='<p class="rank-alert-empty">로그인하면 알림을 확인할 수 있어요.</p>';return;}
  const [rows,favorites]=await Promise.all([
   MonitorStore.getRankAlertNotifications(100),
   MonitorStore.getFavorites()
  ]);
  const favoriteNames=Array.isArray(favorites)?favorites:[];
  const filteredRows=rows.filter(row=>favoriteNames.some(name=>sameArtist(row.artist_name,name)));
  badge.hidden=!filteredRows.some(row=>!row.read_at);
  list.innerHTML="";
  if(!filteredRows.length){list.innerHTML='<p class="rank-alert-empty">좋아하는 아티스트의 순위 변동 알림이 없어요.</p>';return;}
  const rankedRows=[...filteredRows].sort((a,b)=>Number(a.new_rank)-Number(b.new_rank));
  const top=rankedRows[0];
  const item=document.createElement("p");item.className="rank-alert-item"+(filteredRows.some(row=>!row.read_at)?" unread":"");
  const message=document.createElement("strong");
  message.textContent=top.artist_name+" · "+top.song_title+(filteredRows.length>1?" 외 "+(filteredRows.length-1)+"곡":"")+"의 순위 변동이 감지되었습니다.";
  item.appendChild(message);list.appendChild(item);
  const unreadIds=filteredRows.filter(row=>!row.read_at).map(row=>row.id);
  if(unreadIds.length)await MonitorStore.markRankAlertNotificationsRead(unreadIds);
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