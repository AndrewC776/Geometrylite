/** Original electro/chiptune scores. Music and simulation share this clock. */
const hz=m=>440*2**((m-69)/12);
const MELODIES=[
 [0,7,12,10,7,3,5,7,12,10,7,5,3,2,7,3,0,7,15,12,10,7,5,3,7,10,12,7,5,3,2,0],
 [0,3,7,10,12,7,3,5,10,7,5,3,2,5,7,10,12,15,12,10,7,5,3,0,3,7,10,12,10,7,2,3],
 [12,7,0,7,10,7,3,7,15,12,7,5,10,7,2,5,12,10,7,3,15,12,10,7,5,7,10,12,7,5,3,0]
];
function noiseBuffer(ctx) {
  const b=ctx.createBuffer(1,Math.round(ctx.sampleRate*.6),ctx.sampleRate),d=b.getChannelData(0);
  let seed=934791;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=(seed>>>0)/2147483648-1;}return b;
}
export class Soundtrack {
  constructor(context=null){this.ctx=context;this.ready=false;this.playing=false;this.offset=0;this.muted=false;this.musicVolume=.62;this.sfxVolume=.55;this.nodes=new Set();this.scheduled=0;this.timer=null;if(context)this.initGraph();}
  initGraph(){
    const c=this.ctx;this.output=c.createGain();this.output.gain.value=.78;
    this.compressor=c.createDynamicsCompressor();
    Object.entries({threshold:-14,knee:18,ratio:5,attack:.004,release:.14}).forEach(([k,v])=>this.compressor[k].value=v);
    this.musicGain=c.createGain();this.musicGain.gain.value=this.musicVolume;
    this.sfxGain=c.createGain();this.sfxGain.gain.value=this.sfxVolume;
    this.musicGain.connect(this.compressor);this.sfxGain.connect(this.compressor);
    this.compressor.connect(this.output);this.output.connect(c.destination);this.noise=noiseBuffer(c);this.ready=true;
  }
  async unlock(){
    if(!this.ctx){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)throw new Error('Web Audio is unavailable');this.ctx=new C({latencyHint:'interactive'});this.initGraph();}
    if(this.ctx.state!=='running')await this.ctx.resume();return this.ctx.state==='running';
  }
  setMix(music,sfx,muted=false){
    this.musicVolume=music;this.sfxVolume=sfx;this.muted=muted;if(!this.ready)return;const t=this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(music,t,.025);this.sfxGain.gain.setTargetAtTime(sfx,t,.025);this.output.gain.setTargetAtTime(muted?0:.78,t,.015);
  }
  makeBus(){
    const c=this.ctx;this.bus=c.createGain();this.bus.connect(this.musicGain);
    this.delay=c.createDelay(1);this.delay.delayTime.value=(60/this.level.bpm)*.75;
    this.feedback=c.createGain();this.feedback.gain.value=.23;this.wet=c.createGain();this.wet.gain.value=.19;
    this.delay.connect(this.feedback);this.feedback.connect(this.delay);this.delay.connect(this.wet);this.wet.connect(this.bus);
  }
  async start(level,offset=0){
    await this.unlock();this.stop();this.level=level;this.offset=offset;this.epoch=this.ctx.currentTime+.035-offset;
    this.playing=true;this.makeBus();this.cursor=Math.ceil(offset/(60/level.bpm/4));this.setMix(this.musicVolume,this.sfxVolume,this.muted);
    this.schedule();this.timer=setInterval(()=>this.schedule(),25);
  }
  now(){return this.playing?Math.max(this.offset,this.ctx.currentTime-this.epoch):this.offset;}
  schedule(){
    if(!this.playing)return;const unit=60/this.level.bpm/4,c=this.ctx;
    while(this.epoch+this.cursor*unit<c.currentTime+.14){const t=this.epoch+this.cursor*unit;
      if(t>=c.currentTime-.002&&this.cursor*unit<this.level.duration+.6)this.score(this.cursor,Math.max(t,c.currentTime));
      this.cursor++;if(this.cursor*unit>this.level.duration+1)break;
    }
  }
  tone(note,t,dur,volume=.06,type='sawtooth',detune=0,dest=this.bus,cutoff=4000){
    const c=this.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
    o.type=type;o.frequency.value=hz(note);o.detune.value=detune;f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);f.frequency.exponentialRampToValueAtTime(Math.max(250,cutoff*.45),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.03,dur));
    o.connect(f);f.connect(g);g.connect(dest);this.nodes.add(o);
    o.onended=()=>{this.nodes.delete(o);o.disconnect();f.disconnect();g.disconnect();};o.start(t);o.stop(t+dur+.035);this.scheduled++;
  }
  noiseHit(t,duration,volume,frequency,dest=this.bus,type='highpass'){
    const c=this.ctx,n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=this.noise;f.type=type;f.frequency.value=frequency;
    g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);n.connect(f);f.connect(g);g.connect(dest);this.nodes.add(n);
    n.onended=()=>{this.nodes.delete(n);n.disconnect();f.disconnect();g.disconnect();};n.start(t);n.stop(t+duration+.01);
  }
  kick(t){
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(49,t+.12);
    g.gain.setValueAtTime(.76,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(this.bus);this.nodes.add(o);
    o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+.32);this.noiseHit(t,.025,.048,4500);
  }
  score(step,t){
    const l=this.level,beat=60/l.bpm,bar=Math.floor(step/16),k=step%16,root=l.key+[0,-5,3,-2][bar%4];
    const intro=bar<1,breakdown=bar%12===7;
    if(k%4===0&&!breakdown)this.kick(t);
    if((k===4||k===12)&&!intro){this.noiseHit(t,.16,.17,1500);this.tone(50,t,.10,.12,'triangle',0,this.bus,1400);}
    if(k%2===0)this.noiseHit(t,k%4===2?.065:.034,k%4===2?.045:.029,6500);
    if(bar%4===3&&(k===13||k===15))this.noiseHit(t,.07,.06,2300);
    if(k%2===0){
      const bass=root-12+[0,0,7,0,3,7,10,7][k/2];
      this.tone(bass,t+.024,beat*.39,.105,'sawtooth',0,this.bus,650);
      this.tone(bass,t+.018,beat*.40,.085,'sine',0,this.bus,800);
      const melody=MELODIES[l.index??0][Math.floor(step/2)%32];
      if(!intro||k>=8){
        this.tone(l.key+12+melody,t,beat*.40,.046,'sawtooth',-6,this.bus,4800);
        this.tone(l.key+12+melody,t,beat*.41,.040,'sawtooth',6,this.bus,4700);
        this.tone(l.key+12+melody,t,beat*.42,.030,'triangle',0,this.delay,6000);
      }
    }
    if(k===0&&bar>0)for(const note of [root,root+3,root+7]){
      this.tone(note,t,beat*3.5,.019,'sawtooth',-9,this.bus,1700);this.tone(note,t,beat*3.5,.019,'sawtooth',9,this.bus,1700);
    }
    if(bar>=2&&!breakdown)this.tone(root+24+[0,7,12,3,10,7,15,12][k%8],t,beat*.17,.018,'square',0,this.delay,3000);
  }
  effect(name){
    if(!this.ready||this.ctx.state!=='running')return;const t=this.ctx.currentTime;
    if(name==='death'){this.noiseHit(t,.20,.24,1000,this.sfxGain,'lowpass');this.tone(46,t,.22,.20,'sawtooth',0,this.sfxGain,1100);}
    if(name==='coin'){this.tone(88,t,.13,.15,'sine',0,this.sfxGain);this.tone(95,t+.075,.2,.13,'sine',0,this.sfxGain);}
    if(name==='portal'||name==='orb'||name==='pad'){this.tone(72,t,.13,.08,'triangle',0,this.sfxGain);this.tone(84,t+.055,.15,.065,'triangle',0,this.sfxGain);}
    if(name==='ui')this.tone(79,t,.055,.045,'triangle',0,this.sfxGain);
    if(name==='win')for(const [i,n] of [72,76,79,84].entries())this.tone(n,t+i*.11,.7,.15,'triangle',0,this.sfxGain);
  }
  stop(){
    if(this.playing)this.offset=this.now();this.playing=false;clearInterval(this.timer);this.timer=null;if(!this.ready)return;const t=this.ctx.currentTime;
    if(this.bus){const old=this.bus;old.gain.cancelScheduledValues(t);old.gain.setTargetAtTime(0,t,.008);setTimeout(()=>{try{old.disconnect();}catch{}},80);}
    for(const n of this.nodes){try{n.stop(t+.035);}catch{}}this.nodes.clear();
    if(this.feedback){this.feedback.gain.value=0;try{this.feedback.disconnect();this.delay.disconnect();this.wet.disconnect();}catch{}}
  }
  async dispose(){this.stop();if(this.ctx&&this.ctx.state!=='closed')await this.ctx.close().catch(()=>{});}
}
export async function renderAudioPreview(level,seconds=10){
  const sr=44100,ctx=new OfflineAudioContext(2,Math.ceil(seconds*sr),sr),s=new Soundtrack(ctx);s.level=level;s.makeBus();
  const unit=60/level.bpm/4;for(let i=0;i*unit<seconds;i++)s.score(i,i*unit+.01);return ctx.startRendering();
}
