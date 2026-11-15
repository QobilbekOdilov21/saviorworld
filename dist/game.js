import { ART } from './asset-manifest.js?v=0.2';
import { Fight, ROSTER, character } from './combat.js?v=0.2';
import { AssetBank, Renderer } from './renderer-v2.js?v=0.2';
import { FRAMES } from './frame-manifest.js?v=0.2';
import { UI } from './ui-manifest.js?v=0.2';
import { AudioDirector } from './audio.js?v=0.2';

const $=id=>document.getElementById(id);
const defaults={music:.42,effects:.65,muted:false,shake:true,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:'balanced',difficulty:'normal',track:'auto',interpolation:true};
let stored={};try{stored=JSON.parse(localStorage.getItem('wos.settings.v1')||'{}');}catch{}
const settings={...defaults,...stored};
for(const k of ['music','effects'])settings[k]=Number.isFinite(settings[k])?Math.max(0,Math.min(1,settings[k])):defaults[k];
if(!['easy','normal','hard'].includes(settings.difficulty))settings.difficulty='normal';
function saveSettings(){try{localStorage.setItem('wos.settings.v1',JSON.stringify(settings));}catch{}}
const assets=new AssetBank(),renderer=new Renderer($('scene'),assets,settings),audio=new AudioDirector(settings);
let screen='menu',mode='versus',p1='savior',p2='ignis',stage=0,selectSide=0,fight=null,ready=false;
let arcadeRoute=[],arcadeIndex=0,arcadeStageStart=0,modalKind=null,lastFocus=null;
let toastTimer=0,unavailableTimer=0,lastAnnouncer='',lastResult=null,lastUi=0,gamepadPrevious=[],clashTime=0;
const viewer={id:'savior',clip:'idle',time:0,playing:true,frame:0,kind:'animation'};
const held=new Set(),touchHeld=new Set();
const modes={versus:'1P VS AI',local:'MAHALLIY DUEL · 2P',arcade:'NAJOTKORLAR MINORASI',training:'MASHQ MAYDONI'};
const actionKeys=[{KeyJ:'light',KeyK:'heavy',KeyL:'special',KeyI:'grab',KeyU:'xray',KeyO:'ultimate',KeyW:'jump',KeyF:'fatality'},
  {Digit1:'light',Numpad1:'light',Digit2:'heavy',Numpad2:'heavy',Digit3:'special',Numpad3:'special',Digit5:'grab',Numpad5:'grab',Digit4:'xray',Numpad4:'xray',ArrowUp:'jump',Digit6:'fatality',Numpad6:'fatality',Digit7:'ultimate',Numpad7:'ultimate'}];
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
function clearInput(){held.clear();touchHeld.clear();document.querySelectorAll('.touch-controls .pressed').forEach(x=>x.classList.remove('pressed'));if(fight)fight.pending=[[],[]];}
function go(next){screen=next;$('app').dataset.screen=next;for(const s of ['menu','select','game','viewer','clash']){const el=$(s+'Screen');if(el)el.hidden=s!==next;}clearInput();renderer.particles=[];renderer.fx=[];lastResult=null;lastAnnouncer='';}
function goMenu(){fight=null;closeModal(false);go('menu');audio.track(1);$('homeButton').focus({preventScroll:true});}

function setSelection(){
  for(const side of [0,1]){
    const c=character(side?p2:p1),el=$(side?'p2Info':'p1Info');el.querySelector('h3').textContent=c.name;el.querySelector('h3').style.color=c.color;el.querySelector('p').textContent=c.title;el.querySelector('small').textContent=`${c.element}  /  ${c.style}`;
    el.querySelector('.player-label').textContent=side?(mode==='local'?'02 — IKKINCHI O‘YINCHI':'02 — RAQIB'):'01 — SIZNING JANGCHINGIZ';
  }
  $('modeLabel').textContent=modes[mode];
  $('selectInstruction').textContent=selectSide===0?'1-O‘YINCHI UCHUN PERSONAJ TANLANG':mode==='local'?'2-O‘YINCHI UCHUN PERSONAJ TANLANG':'RAQIB PERSONAJINI TANLANG';
  $('switchSide').textContent=selectSide===0?'RAQIBNI TANLASH ⇄':'1-O‘YINCHINI TANLASH ⇄';
  document.querySelectorAll('.roster-card').forEach((el,i)=>{
    const id=ROSTER[i].id;el.classList.toggle('selected-p1',id===p1);el.classList.toggle('selected-p2',id===p2);el.setAttribute('aria-pressed',String(id===(selectSide?p2:p1)));
    el.querySelector('.fighter-slot').textContent=id===p1&&id===p2?'P1 / P2':id===p1?'P1':id===p2?'P2':`0${i+1}`;
  });
  document.querySelectorAll('.stage-card').forEach((el,i)=>{el.classList.toggle('selected',i===stage);el.setAttribute('aria-pressed',String(i===stage));});
  $('stageName').textContent=ART.stages[stage].nameUz.toUpperCase();
  $('selectionHint').textContent=mode==='training'?'Cheksiz energiya. R — holatni tiklash.':mode==='arcade'?'To‘rt raqibni yengib, minorani zabt eting.':'Ikki raundda g‘alaba qozoning. Olamni egallang.';
}
function openSelection(newMode=mode){mode=newMode;fight=null;closeModal(false);selectSide=0;go('select');setSelection();audio.track(1);}
$('roster').innerHTML=ROSTER.map((c,i)=>`<button class="roster-card" data-fighter="${c.id}" aria-label="${c.name}: ${c.title}"><img src="${UI.avatarCards[c.id]}" alt="" draggable="false"><span class="fighter-slot">0${i+1}</span><b>${c.name}</b><small>${c.element}</small></button>`).join('');
$('stageCards').innerHTML=ART.stages.map((s,i)=>`<button class="stage-card" data-stage="${i}" aria-label="${s.nameUz}"><img src="${UI.cards[i]}" alt="" draggable="false"><span>0${i+1} — ${s.nameUz.toUpperCase()}</span></button>`).join('');
document.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>{audio.sound('select');openSelection(el.dataset.mode);}));
$('roster').addEventListener('click',e=>{const button=e.target.closest('[data-fighter]');if(!button)return;if(selectSide===0)p1=button.dataset.fighter;else p2=button.dataset.fighter;audio.sound('select');setSelection();});
$('stageCards').addEventListener('click',e=>{const button=e.target.closest('[data-stage]');if(!button)return;stage=Number(button.dataset.stage);audio.sound('select');setSelection();});
$('switchSide').onclick=()=>{selectSide=1-selectSide;audio.sound('select');setSelection();};
$('backMenu').onclick=goMenu;
$('homeButton').onclick=()=>{if(screen==='game')openModal('pause');else goMenu();};
function startFight({continueArcade=false}={}){
  if(mode==='arcade'){
    if(!continueArcade){arcadeIndex=0;arcadeStageStart=stage;arcadeRoute=ROSTER.filter(c=>c.id!==p1).map(c=>c.id);if(arcadeRoute.includes(p2))arcadeRoute=[p2,...arcadeRoute.filter(x=>x!==p2)];}
    p2=arcadeRoute[arcadeIndex];stage=(arcadeStageStart+arcadeIndex)%ART.stages.length;
  }
  closeModal(false);fight=new Fight({p1,p2,mode,difficulty:settings.difficulty});if(mode==='training')fight.fighters.forEach(f=>f.meter=100);
  go('game');$('trainingStats').hidden=mode!=='training';$('matchResult').hidden=true;renderer.overlay=mode==='training'&&$('hitboxToggle')?.checked;
  $('p1Name').textContent=character(p1).name;$('p2Name').textContent=character(p2).name;$('p2Role').textContent=mode==='local'?'PLAYER 2':mode==='training'?'TRAINING DUMMY':mode==='arcade'?`CPU · ${arcadeIndex+1}/4`:'CPU';
  $('trainingGuard').textContent='Raqib himoyasi: O‘CHIQ';$('resultEyebrow').textContent='JANG YAKUNLANDI';audio.track(stage);lastAnnouncer='';lastResult=null;updateHUD();
  if(innerWidth<600&&innerHeight>innerWidth)toast('Kengroq jang maydoni uchun telefonni yonboshlating.');
}
$('beginFight').onclick=()=>startFight();
function perform(side,action){
  if(!fight||modalKind||screen!=='game')return;
  if(fight.phase==='intro'){if(action!=='fatality')fight.skipIntro();return;}
  if(fight.phase==='finish'){if(fight.winner===side&&action!=='jump')fight.finish(side);return;}
  if(fight.phase==='fight'&&action!=='fatality')fight.request(side,action);
}
function processEvents(){
  for(const event of fight.drainEvents()){
    renderer.effect(event);audio.sound(event.type==='hit'&&event.heavy?'heavy':event.type);
    if(event.type==='unavailable'&&event.side===0&&performance.now()>unavailableTimer){toast(event.reason==='meter'?'Energiya yetarli emas. Zarbalar bilan energiya to‘plang.':'X-ray uchun raqibga yaqinlashing.');unavailableTimer=performance.now()+2500;}
    if(event.type==='draw')toast('DURANG — RAUND QAYTA O‘YNALADI');
    if(event.type==='cinematicStart')clearInput();
  }
}
function updateHUD(){
  if(!fight)return;
  for(let i=0;i<2;i++){
    const f=fight.fighters[i];$('hp'+i).style.transform=`scaleX(${f.hp/1000})`;$('hpTrail'+i).style.transform=`scaleX(${f.hp/1000})`;
    $('meter'+i).style.transform=`scaleX(${f.meter/100})`;$('meterValue'+i).textContent=Math.floor(f.meter)+'%';$('meter'+i).closest('.energy-side').classList.toggle('ready',f.meter>=100);
    $('meterHint'+i).textContent=f.meter>=100?(i===0?'U · X-RAY TAYYOR':mode==='local'?'4 · X-RAY TAYYOR':'X-RAY TAYYOR'):(i===0?'U · X-RAY UCHUN 100%':'X-RAY UCHUN 100%');
    [...$('wins'+i).children].forEach((dot,n)=>dot.classList.toggle('won',n<f.wins));
    $('combo'+i).classList.toggle('visible',f.combo>=2&&f.comboClock>0&&fight.phase==='fight');$('combo'+i).querySelector('b').textContent=f.combo;
  }
  $('timer').textContent=mode==='training'?'∞':String(Math.ceil(fight.timer)).padStart(2,'0');$('roundLabel').textContent=mode==='training'?'TRAINING':`ROUND ${fight.round}`;
  $('trainingDamage').textContent=`Jami zarar: ${fight.damageTotal[0]}`;
  let announcement=['','',''];
  const t=fight.phaseTime;
  if(fight.phase==='intro'){const side=t<2.3?0:1,c=character(side?p2:p1);announcement=[c.name,c.title.toUpperCase(),'ENTER · KIRISH SAHNASIDAN O‘TISH'];}
  if(fight.phase==='announce')announcement=t<.95?[fight.round>=3?'FINAL ROUND':`ROUND ${fight.round}`,ART.stages[stage].name,''] : ['FIGHT','',''];
  if(fight.phase==='roundEnd')announcement=[fight.roundWinner===null?'DURANG':`${fight.fighters[fight.roundWinner].name} WINS`,'RAUND YAKUNLANDI',''];
  if(fight.phase==='finish')announcement=['YAKUNIY ZARBA',fight.fighters[fight.winner].name,`${fight.winner===0?'F':mode==='local'?'6':'CPU'} · FATALITY  /  ${Math.max(0,Math.ceil(6-t))}`];
  if(fight.phase==='cinematic'){const c=fight.cinematic;announcement=c.kind==='fatality'&&c.time>3.05?['FATALITY',fight.fighters[c.side].name,'']:c.time<.65?[c.kind==='xray'?'X-RAY':'FATALITY',fight.fighters[c.side].ultimate.toUpperCase(),'']:['','',''];}
  const key=announcement.join('|');if(key!==lastAnnouncer){$('announcer').querySelector('h2').textContent=announcement[0];$('announcer').querySelector('small').textContent=announcement[1];$('announcer').querySelector('p').textContent=announcement[2];lastAnnouncer=key;}
  let banner=null;
  if(fight.phase==='announce')banner=t<.95?(fight.round>=3?'final_round':fight.round===1?'round_1':'round_2'):'fight';
  if(fight.phase==='finish')banner='finish_him';
  if(fight.phase==='cinematic'&&fight.cinematic.kind==='fatality'&&fight.cinematic.time>3.05)banner='fatality';
  if(fight.phase==='roundEnd'&&fight.roundWinner!==null){const winner=fight.fighters[fight.roundWinner];banner=winner.hp===1000?'flawless_victory':winner.combo>=4?'brutality':'match_over';}
  const art=$('announcerArt');if(art){art.hidden=!banner;if(banner&&art.getAttribute('src')!==UI.banners[banner])art.src=UI.banners[banner];$('announcer').classList.toggle('has-art',!!banner);}
  if(fight.phase==='victory'&&lastResult!==fight){lastResult=fight;showResult();}
}
function showResult(){
  const winner=fight.fighters[fight.winner??0],completed=mode==='arcade'&&fight.winner===0&&arcadeIndex>=arcadeRoute.length-1;
  $('matchResult').hidden=false;$('resultTitle').textContent=completed?'OLAMLAR NAJOTKORI':`${winner.name} WINS`;
  $('resultSubtitle').textContent=completed?'To‘rt raqib mag‘lub. Minora zabt etildi.':mode==='arcade'&&fight.winner===0?`${arcadeIndex+1} / 4 raqib mag‘lub. Keyingi jang sizni kutmoqda.`:`${fight.fighters[0].wins} : ${fight.fighters[1].wins}  ·  ${ART.stages[stage].nameUz}`;
  $('rematchButton').textContent=mode==='arcade'&&fight.winner===0&&!completed?'KEYINGI RAQIB →':'YANA BIR JANG ↗';
  $('matchResult').style.backgroundImage=mode==='arcade'?`linear-gradient(90deg,#07101afa 35%,#07101a99),url('${UI.tower}')`:'';
  $('matchResult').style.backgroundSize='cover';
  if(fight.winner===0){try{const record=JSON.parse(localStorage.getItem('wos.records.v1')||'{"wins":0,"towers":0}');record.wins++;if(completed)record.towers++;localStorage.setItem('wos.records.v1',JSON.stringify(record));}catch{}}
  $('rematchButton').focus({preventScroll:true});
}
$('rematchButton').onclick=()=>{if(mode==='arcade'&&fight?.winner===0&&arcadeIndex<arcadeRoute.length-1){arcadeIndex++;startFight({continueArcade:true});}else startFight();};
$('rosterButton').onclick=()=>openSelection();$('resultMenu').onclick=goMenu;
$('resetTraining').onclick=()=>{fight?.resetTraining();clearInput();};
$('trainingGuard').onclick=()=>{if(!fight)return;fight.trainingGuard=!fight.trainingGuard;$('trainingGuard').textContent=`Raqib himoyasi: ${fight.trainingGuard?'YOQIQ':'O‘CHIQ'}`;};

function closeModal(resume=true){if(!modalKind)return;$('modal').hidden=true;modalKind=null;if(fight&&resume){fight.paused=false;audio.resume();}clearInput();lastFocus?.focus?.({preventScroll:true});}
function openModal(kind){
  if(!$('launch').hidden||!$('studioIntro').hidden)return;
  if(!modalKind)lastFocus=document.activeElement;modalKind=kind;$('modal').hidden=false;if(fight){fight.paused=true;clearInput();}
  $('modal').querySelector('.modal-card').classList.remove('gallery-wide');
  const body=$('modalBody');
  if(kind==='pause'){
    $('modalTitle').textContent='JANG TO‘XTATILDI';body.innerHTML='<div class="pause-actions"><button id="resumeFight" class="gold-button">JANGNI DAVOM ETTIRISH →</button><button id="pauseSettings" class="outline-button">SOZLAMALAR</button><button id="pauseControls" class="outline-button">BOSHQARUV</button><button id="pauseRoster" class="outline-button">PERSONAJ TANLASH</button><button id="pauseHome" class="text-button">BOSH MENYUGA QAYTISH</button></div>';
    $('resumeFight').onclick=()=>closeModal();$('pauseSettings').onclick=()=>openModal('settings');$('pauseControls').onclick=()=>openModal('help');$('pauseRoster').onclick=()=>openSelection();$('pauseHome').onclick=goMenu;
  }else if(kind==='help'){
    $('modalTitle').textContent='BOSHQARUV';body.innerHTML=`<table class="controls-table"><thead><tr><th>HARAKAT</th><th>1-O‘YINCHI</th><th>2-O‘YINCHI</th></tr></thead><tbody>${[
      ['Yurish','A / D','← / →'],['Sakrash / egilish','W / S','↑ / ↓'],['Yengil / og‘ir zarba','J / K','1 / 2'],['Maxsus hujum','L · 22% energiya','3'],['Himoya','SPACE','0'],['Ushlash / uloqtirish','I','5'],['X-ray','U · 100% energiya','4'],['Yakuniy kuch','O · 100% energiya','7'],['Fatality','F · yakuniy zarbada','6'],['Pauza / introdan o‘tish','ESC / ENTER','ESC / ENTER']
    ].map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="control-note">S + K — pastdan zarba. Past zarbani S + SPACE bilan qaytaring. Ushlash himoyani yorib o‘tadi. X-ray uchun raqibga yaqin boring.</p><p>Gamepad: chap stik — yurish · A — zarba · B — og‘ir · X — maxsus · Y — ushlash · LB — himoya · RB — X-ray · D-pad ↑ — sakrash · Start — pauza.</p><p>2-o‘yinchi uchun klaviaturaning yuqori raqamlari ham, NumPad ham ishlaydi. Telefonlarda ekrandagi tugmalardan foydalaning.</p>`;
  }else if(kind==='settings'){
    $('modalTitle').textContent='SOZLAMALAR';body.innerHTML=`
      <div class="setting-row"><label for="musicVolume">Musiqa balandligi</label><input id="musicVolume" type="range" min="0" max="1" step=".01" value="${settings.music}"></div>
      <div class="setting-row"><label for="effectsVolume">Effektlar balandligi</label><input id="effectsVolume" type="range" min="0" max="1" step=".01" value="${settings.effects}"></div>
      <div class="setting-row"><label for="trackSelect">Soundtrack</label><select id="trackSelect"><option value="auto">Arena bo‘yicha avtomatik</option>${ART.music.map((x,i)=>`<option value="${i}">${x.title}</option>`).join('')}</select></div>
      <div class="setting-row"><label for="difficultySelect">Kompyuter qiyinligi</label><select id="difficultySelect"><option value="easy">Oson</option><option value="normal">O‘rtacha</option><option value="hard">Qiyin</option></select></div>
      <div class="setting-row"><label for="qualitySelect">Tasvir sifati</label><select id="qualitySelect"><option value="low">Tezkor</option><option value="balanced">Muvozanatli</option><option value="high">Yuqori</option></select></div>
      <div class="setting-row"><label for="shakeCheck">Zarbada kamera tebranishi</label><input id="shakeCheck" type="checkbox" ${settings.shake?'checked':''}></div>
      <div class="setting-row"><label for="motionCheck">Yumshoq ekran effektlari</label><input id="motionCheck" type="checkbox" ${settings.reducedMotion?'checked':''}></div>
      <div class="setting-row"><label for="interpolationCheck">90 Hz oraliq harakatlar</label><input id="interpolationCheck" type="checkbox" ${settings.interpolation?'checked':''}></div>
      <p>Sozlamalar ushbu qurilmada saqlanadi. Barcha besh original soundtrack to‘liq uzunligida mavjud.</p>`;
    $('trackSelect').value=settings.track;$('difficultySelect').value=settings.difficulty;$('qualitySelect').value=settings.quality;
    $('musicVolume').oninput=e=>{settings.music=Number(e.target.value);saveSettings();};$('effectsVolume').oninput=e=>{settings.effects=Number(e.target.value);saveSettings();};
    $('trackSelect').onchange=e=>{settings.track=e.target.value;audio.current=null;audio.track(screen==='game'?stage:1);saveSettings();};
    $('difficultySelect').onchange=e=>{settings.difficulty=e.target.value;if(fight)fight.difficulty=settings.difficulty;saveSettings();};
    $('qualitySelect').onchange=e=>{settings.quality=e.target.value;renderer.resize();saveSettings();};
    $('shakeCheck').onchange=e=>{settings.shake=e.target.checked;saveSettings();};$('motionCheck').onchange=e=>{settings.reducedMotion=e.target.checked;saveSettings();};
    $('interpolationCheck').onchange=e=>{settings.interpolation=e.target.checked;saveSettings();};
  }else{
    $('modalTitle').textContent='OLAM ORTIDAGI JAMOA';body.innerHTML='<div class="credit-logo">SYSONE STUDIO</div><p>WORLD OF SAVIOR — NAJOTKORLAR OLAMI</p><p>Besh jangchi. Besh olam. Bir taqdir.</p><p>Original soundtracklar: qobilbekodilov21<br>Metal Impact · Omnibus I / II · Battle Heartbeat I / II</p><p>360 yangi tayanch poza · 90 Hz animatsiya · v0.2</p><button id="replayIntro" class="outline-button">SYSONE STUDIO INTROSINI KO‘RISH ↗</button>';
    $('replayIntro').onclick=()=>{closeModal(false);fight=null;go('menu');playStudioIntro();};
  }
  $('closeModal').focus({preventScroll:true});
}
$('closeModal').onclick=()=>closeModal();$('modal').onclick=e=>{if(e.target===$('modal'))closeModal();};
$('pauseButton').onclick=()=>openModal('pause');$('settingsButton').onclick=()=>openModal('settings');$('helpButton').onclick=()=>openModal('help');$('creditsButton').onclick=()=>openModal('credits');
$('muteButton').onclick=()=>{settings.muted=!settings.muted;$('muteButton').textContent=settings.muted?'♪̸':'♫';$('muteButton').setAttribute('aria-label',settings.muted?'Ovozni yoqish':'Ovozni o‘chirish');saveSettings();};
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{toast('Bu brauzer to‘liq ekran rejimini qo‘llamaydi.');}}
$('fullscreenButton').onclick=fullscreen;
document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.code==='Tab'&&modalKind){const focusables=[...$('modal').querySelectorAll('button,input,select')].filter(el=>!el.disabled);const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}return;}
  if(!$('launch').hidden){if(e.code==='Enter'&&ready){e.preventDefault();$('launchButton').click();}return;}
  if(!$('studioIntro').hidden){if(['Enter','Escape','Space'].includes(e.code)){e.preventDefault();finishStudioIntro();}return;}
  if(screen==='clash'&&['Enter','Escape','Space'].includes(e.code)){e.preventDefault();goMenu();return;}
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(modalKind)closeModal();else if(screen==='game')openModal('pause');else if(screen==='select'||screen==='viewer')goMenu();return;}
  if(modalKind)return;
  if(screen==='viewer'&&e.code==='Space'){e.preventDefault();viewer.playing=!viewer.playing;return;}
  if(screen==='game'){
    const all=['KeyA','KeyD','KeyS','KeyW','Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Digit0','Numpad0',...Object.keys(actionKeys[0]),...Object.keys(actionKeys[1])];if(all.includes(e.code))e.preventDefault();held.add(e.code);if(e.repeat)return;
    if(e.code==='Enter'){fight?.skipIntro();return;}if(e.code==='KeyR'&&mode==='training'){fight.resetTraining();return;}
    for(let i=0;i<(mode==='local'?2:1);i++){const action=actionKeys[i][e.code];if(action)perform(i,action);}
  }else if(screen==='menu'&&['ArrowDown','ArrowUp'].includes(e.code)){
    e.preventDefault();const buttons=[...document.querySelectorAll('.menu-option')],at=buttons.indexOf(document.activeElement),dir=e.code==='ArrowDown'?1:-1;buttons[(at+dir+buttons.length)%buttons.length].focus();
  }
});
document.addEventListener('keyup',e=>held.delete(e.code));
document.querySelectorAll('.touch-controls button').forEach(button=>{
  const release=()=>{if(button.dataset.hold)touchHeld.delete(button.dataset.hold);button.classList.remove('pressed');};
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);button.classList.add('pressed');const hold=button.dataset.hold;if(hold==='jump')perform(0,'jump');else if(hold)touchHeld.add(hold);if(button.dataset.action)perform(0,button.dataset.action);});
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
});
function controls(){
  const controls=[{move:(held.has('KeyD')||touchHeld.has('right')?1:0)-(held.has('KeyA')||touchHeld.has('left')?1:0),crouch:held.has('KeyS')||touchHeld.has('crouch'),guard:held.has('Space')||touchHeld.has('guard')},
    {move:(held.has('ArrowRight')?1:0)-(held.has('ArrowLeft')?1:0),crouch:held.has('ArrowDown'),guard:held.has('Digit0')||held.has('Numpad0')}];
  try{const pads=[...navigator.getGamepads()].filter(Boolean);for(let i=0;i<Math.min(mode==='local'?2:1,pads.length);i++){
    const pad=pads[i],previous=gamepadPrevious[i]||[],now=pad.buttons.map(x=>x.pressed),axis=pad.axes[0]||0;
    if(Math.abs(axis)>.23)controls[i].move=Math.sign(axis);if(now[14])controls[i].move=-1;if(now[15])controls[i].move=1;
    controls[i].crouch||=now[13]||pad.axes[1]>.5;controls[i].guard||=now[4];
    for(const [index,action]of [[0,'light'],[1,'heavy'],[2,'special'],[3,'grab'],[5,'xray'],[7,'ultimate'],[12,'jump']])if(now[index]&&!previous[index])perform(i,action);
    if(now[9]&&!previous[9]){if(modalKind)closeModal();else openModal('pause');}gamepadPrevious[i]=now;
  }}catch{}
  return controls;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();audio.stop();if(screen==='game'&&fight?.phase!=='victory'&&!modalKind)openModal('pause');}else if($('studioIntro').hidden)audio.resume();});
window.addEventListener('blur',()=>{clearInput();if(screen==='game'&&fight?.phase!=='victory'&&!modalKind)openModal('pause');});
window.addEventListener('gamepadconnected',()=>toast('Gamepad ulandi. Boshqaruv qo‘llanmasini ? tugmasidan oching.'));
let introFinished=false;
async function playStudioIntro(){introFinished=false;audio.stop();$('launch').hidden=true;$('studioIntro').hidden=false;const video=$('introVideo');video.currentTime=0;video.muted=settings.muted;video.volume=Math.min(1,settings.effects);try{await video.play();}catch{toast('Introdan o‘tish uchun pastdagi tugmani bosing.');}}
function finishStudioIntro(){if(introFinished)return;introFinished=true;$('introVideo').pause();$('studioIntro').hidden=true;clashTime=0;go('clash');audio.track(1);}
$('introVideo').src=ART.intro;$('introVideo').onended=finishStudioIntro;$('introVideo').onerror=()=>{if(!$('studioIntro').hidden){toast('Intro ijro etilmadi. O‘yin davom etadi.');finishStudioIntro();}};
$('skipIntro').onclick=finishStudioIntro;
$('launchButton').onclick=async()=>{if(!ready)return;await audio.unlock();await playStudioIntro();};$('retryLoad').onclick=()=>location.reload();
if(settings.muted)$('muteButton').textContent='♪̸';
assets.preload(progress=>{$('loadBar').style.width=`${progress*100}%`;$('loadPercent').textContent=Math.round(progress*100)+'%';}).then(async()=>{await renderer.warper.loadMotion();ready=true;$('loadMessage').textContent='360 yangi poza va barcha olamlar tayyor';$('launchButton').disabled=false;$('launchButton').textContent='OLAMGA KIRISH →';}).catch(error=>{console.error(error);$('loadMessage').textContent='Fayllar yuklanmadi. Qayta urinib ko‘ring.';$('retryLoad').hidden=false;});

let previous=performance.now(),accumulator=0,renderClock=0,renderElapsed=0;
function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
  if(screen==='game'&&fight){const input=controls();if(!fight.paused){accumulator+=dt;let steps=0;while(accumulator>=1/120&&steps<7){fight.tick(1/120,input);accumulator-=1/120;steps++;}processEvents();}else accumulator=0;if(now-lastUi>33){updateHUD();lastUi=now;}}
  else accumulator=0;
  if(screen==='clash'){clashTime+=dt;if(clashTime>4.4)goMenu();}
  renderClock+=dt;renderElapsed+=dt;
  if(renderClock>=1/90){if($('studioIntro').hidden&&$('launch').hidden)renderer.draw(screen==='game'&&fight?.paused?0:renderElapsed,{screen,fight,stage,p1,p2,viewer,clashTime});renderClock%=1/90;renderElapsed=0;}
  if(screen==='viewer'&&now-lastUi>33){updateViewer();lastUi=now;}
  if($('fpsStatus'))$('fpsStatus').textContent=`${renderer.measuredFPS} FPS / 90 TARGET`;
  audio.update(dt,!$('studioIntro').hidden ? 0 : modalKind ? .55 : fight?.phase==='cinematic' ? .4 : 1);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function updateViewer(){
  const data=FRAMES.fighters[viewer.id],meta=data.clipMeta[viewer.clip];
  if(viewer.playing){viewer.time%=meta.durationFrames/90;viewer.frame=Math.floor(viewer.time*90);$('poseScrub').value=viewer.frame;}
  $('poseCounter').textContent=`${Math.min(meta.durationFrames-1,viewer.frame)+1} / ${meta.durationFrames}  ·  90 FPS  ·  ${data.clips[viewer.clip].length} TAYANCH POZA`;
  $('posePlay').textContent=viewer.playing?'Ⅱ TO‘XTATISH':'▶ IJRO ETISH';
}
function setViewerClip(){viewer.id=$('poseCharacter').value;viewer.clip=$('poseClip').value;viewer.time=0;viewer.frame=0;$('poseScrub').max=FRAMES.fighters[viewer.id].clipMeta[viewer.clip].durationFrames-1;updateViewer();}
function openViewer(){fight=null;closeModal(false);go('viewer');viewer.playing=true;viewer.time=0;viewer.frame=0;setViewerClip();audio.track(1);}
function installSuppliedUI(){
  const logo='assets/regenerated-v2/world-of-savior-logo.png';
  for(const heading of [document.querySelector('h1'),document.querySelector('.launch-overlay h2')]){const img=document.createElement('img');img.className='game-title-art';img.src=logo;img.alt='WORLD OF SAVIOR';heading.classList.add('title-with-art');heading.append(img);}
  const buttonArt={versus:'versus_1p_ai',local:'local_2p_pvp',arcade:'arcade_tower',training:'fight_action'};
  document.querySelectorAll('.menu-option[data-mode]').forEach(button=>{const img=document.createElement('img');img.src=UI.buttons[buttonArt[button.dataset.mode]];img.alt='';img.className='supplied-button-art';button.prepend(img);});
  const menu=document.querySelector('.menu-options');
  menu.insertAdjacentHTML('beforeend',`<button id="workshopButton" class="menu-option"><img class="supplied-button-art" src="${UI.buttons.fighters_roster}" alt=""><span><b>JANGCHILAR USTAXONASI</b><small>Harakatlar va yangi kadrlarni ko‘rish</small></span></button><button id="menuSettings" class="menu-option"><img class="supplied-button-art" src="${UI.buttons.settings}" alt=""><span><b>SOZLAMALAR</b><small>Ovoz, tasvir va qiyinlik</small></span></button>`);
  $('workshopButton').onclick=openViewer;$('menuSettings').onclick=()=>openModal('settings');
  for(const [id,key]of [['backMenu','back'],['beginFight','fight_action']]){const button=$(id),img=document.createElement('img');img.src=UI.buttons[key];img.alt='';button.prepend(img);button.classList.add('graphic-action');}
  const announcement=document.createElement('img');announcement.id='announcerArt';announcement.alt='';announcement.hidden=true;$('announcer').prepend(announcement);
  const resultArt=document.createElement('img');resultArt.className='result-banner';resultArt.src=UI.banners.match_over;resultArt.alt='';$('matchResult').prepend(resultArt);
  document.querySelectorAll('.touch-attacks button').forEach(button=>{const key=button.dataset.action||'block';const img=document.createElement('img');img.src=UI.touch[key];img.alt='';button.prepend(img);});
  const ultimateButton=document.createElement('button');ultimateButton.dataset.action='ultimate';ultimateButton.setAttribute('aria-label','Yakuniy kuch');ultimateButton.innerHTML=`<img src="${UI.touch.special}" alt=""><span>YAKUNIY KUCH</span>`;ultimateButton.onpointerdown=e=>{e.preventDefault();ultimateButton.setPointerCapture(e.pointerId);ultimateButton.classList.add('pressed');perform(0,'ultimate');};ultimateButton.onpointerup=ultimateButton.onpointercancel=()=>ultimateButton.classList.remove('pressed');document.querySelector('.touch-attacks').append(ultimateButton);
  document.querySelector('.touch-directions').style.backgroundImage=`url('${UI.touch.dpad_8way_base}')`;
  const knob=document.createElement('img');knob.src=UI.touch.joystick_thumb_knob;knob.alt='';knob.className='touch-knob';document.querySelector('.touch-directions').append(knob);
  $('trainingStats').insertAdjacentHTML('beforeend','<label class="hitbox-switch"><input type="checkbox" id="hitboxToggle"> Zarba hududini ko‘rsatish</label>');
  $('hitboxToggle').onchange=e=>renderer.overlay=e.target.checked;
  document.querySelector('.top-center').insertAdjacentHTML('beforeend','<span id="fpsStatus">90 FPS TARGET</span>');
  document.querySelector('.menu-footer b').textContent='v0.2';
  $('app').insertAdjacentHTML('beforeend',`<main id="clashScreen" class="screen clash-screen" hidden><p class="eyebrow">OLAMLAR TO‘QNASHUVI</p><button id="skipClash" class="gold-button">O‘YINGA KIRISH →</button></main>
  <main id="viewerScreen" class="screen viewer-screen" hidden><div class="viewer-heading"><p class="eyebrow">NAJOTKORLAR USTAXONASI</p><h2>HARAKATLAR VA KADRLAR</h2><button id="viewerBack" class="text-button">← BOSH MENYU</button></div><aside class="viewer-controls"><label for="poseCharacter">JANGCHI</label><select id="poseCharacter">${ROSTER.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select><label for="poseClip">ANIMATSIYA</label><select id="poseClip">${[
    ['idle','Tik turish'],['walk','Yurish'],['air','Sakrash / havodagi hujum'],['guard','Himoya harakati'],['light','Yengil zarba'],['heavy','Og‘ir zarba'],['special','Maxsus hujum'],['ultimate','Yakuniy kuch'],['reactions','Zarba olish / yiqilish / turish'],['blockCrouchGrab','Himoya / egilish / ushlash'],['intro','Jangga kirish'],['xray','X-ray — barcha 8 poza'],['fatality','Fatality — barcha 4 poza'],['victory','G‘alaba'],['select','Personaj tanlash']
  ].map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select><button id="posePlay" class="outline-button">Ⅱ TO‘XTATISH</button><p>Har bir katak 512 × 512. Tayanch nuqtasi o‘zgarmaydi. Oraliq harakatlar bitta siluet asosida chiziladi.</p><button id="uiGalleryButton" class="outline-button">UI VA EFFEKTLAR GALEREYASI</button><div id="poseCounter"></div></aside><div class="viewer-timeline"><label for="poseScrub">KADR BO‘YICHA KO‘RISH</label><input type="range" id="poseScrub" min="0" max="107" value="0"><span>SPACE — IJRO / PAUZA</span></div></main>`);
  $('skipClash').onclick=goMenu;$('viewerBack').onclick=goMenu;
  $('poseCharacter').onchange=setViewerClip;$('poseClip').onchange=setViewerClip;
  $('posePlay').onclick=()=>{viewer.playing=!viewer.playing;updateViewer();};
  $('poseScrub').oninput=e=>{viewer.playing=false;viewer.frame=Number(e.target.value);viewer.time=viewer.frame/90;updateViewer();};
  $('uiGalleryButton').onclick=()=>{
    openModal('credits');$('modalTitle').textContent='UI VA EFFEKTLAR GALEREYASI';
    const cards=[];for(const group of ['buttons','avatars','avatarCards','portraits','banners','touch'])for(const [key,file]of Object.entries(UI[group]))cards.push({title:`${group} / ${key}`,file});UI.cards.forEach((file,i)=>cards.push({title:`Arena ${i+1}`,file}));for(const ref of UI.references)cards.push({...ref,title:ref.title+' · manba konsepti'});
    $('modalBody').innerHTML='<div class="ui-source-gallery">'+cards.map(x=>`<figure><img loading="lazy" src="${x.file}" alt="${x.title}"><figcaption>${x.title}</figcaption></figure>`).join('')+'</div><p>Menyu tugmalari, HUD bezaklari, avatarlar, arena kartalari, raund yozuvlari va sensor tugmalar o‘yinning tegishli ekranlarida ishlatiladi. To‘liq chizilgan ekranlar manba konseptlari sifatida ko‘rsatilgan.</p>';
    $('modal').querySelector('.modal-card').classList.add('gallery-wide');
  };
}
installSuppliedUI();
