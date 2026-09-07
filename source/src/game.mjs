import {renderView,VERSION} from './view.mjs';
import {World,makeLevel,blankLevel,validateCustom,previewInput,STEP,W,H,FLOOR,CEILING,clamp,sectionAt} from './engine.mjs';
import {Soundtrack} from './audio.mjs';
import {Renderer,PALETTE} from './render.mjs';
import {CSS} from './styles.mjs';
const freshStat=()=>({best:0,practice:0,coins:0,attempts:0,completions:0});
const defaults=()=>({version:1,settings:{music:.62,sfx:.55,muted:false,autoRetry:true,particles:true,reducedMotion:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,icon:0,primary:0,secondary:1},stats:[freshStat(),freshStat(),freshStat()],totalJumps:0});
function loadStore(){const d=defaults();try{const s=JSON.parse(localStorage.getItem('geometrylite.native.v1')||'null');if(s?.version!==1)return d;
 for(const k of ['music','sfx'])if(Number.isFinite(s.settings?.[k]))d.settings[k]=clamp(s.settings[k],0,1);
 for(const k of ['muted','autoRetry','particles','reducedMotion'])if(typeof s.settings?.[k]==='boolean')d.settings[k]=s.settings[k];
 for(const[k,max]of [['icon',5],['primary',9],['secondary',9]])if(Number.isInteger(s.settings?.[k]))d.settings[k]=clamp(s.settings[k],0,max);
 if(Array.isArray(s.stats))for(let i=0;i<3;i++)for(const k of Object.keys(d.stats[i]))if(Number.isFinite(s.stats[i]?.[k]))d.stats[i][k]=clamp(s.stats[i][k],0,k==='best'||k==='practice'?100:k==='coins'?7:1e7);
 if(Number.isFinite(s.totalJumps))d.totalJumps=clamp(s.totalJumps,0,1e9);
 }catch{}return d;}
function saveStore(store){try{localStorage.setItem('geometrylite.native.v1',JSON.stringify(store));return true;}catch{return false;}}
export class NativeGame {
 constructor(host){
  this.host=host;this.destroyed=false;this.store=loadStore();this.settings=this.store.settings;this.index=0;this.level=makeLevel(0);this.world=null;
  this.screen='menu';this.practice=false;this.watch=false;this.customRun=false;this.starting=false;this.attempt=0;this.checkpoints=[];this.lastCheckpoint=0;
  this.editorX=0;this.tool='block';this.undoStack=[];this.redoStack=[];this.custom=blankLevel();this.editorDown=false;this.editorLastCell='';
  try{const raw=localStorage.getItem('geometrylite.native.custom.v1');if(raw)this.custom=validateCustom(JSON.parse(raw));}catch{}
  this.keys=new Set();this.pointers=new Set();this.queue=[];this.inputHeld=false;this.previewHeld=false;this.focused=false;this.lastEvent=0;
  this.audio=new Soundtrack();this.audio.setMix(this.settings.music,this.settings.sfx,this.settings.muted);this.abort=new AbortController();
  this.shadow=host.shadowRoot||host.attachShadow({mode:'open'});this.shadow.innerHTML=`<style>${CSS}</style><div class="shell"><div class="scene"><canvas tabindex="0" aria-label="GeometryLite game. Space or tap to jump. Escape to pause."></canvas></div><div class="ui"></div></div>`;
  this.shell=this.shadow.querySelector('.shell');this.scene=this.shadow.querySelector('.scene');this.canvas=this.shadow.querySelector('canvas');this.ui=this.shadow.querySelector('.ui');this.renderer=new Renderer(this.canvas);
  this.canvas.setAttribute('role','application');this.host.setAttribute('aria-label','GeometryLite native rhythm game');this.host.tabIndex=0;
  this.metrics={frames:0,maxClockLagMs:0,physicsSteps:0,pausesForLag:0};this.bind();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.host);this.resize();this.renderUI();this.raf=requestAnimationFrame(t=>this.frame(t));
 }
 get colors(){return [PALETTE[this.settings.primary],PALETTE[this.settings.secondary]];}
 bind(){const opts={signal:this.abort.signal};
  this.ui.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(!btn||btn.disabled)return;e.preventDefault();this.focused=true;this.handle(btn.dataset.action);},opts);
  this.ui.addEventListener('input',e=>{const el=e.target;if(el.dataset.setting){const k=el.dataset.setting;this.settings[k]=el.type==='checkbox'?el.checked:clamp(Number(el.value),0,1);saveStore(this.store);this.audio.setMix(this.settings.music,this.settings.sfx,this.settings.muted);this.shell.classList.toggle('no-motion',this.settings.reducedMotion);const label=this.ui.querySelector(`[data-value="${k}"]`);if(label)label.textContent=Math.round(this.settings[k]*100)+'%';}
   if(el.dataset.editor==='pan')this.editorX=Number(el.value);if(el.dataset.editor==='name')this.custom.name=el.value.slice(0,32);
  },opts);
  this.shell.addEventListener('pointerdown',e=>{this.focused=true;if(e.target.closest('button,input,a,.panel'))return;
   if(this.screen==='editor'){e.preventDefault();this.editorDown=true;this.editorLastCell='';this.pushUndo();this.place(e);return;}
   if(this.screen!=='game'||this.starting)return;e.preventDefault();this.canvas.focus({preventScroll:true});if(!this.watch){this.pointers.add(e.pointerId);this.enqueue(true);}
  },opts);
  this.shell.addEventListener('pointermove',e=>{if(this.screen==='editor'&&this.editorDown&&(e.buttons||e.pointerType==='touch'))this.place(e);},opts);
  const up=e=>{this.pointers.delete(e.pointerId);this.editorDown=false;if(!this.pointers.size&&!this.keys.size)this.enqueue(false);};window.addEventListener('pointerup',up,opts);window.addEventListener('pointercancel',up,opts);
  window.addEventListener('keydown',e=>{
   if(!this.focused)return;const target=e.composedPath()[0];if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement)return;
   const k=e.code;if(['Space','ArrowUp','KeyW'].includes(k)&&this.screen==='game'){e.preventDefault();if(!e.repeat){this.keys.add(k);this.enqueue(true);}return;}
   if(e.repeat)return;if(k==='Escape'){e.preventDefault();this.handle(this.screen==='game'?'pause':this.screen==='pause'?'resume':'back');}
   if(k==='KeyR'&&['game','pause','result'].includes(this.screen)){e.preventDefault();this.retry();}
   if(k==='KeyM'){e.preventDefault();this.toggleMute();}if(k==='KeyF'){e.preventDefault();this.fullscreen();}
   if(k==='KeyP'&&['game','pause'].includes(this.screen)){e.preventDefault();this.startRun(this.index,!this.practice,false,this.customRun,true);}
   if(k==='KeyZ'&&this.screen==='game'&&this.practice){e.preventDefault();this.checkpoint(true);}
   if(k==='KeyX'&&this.screen==='game'&&this.practice){e.preventDefault();this.checkpoints.pop();this.toast('Last checkpoint removed');}
  },opts);
  window.addEventListener('keyup',e=>{if(this.keys.has(e.code)){this.keys.delete(e.code);if(!this.keys.size&&!this.pointers.size)this.enqueue(false);}},opts);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.screen==='game')this.pause('Game paused while the tab is hidden');},opts);
  window.addEventListener('blur',()=>{if(this.screen==='game')this.pause();this.release();},opts);
  document.addEventListener('pointerdown',e=>{if(!e.composedPath().includes(this.host))this.focused=false;},opts);
  document.addEventListener('fullscreenchange',()=>this.resize(),opts);
 }
 resize(){const r=this.host.getBoundingClientRect(),width=Math.min(r.width,r.height*W/H),height=width*H/W;this.scene.style.width=width+'px';this.scene.style.height=height+'px';this.renderer.resize();}
 release(){this.keys.clear();this.pointers.clear();this.queue=[];this.inputHeld=false;this.previewHeld=false;}
 clock(){return this.clockAudio?this.audio.now():performance.now()/1000-this.clockOrigin;}
 enqueue(down){if(this.screen!=='game'||this.watch||this.starting)return;this.queue.push({t:Math.max(this.world?.t||0,this.clock()),down});}
 async startRun(index=this.index,practice=false,watch=false,custom=false,fresh=true,snapshot=null){
  if(this.starting||this.destroyed)return;this.starting=true;this.index=index;this.practice=practice;this.watch=watch;this.customRun=custom;
  this.level=custom?validateCustom(this.custom):makeLevel(index);this.world=new World(this.level);if(snapshot)this.world.reset(snapshot);
  if(fresh){this.attempt=0;this.checkpoints=[];this.lastCheckpoint=0;}this.attempt++;this.release();this.lastEvent=0;this.handledDeath=false;this.newBest=false;
  this.renderer.trace=[];this.renderer.particles=[];this.screen='game';this.renderUI();
  if(!watch&&!custom){this.store.stats[index].attempts++;saveStore(this.store);}
  try{await this.audio.start(this.level,this.world.t);this.clockAudio=true;}catch{this.clockAudio=false;this.toast('Audio unavailable. The game is still playable.');}
  if(this.destroyed){this.audio.dispose();return;}this.clockOrigin=performance.now()/1000-this.world.t;this.starting=false;this.renderUI();this.canvas.focus({preventScroll:true});this.focused=true;
 }
 retry(){const cp=this.practice?this.checkpoints.at(-1):null;return this.startRun(this.index,this.practice,this.watch,this.customRun,false,cp);}
 pause(message){if(this.screen!=='game'||this.starting)return;this.audio.stop();this.screen='pause';this.release();this.renderUI();if(message)this.toast(message);}
 async resume(){if(this.screen!=='pause'||this.starting)return;if(this.world.dead){this.retry();return;}this.starting=true;
  try{await this.audio.start(this.level,this.world.t);this.clockAudio=true;}catch{this.clockAudio=false;}
  if(this.destroyed)return;this.clockOrigin=performance.now()/1000-this.world.t;this.release();this.screen='game';this.starting=false;this.renderUI();this.canvas.focus({preventScroll:true});
 }
 finish(){this.audio.stop();this.audio.effect('win');if(!this.watch&&!this.customRun){const s=this.store.stats[this.index];if(this.practice)s.practice=100;else{s.best=100;s.coins|=this.world.coins;s.completions++;}saveStore(this.store);}this.screen='result';this.release();this.renderUI();}
 death(now){if(this.handledDeath)return;this.handledDeath=true;this.deathAt=now;this.audio.stop();this.audio.effect('death');this.release();
  if(!this.watch&&!this.customRun){const s=this.store.stats[this.index],k=this.practice?'practice':'best',p=Math.floor(this.world.t/this.level.duration*100);this.newBest=p>s[k];s[k]=Math.max(s[k],p);saveStore(this.store);}
 }
 checkpoint(manual=false){if(!this.practice||this.world.dead||this.world.safeFor<(manual?.03:.12)){if(manual)this.toast('Place checkpoints on safe ground');return;}
  if(this.checkpoints.length>=64)this.checkpoints.shift();const cp=this.world.snapshot();this.checkpoints.push(cp);this.lastCheckpoint=cp.t;if(manual)this.toast('Checkpoint placed · X removes it');
 }
 frame(ms){if(this.destroyed)return;const now=ms/1000;this.metrics.frames++;
  if(this.screen==='game'&&!this.starting){
   if(this.world.dead){if(!this.handledDeath)this.death(now);if(now-this.deathAt>.85&&this.settings.autoRetry&&!this.watch)this.retry();}
   else if(!this.world.won){const target=this.clock(),lag=target-this.world.t;
    if(lag>.30){this.metrics.pausesForLag++;this.pause('Paused to prevent a lag-induced death');}
    else{let count=0;
     while(this.world.t+STEP<=target&&!this.world.dead&&!this.world.won&&count++<100){let pressed=false,down=this.inputHeld;
      if(this.watch){down=previewInput(this.world);pressed=down&&!this.previewHeld;this.previewHeld=down;}
      else{while(this.queue.length&&this.queue[0].t<=this.world.t+STEP){const e=this.queue.shift();if(e.down&&!down)pressed=true;down=e.down;}this.inputHeld=down;}
      this.world.step(STEP,down,pressed);this.metrics.physicsSteps++;
     }
     this.metrics.maxClockLagMs=Math.max(this.metrics.maxClockLagMs,Math.max(0,target-this.world.t)*1000);
     for(;this.lastEvent<this.world.events.length;this.lastEvent++){const ev=this.world.events[this.lastEvent];if(ev.type==='jump'){if(!this.watch)this.store.totalJumps++;}else if(ev.type!=='death'&&ev.type!=='win')this.audio.effect(ev.type);
      if(ev.type!=='jump')this.renderer.burst(ev,this.colors[0]);
      if(ev.type==='portal')this.toast(ev.mode==='ship'?'SHIP · hold to rise, release to fall':ev.mode==='wave'?'WAVE · hold / release':ev.gravity===-1?'GRAVITY FLIPPED':'CUBE · tap to jump');
     }
     if(this.world.dead)this.death(now);else if(this.world.won)this.finish();
     else if(this.practice&&this.world.t-this.lastCheckpoint>4&&sectionAt(this.level,this.world.t).end-this.world.t>1.4)this.checkpoint();
    }
   }
   if(!this.lastHUD||now-this.lastHUD>.06){this.updateHUD();this.lastHUD=now;}
  }
  this.renderer.draw(this,now);this.raf=requestAnimationFrame(t=>this.frame(t));
 }
 updateHUD(){if(!this.world)return;const p=clamp(this.world.t/this.level.duration,0,1),fill=this.ui.querySelector('.progress-fill'),text=this.ui.querySelector('.percentage');if(fill)fill.style.transform=`scaleX(${p})`;if(text)text.textContent=Math.floor(p*100)+'%';this.ui.querySelectorAll('[data-coin]').forEach(el=>el.classList.toggle('earned',!!(this.world.coins&(1<<Number(el.dataset.coin)))));}
 async handle(action){if(this.destroyed)return;this.audio.effect('ui');
  if(action==='choose'){this.screen='levels';this.renderUI();}
  else if(action==='play')this.startRun(this.index,false,false,false,true);
  else if(action==='practice')this.startRun(this.index,true,false,false,true);
  else if(action==='watch')this.startRun(this.index,false,true,false,true);
  else if(action==='prev'||action==='next'){this.index=(this.index+(action==='next'?1:2))%3;this.level=makeLevel(this.index);this.renderUI();}
  else if(['icons','settings','stats','about'].includes(action)){this.returnScreen=this.screen;this.screen=action;this.renderUI();}
  else if(action==='back'){
   if(this.screen==='game')this.pause();else if(this.screen==='pause')this.resume();else if(['icons','settings','stats','about'].includes(this.screen)){this.screen=this.returnScreen||'menu';this.renderUI();}
   else if(this.screen==='result'&&this.customRun){this.screen='editor';this.level=this.custom;this.renderUI();}
   else{this.audio.stop();this.screen='menu';this.watch=false;this.renderUI();}
  }
  else if(action==='pause')this.pause();else if(action==='resume')this.resume();else if(action==='retry')this.retry();
  else if(action==='home'){this.audio.stop();this.release();this.screen=this.customRun?'editor':'levels';this.level=this.customRun?this.custom:makeLevel(this.index);this.renderUI();}
  else if(action==='toggle-practice')this.startRun(this.index,!this.practice,false,this.customRun,true);
  else if(action==='mute')this.toggleMute();else if(action==='fullscreen')this.fullscreen();else if(action==='screenshot')this.screenshot();
  else if(action.startsWith('icon:')){this.settings.icon=Number(action.split(':')[1]);saveStore(this.store);this.renderUI();}
  else if(action.startsWith('primary:')||action.startsWith('secondary:')){const[k,v]=action.split(':');this.settings[k]=Number(v);saveStore(this.store);this.renderUI();}
  else if(action==='editor'){this.audio.stop();this.screen='editor';this.level=this.custom;this.editorX=0;this.renderUI();}
  else if(action.startsWith('tool:')){this.tool=action.split(':')[1];this.renderUI();}
  else if(action==='editor-play')this.startRun(this.index,false,false,true,true);
  else if(action==='editor-save'){try{localStorage.setItem('geometrylite.native.custom.v1',JSON.stringify(validateCustom(this.custom)));this.toast('Level saved on this device');}catch(e){this.toast(e.message||'Storage is unavailable');}}
  else if(action==='editor-export'){try{this.download(JSON.stringify(validateCustom(this.custom),null,2),'geometrylite-level.json','application/json');}catch(e){this.toast(e.message);}}
  else if(action==='editor-import')this.importLevel();else if(action==='editor-undo')this.undo();else if(action==='editor-redo')this.redo();
  else if(action==='editor-clear'){if(confirm('Clear the current level? You can undo this.')){this.pushUndo();this.custom=blankLevel();this.level=this.custom;this.renderUI();}}
  else if(action==='checkpoint')this.checkpoint(true);else if(action==='remove-checkpoint'){this.checkpoints.pop();this.toast('Last checkpoint removed');}
 }
 toggleMute(){this.settings.muted=!this.settings.muted;saveStore(this.store);this.audio.setMix(this.settings.music,this.settings.sfx,this.settings.muted);this.renderUI();}
 async fullscreen(){
  if(this.host.hasAttribute('data-fullscreen')){this.host.removeAttribute('data-fullscreen');document.documentElement.style.overflow=this.previousOverflow||'';this.resize();return;}
  if(document.fullscreenElement){await document.exitFullscreen().catch(()=>{});return;}
  try{if(!this.host.requestFullscreen)throw new Error('CSS fallback');await this.host.requestFullscreen();try{await screen.orientation?.lock?.('landscape');}catch{}}
  catch{this.previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';this.host.setAttribute('data-fullscreen','');this.resize();}
 }
 screenshot(){this.canvas.toBlob(blob=>{if(blob)this.download(blob,`geometrylite-${this.level.id}.png`,'image/png');},'image/png');}
 download(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 toast(text){this.ui.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=text;this.ui.append(el);clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>el.remove(),2200);}
 pushUndo(){this.undoStack.push(JSON.stringify(this.custom));if(this.undoStack.length>50)this.undoStack.shift();this.redoStack=[];}
 undo(){if(!this.undoStack.length)return;this.redoStack.push(JSON.stringify(this.custom));this.custom=validateCustom(JSON.parse(this.undoStack.pop()));this.level=this.custom;this.renderUI();}
 redo(){if(!this.redoStack.length)return;this.undoStack.push(JSON.stringify(this.custom));this.custom=validateCustom(JSON.parse(this.redoStack.pop()));this.level=this.custom;this.renderUI();}
 place(e){const r=this.canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W+this.editorX,y=(e.clientY-r.top)/r.height*H;if(y<CEILING||y>=FLOOR||x<160)return;
  const gx=Math.round(x/40)*40,gy=FLOOR-Math.ceil((FLOOR-y)/40)*40,key=`${gx},${gy},${this.tool}`;if(key===this.editorLastCell)return;this.editorLastCell=key;
  if(this.tool==='erase'){const at=this.custom.objects.findIndex(o=>o.type==='coin'||o.type==='orb'||o.type==='saw'?Math.hypot(o.x-x,o.y-y)<28:x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h);if(at>=0)this.custom.objects.splice(at,1);}
  else{if(this.custom.objects.length>=1800){this.toast('Object limit reached');return;}if(this.custom.objects.some(o=>o.x===gx&&o.y===gy&&o.type===this.tool))return;
   if(this.tool==='coin'&&this.custom.objects.filter(o=>o.type==='coin').length>=3){this.toast('A level can have three coins');return;}
   const center=['coin','orb','saw'].includes(this.tool),o={id:this.custom.objects.length,type:this.tool,x:gx,y:center?gy+20:gy,w:40,h:40,r:this.tool==='coin'?15:18};
   if(this.tool==='pad'){o.y=FLOOR-7;o.h=7;}this.custom.objects.push(o);
  }
  this.custom=validateCustom(this.custom);this.level=this.custom;const count=this.ui.querySelector('[data-count]');if(count)count.textContent=this.custom.objects.length+' objects';
 }
 importLevel(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;if(file.size>1024*1024){this.toast('Level files must be smaller than 1 MB');return;}try{const l=validateCustom(JSON.parse(await file.text()));this.pushUndo();this.custom=l;this.level=l;this.editorX=0;this.renderUI();this.toast('Level imported');}catch(e){this.toast(e.message||'Invalid level file');}});input.click();}
 coins(mask=0,live=false){return `<div class="${live?'hud-coins':'coins'}">${[0,1,2].map(i=>`<span class="coin ${mask&(1<<i)?'earned':''}" ${live?`data-coin="${i}"`:''} aria-label="Coin ${i+1}${mask&(1<<i)?' collected':''}">★</span>`).join('')}</div>`;}
 records(){const s=this.store.stats[this.index];return `<div class="record-row"><span>NORMAL MODE</span><div class="meter"><div class="fill" style="width:${s.best}%"></div><b>${s.best}%</b></div></div><div class="record-row"><span>PRACTICE MODE</span><div class="meter practice"><div class="fill" style="width:${s.practice}%"></div><b>${s.practice}%</b></div></div>`;}
 renderUI(){renderView.call(this);}
 destroy(){if(this.destroyed)return;this.destroyed=true;cancelAnimationFrame(this.raf);clearTimeout(this.toastTimer);this.abort.abort();this.observer.disconnect();this.audio.dispose();if(this.host.hasAttribute('data-fullscreen'))document.documentElement.style.overflow=this.previousOverflow||'';this.shadow.innerHTML='';}
}
export function mount(host){return new NativeGame(host);}
if(typeof customElements!=='undefined'&&!customElements.get('geometry-lite-game'))customElements.define('geometry-lite-game',class extends HTMLElement{
 connectedCallback(){if(!this.game||this.game.destroyed)this.game=mount(this);}
 disconnectedCallback(){this.game?.destroy();}
});
