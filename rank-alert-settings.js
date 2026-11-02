(() => {
  const enabled=document.getElementById("rankAlertEnabled");
  const options=document.getElementById("rankAlertOptions");
  const threshold=document.getElementById("rankAlertThreshold");
  const rises=document.getElementById("rankAlertRises");
  const falls=document.getElementById("rankAlertFalls");
  const save=document.getElementById("saveRankAlertSettings");
  const status=document.getElementById("rankAlertSettingsStatus");
  if(!enabled||!save||!window.MonitorStore)return;
  const render=()=>{options.hidden=!enabled.checked;};
  enabled.addEventListener("change",render);
  (async()=>{
    await MonitorStore.init();
    if(!MonitorStore.isReady()){status.textContent="로그인 후 알림 설정을 이용할 수 있어요.";save.disabled=true;return;}
    const value=await MonitorStore.getRankAlertSettings();
    if(value){enabled.checked=!!value.enabled;threshold.value=String(value.threshold||1);rises.checked=value.notify_rises!==false;falls.checked=value.notify_falls!==false;}
    render();
  })();
  save.addEventListener("click",async()=>{
    const amount=Number(threshold.value);
    if(!Number.isInteger(amount)||amount<1||amount>100){status.textContent="알림 기준은 1~100 사이의 정수로 입력해 주세요.";return;}
    if(!rises.checked&&!falls.checked){status.textContent="상승 또는 하락을 하나 이상 선택해 주세요.";return;}
    save.disabled=true;status.textContent="설정을 저장하고 있어요.";
    const result=await MonitorStore.saveRankAlertSettings({enabled:enabled.checked,threshold:amount,notify_rises:rises.checked,notify_falls:falls.checked});
    status.textContent=result.ok?"순위 변동 알림 설정을 저장했어요.":(result.error?.message||"설정을 저장하지 못했어요.");
    save.disabled=false;
  });
})();