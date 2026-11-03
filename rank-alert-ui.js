(() => {
 const toggle=document.getElementById("rankAlertToggle"),panel=document.getElementById("rankAlertPanel"),badge=document.getElementById("rankAlertBadge"),list=document.getElementById("rankAlertList");
 if(!toggle||!panel||!badge||!list)return;
 let opened=false;
 const close=()=>{panel.hidden=true;toggle.setAttribute("aria-expanded","false");};
 const formatAlertTimestamp=value=>{
  const date=new Date(value);
  if(!value||Number.isNaN(date.getTime()))return "";
  const parts=new Intl.DateTimeFormat("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:true}).formatToParts(date);
  const part=type=>parts.find(item=>item.type===type)?.value||"";
  return part("year")+". "+part("month")+". "+part("day")+" "+part("dayPeriod")+" "+part("hour")+":"+part("minute");
 };
 const normalizeArtist=value=>String(value||"").toLowerCase().replace(/\s+/g,"").replace(/[^0-9a-z가-힣ㄱ-ㅎ]/g,"");
 const artistAliases=[
  ["NMIXX","엔믹스"],
  ["RESCENE","RESCENE (리센느)","리센느"],
  ["YENA","YENA (최예나)","최예나"],
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
  const [rows,favorites,settings]=await Promise.all([
   MonitorStore.getRankAlertNotifications(100),
   MonitorStore.getFavorites(),
   MonitorStore.getRankAlertSettings()
  ]);
  const favoriteNames=Array.isArray(favorites)?favorites:[];
  // 순위가 실제로 바뀐 알림만 집계합니다. TOP100에 있다는 사실만으로는 알림 곡에 포함하지 않습니다.
  const threshold=Math.max(1,Math.min(100,Math.floor(Number(settings&&settings.threshold)||1)));
  const notifyRises=!!(settings&&settings.notify_rises!==false);
  const notifyFalls=!!(settings&&settings.notify_falls!==false);
  const changedRows=rows.filter(row=>{
   const oldRank=Number(row.old_rank),newRank=Number(row.new_rank);
   // Rank difference is authoritative; unchanged ranks never qualify.
   if(!Number.isInteger(oldRank)||!Number.isInteger(newRank)||
      oldRank<1||oldRank>100||newRank<1||newRank>100||oldRank===newRank)return false;
   const movement=oldRank-newRank;
   return Math.abs(movement)>=threshold&&(movement>0?notifyRises:notifyFalls);
  });
  // 알림은 현재 즐겨찾기에 속한 아티스트의 순위 변동만 대상으로 합니다.
  const favoriteRows=changedRows.filter(row=>favoriteNames.some(name=>sameArtist(row.artist_name,name)));
  // 별칭으로 저장된 아티스트 이름도 같은 곡으로 취급해 중복 집계를 막습니다.
  const canonicalArtist=value=>{
   const normalized=normalizeArtist(value);
   const group=artistAliases.find(items=>items.map(normalizeArtist).includes(normalized));
   return group?normalizeArtist(group[0]):normalized;
  };
  // 실제 순위 변동 곡만 남긴 뒤, 같은 곡은 최신 변동 한 건으로 집계합니다.
  const latestByTrack=new Map();
  favoriteRows.forEach(row=>{
   const key=canonicalArtist(row.artist_name)+"\\u0000"+String(row.song_title||"").trim().toLowerCase();
   const previous=latestByTrack.get(key);
   const currentTime=Date.parse(row.created_at)||0,previousTime=previous?(Date.parse(previous.created_at)||0):-1;
   if(!previous||currentTime>previousTime)latestByTrack.set(key,row);
  });
  const filteredRows=[...latestByTrack.values()];
  // 알림 배지, 요약 개수, 읽음 처리 모두 같은 필터 결과를 사용합니다.
  badge.hidden=!filteredRows.some(row=>!row.read_at);
  list.innerHTML="";
  if(!filteredRows.length){list.innerHTML='<p class="rank-alert-empty">좋아하는 아티스트의 순위 변동 알림이 없어요.</p>';return;}
  const rankedRows=[...filteredRows].sort((a,b)=>Number(a.new_rank)-Number(b.new_rank));
  const top=rankedRows[0];
  const latestAlert=[...filteredRows].sort((a,b)=>(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0))[0];
  const item=document.createElement("p");item.className="rank-alert-item"+(filteredRows.some(row=>!row.read_at)?" unread":"");
  const line=document.createElement("span");line.className="rank-alert-line";
  const message=document.createElement("strong");
  message.textContent=top.artist_name+" · "+top.song_title+(filteredRows.length>1?" 외 "+(filteredRows.length-1)+"곡":"")+"의 순위 변동이 감지되었습니다.";
  const timestamp=document.createElement("time");timestamp.className="rank-alert-time";
  timestamp.dateTime=latestAlert.created_at||"";
  timestamp.textContent=formatAlertTimestamp(latestAlert.created_at);
  line.append(message,timestamp);item.appendChild(line);list.appendChild(item);
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