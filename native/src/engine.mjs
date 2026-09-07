/** Original deterministic rhythm-platformer engine. No DOM, network or third-party assets. */
export const W = 960, H = 540, FLOOR = 420, CEILING = 96, SIZE = 34;
export const STEP = 1 / 240, SPEED = 360, GRAVITY = 2400, JUMP = 720;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const THEMES = [
  {name:'blue',h:222,s:94,l:42}, {name:'magenta',h:319,s:100,l:37},
  {name:'violet',h:273,s:90,l:40}, {name:'red',h:348,s:94,l:41},
  {name:'teal',h:178,s:92,l:29}, {name:'amber',h:23,s:100,l:42}
];
const PROFILES = [
  {id:'neon-dawn',name:'Neon Dawn',subtitle:'Find your rhythm',bpm:128,key:52,stars:2,difficulty:'EASY',beats:96,
    sections:[[0,'cube',1,0],[32,'ship',1,1],[48,'cube',1,2],[72,'cube',1,3]],pad:62},
  {id:'pulse-runner',name:'Pulse Runner',subtitle:'Turn your world around',bpm:136,key:57,stars:4,difficulty:'NORMAL',beats:112,
    sections:[[0,'cube',1,2],[24,'ship',1,1],[40,'cube',-1,4],[56,'cube',1,0],[80,'wave',1,1],[96,'cube',1,3]],ring:66},
  {id:'voltage',name:'Voltage',subtitle:'A little closer to impossible',bpm:144,key:50,stars:6,difficulty:'HARD',beats:128,
    sections:[[0,'cube',1,3],[24,'wave',1,2],[40,'cube',1,0],[64,'ship',1,1],[80,'cube',-1,4],[96,'cube',1,3]],ring:106}
];
const patterns = [0,1,0,2,3,1,4,2,0,3,1,2,4,0,2,3];
export function makeLevel(index = 0) {
  const p = PROFILES[clamp(index|0,0,2)];
  const beat = 60 / p.bpm;
  const level = {...p, index, beat, speed:SPEED, duration:p.beats*beat, objects:[], jumps:[], custom:false};
  level.sections = p.sections.map((s,i) => ({beat:s[0],t:s[0]*beat,x:s[0]*beat*SPEED,
    end:(p.sections[i+1]?.[0]??p.beats)*beat,mode:s[1],gravity:s[2],theme:s[3]}));
  const add = (o) => {o.id=level.objects.length; level.objects.push(o);return o;};
  for (let si=0;si<level.sections.length;si++) {
    const s=level.sections[si];
    if(si) add({type:'portal',x:s.x,y:CEILING+40,w:38,h:FLOOR-CEILING-60,mode:s.mode,gravity:s.gravity,theme:s.theme});
    if(s.mode==='cube') {
      const endBeat=s.end/beat;
      for(let b=s.beat+4,k=0;b<endBeat-2;b+=2,k++) {
        if(p.pad && b>=p.pad-2 && b<=p.pad+4) continue;
        if(p.ring && b>=p.ring-2 && b<=p.ring+4) continue;
        const t=b*beat, x=t*SPEED;
        level.jumps.push({t,kind:'jump'});
        const pattern=patterns[(k+index*3)%patterns.length];
        const spike=(dx)=>add({type:'spike',x:x+dx,y:s.gravity===1?FLOOR-37:CEILING,w:36,h:37,flip:s.gravity===-1});
        const block=(dx,w,h)=>add({type:'block',x:x+dx,y:s.gravity===1?FLOOR-h:CEILING,w,h});
        if(pattern===0) spike(88);
        if(pattern===1) {spike(66);spike(102);}
        if(pattern===2) {spike(56);spike(92);spike(128);}
        if(pattern===3) block(83,82,40);
        if(pattern===4) {block(65,40,40);block(105,48,80);}
      }
    } else {
      for(let t=s.t+1.6;t<s.end-.9;t+=1.12) {
        const center=flightTarget(s,t),half=s.mode==='wave'?116:110;
        add({type:'block',x:t*SPEED,y:CEILING,w:42,h:Math.max(8,center-half-CEILING)});
        add({type:'block',x:t*SPEED,y:center+half,w:42,h:Math.max(8,FLOOR-center-half)});
        if(index>0) add({type:'saw',x:(t+.57)*SPEED,y:(Math.round((t-s.t)/1.12)%2?CEILING+28:FLOOR-28),r:22,w:44,h:44});
      }
      add({type:'label',x:s.x+150,y:CEILING+50,text:s.mode==='ship'?'HOLD TO FLY':'HOLD / RELEASE',w:0,h:0});
    }
  }
  if(p.pad) {
    const t=p.pad*beat;
    add({type:'pad',x:t*SPEED,y:FLOOR-7,w:36,h:7});
    add({type:'block',x:(t+.37)*SPEED,y:FLOOR-120,w:64,h:120});
    add({type:'label',x:t*SPEED-100,y:FLOOR-152,text:'JUMP PAD',w:0,h:0});
  }
  if(p.ring) {
    const t=p.ring*beat;
    level.jumps.push({t,kind:'jump'},{t:t+.30,kind:'orb'});
    add({type:'orb',x:(t+.30)*SPEED,y:FLOOR-132,r:18,w:36,h:36});
    add({type:'block',x:(t+.67)*SPEED,y:FLOOR-172,w:60,h:172});
    add({type:'label',x:t*SPEED-70,y:FLOOR-222,text:'TAP THE ORB',w:0,h:0});
  }
  level.jumps.sort((a,b)=>a.t-b.t);
  const candidates=level.jumps.filter(j=>j.kind==='jump');
  const picks=[.18,.53,.82].map(f=>candidates[Math.floor((candidates.length-1)*f)]);
  for(let i=0;i<picks.length;i++) {
    const t=picks[i].t+.28,s=sectionAt(level,t);
    add({type:'coin',x:t*SPEED,y:s.gravity===1?FLOOR-129:CEILING+129,r:15,w:30,h:30,coin:i});
  }
  level.objects.sort((a,b)=>a.x-b.x);
  return level;
}
export function sectionAt(level,t) {
  let s=level.sections[0];
  for(const next of level.sections) {if(next.t>t+1e-7) break;s=next;}
  return s;
}
export function flightTarget(s,t) {return (FLOOR+CEILING)/2 + Math.sin((t-s.t)*.82)*45;}
function aabb(a,b) {return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function circleRect(cx,cy,r,b) {
  const dx=cx-clamp(cx,b.x,b.x+b.w),dy=cy-clamp(cy,b.y,b.y+b.h);
  return dx*dx+dy*dy<r*r;
}
/** Separating-axis test avoids the rectangular spike-hitbox problem. */
export function triangleRect(tri,r) {
  const box=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
  const axes=[[1,0],[0,1]];
  for(let i=0;i<3;i++) {const a=tri[i],b=tri[(i+1)%3];axes.push([b[1]-a[1],a[0]-b[0]]);}
  return axes.every(([x,y])=>{
    const p=tri.map(v=>v[0]*x+v[1]*y),q=box.map(v=>v[0]*x+v[1]*y);
    return Math.max(...p)>Math.min(...q)&&Math.max(...q)>Math.min(...p);
  });
}
export class World {
  constructor(level) {this.level=level;this.reset();}
  reset(snapshot) {
    this.t=0;this.x=0;this.y=FLOOR-SIZE/2;this.vy=0;this.angle=0;
    this.mode='cube';this.gravity=1;this.theme=this.level.sections[0].theme;
    this.grounded=true;this.dead=false;this.won=false;this.coins=0;this.jumps=0;
    this.consumed=new Set();this.events=[];this.lastJump=-10;this.lastPress=-10;
    this.lastSection=0;this.held=false;this.deadObject=null;this.safeFor=0;
    if(snapshot) {
      for(const k of ['t','x','y','vy','angle','mode','gravity','theme','grounded','coins','jumps','lastSection','lastJump']) this[k]=snapshot[k];
      this.consumed=new Set(snapshot.consumed);this.held=false;this.lastPress=-10;
    }
  }
  snapshot() {
    const s={};for(const k of ['t','x','y','vy','angle','mode','gravity','theme','grounded','coins','jumps','lastSection','lastJump']) s[k]=this[k];
    s.consumed=[...this.consumed];return s;
  }
  emit(type,other={}) {this.events.push({type,t:this.t,x:this.x,y:this.y,...other});if(this.events.length>160)this.events.shift();}
  fail(object) {if(this.dead||this.won)return;this.dead=true;this.deadObject=object?.id??object;this.emit('death');}
  step(dt=STEP, held=false, pressed=false) {
    if(this.dead||this.won) return;
    dt=clamp(dt,0,1/120);this.t+=dt;this.x=this.t*this.level.speed;
    const section=sectionAt(this.level,this.t),si=this.level.sections.indexOf(section);
    if(si!==this.lastSection) {
      const oldMode=this.mode,oldGravity=this.gravity;
      this.lastSection=si;this.mode=section.mode;this.gravity=section.gravity;this.theme=section.theme;
      if(this.mode!=='cube') {this.y=clamp(this.y,CEILING+70,FLOOR-65);this.vy=oldMode==='cube'?-140:this.vy;}
      if(this.mode==='wave') {this.y=(FLOOR+CEILING)/2;this.vy=0;}
      if(this.mode==='cube'&&(oldMode!=='cube'||oldGravity!==this.gravity)) {
        this.y=this.gravity===1?FLOOR-SIZE/2:CEILING+SIZE/2;this.vy=0;this.grounded=true;this.angle=0;
      }
      this.emit('portal',{mode:this.mode,gravity:this.gravity});
    }
    if(pressed)this.lastPress=this.t;
    this.held=held;
    const nearby=this.level.objects.filter(o=>o.x+(o.w||o.r||0)>this.x-80&&o.x<this.x+100);
    if(this.mode==='cube') {
      const orb=nearby.find(o=>o.type==='orb'&&!this.consumed.has(o.id)&&Math.hypot(o.x-this.x,o.y-this.y)<SIZE/2+o.r+6);
      if(orb && pressed) {this.vy=-760*this.gravity;this.grounded=false;this.consumed.add(orb.id);this.lastPress=-10;this.emit('orb');}
      else if(this.grounded&&(held||this.t-this.lastPress<=.055)) {
        this.vy=-JUMP*this.gravity;this.grounded=false;this.jumps++;this.lastJump=this.t;this.lastPress=-10;this.emit('jump');
      }
    }
    const prevY=this.y;
    if(this.mode==='ship') {this.vy=clamp(this.vy+(held?-1150:950)*dt,-340,340);this.y+=this.vy*dt;this.angle=Math.atan2(this.vy,this.level.speed)*.65;}
    else if(this.mode==='wave') {this.vy=(held?-1:1)*this.level.speed*.95;this.y+=this.vy*dt;this.angle=held?-Math.PI/4:Math.PI/4;}
    else {this.vy+=GRAVITY*this.gravity*dt;this.y+=this.vy*dt;if(!this.grounded)this.angle+=this.gravity*7.5*dt;}
    this.grounded=false;
    const half=SIZE/2,hitHalf=this.mode==='ship'?12:13;
    if(this.mode==='cube') {
      if(this.gravity===1&&this.y+half>=FLOOR) {this.y=FLOOR-half;this.vy=0;this.grounded=true;}
      if(this.gravity===-1&&this.y-half<=CEILING) {this.y=CEILING+half;this.vy=0;this.grounded=true;}
      if(this.y<-100||this.y>H+100) this.fail('bounds');
    } else if(this.y-hitHalf<CEILING||this.y+hitHalf>FLOOR) this.fail('corridor');
    for(const o of nearby) {
      if(this.dead) break;
      const hit={x:this.x-hitHalf,y:this.y-hitHalf,w:hitHalf*2,h:hitHalf*2};
      if(o.type==='coin'&&!this.consumed.has(o.id)&&circleRect(o.x,o.y,o.r+4,hit)) {
        this.consumed.add(o.id);this.coins|=1<<o.coin;this.emit('coin',{coin:o.coin});
      }
      if(o.type==='pad'&&this.mode==='cube'&&!this.consumed.has(o.id)&&this.x>=o.x-8&&this.x<o.x+o.w&&this.y+half>=FLOOR-10) {
        this.vy=-1000;this.grounded=false;this.consumed.add(o.id);this.lastJump=this.t;this.emit('pad');
      }
      if(o.type==='block') {
        const footOverlap=this.x+half-3>o.x&&this.x-half+3<o.x+o.w;
        if(this.mode==='cube'&&footOverlap&&this.gravity===1&&this.vy>=0&&prevY+half<=o.y+3&&this.y+half>=o.y) {
          this.y=o.y-half;this.vy=0;this.grounded=true;
        } else if(this.mode==='cube'&&footOverlap&&this.gravity===-1&&this.vy<=0&&prevY-half>=o.y+o.h-3&&this.y-half<=o.y+o.h) {
          this.y=o.y+o.h+half;this.vy=0;this.grounded=true;
        } else if(aabb(hit,o)) this.fail(o);
      }
      if(o.type==='spike') {
        const tri=o.flip?[[o.x,o.y],[o.x+o.w,o.y],[o.x+o.w/2,o.y+o.h]]:[[o.x,o.y+o.h],[o.x+o.w,o.y+o.h],[o.x+o.w/2,o.y]];
        if(triangleRect(tri,hit))this.fail(o);
      }
      if(o.type==='saw'&&circleRect(o.x,o.y,o.r-3,hit)) this.fail(o);
    }
    if(this.grounded) this.angle+=(Math.round(this.angle/(Math.PI/2))*Math.PI/2-this.angle)*Math.min(1,dt*34);
    this.safeFor=this.grounded&&!nearby.some(o=>['spike','saw','pad','orb'].includes(o.type)&&Math.abs(o.x-this.x)<80)?this.safeFor+dt:0;
    if(this.t>=this.level.duration&&!this.dead) {this.t=this.level.duration;this.x=this.t*this.level.speed;this.won=true;this.emit('win');}
  }
}
/** Visible preview controller: normal collisions, never invulnerability or player records. */
export function previewInput(world) {
  const s=sectionAt(world.level,world.t);
  if(world.mode==='ship')return world.y+world.vy*.19>flightTarget(s,world.t);
  if(world.mode==='wave')return world.y>flightTarget(s,world.t);
  return world.level.jumps.some(j=>world.t>=j.t-STEP/2&&world.t<j.t+.028);
}
export function verifyLevel(level) {
  const w=new World(level);let prev=false,steps=0;
  while(!w.dead&&!w.won&&steps++<level.duration/STEP+10) {const down=previewInput(w);w.step(STEP,down,down&&!prev);prev=down;}
  return {id:level.id,won:w.won,dead:w.dead,t:w.t,progress:Math.round(w.t/level.duration*100),deadObject:w.deadObject,coins:w.coins,jumps:w.jumps};
}
export function blankLevel() {
  return {id:'custom',name:'My Level',subtitle:'Your rhythm. Your rules.',bpm:128,key:52,stars:0,difficulty:'CUSTOM',beats:64,index:0,speed:SPEED,beat:60/128,duration:64*60/128,
    custom:true,sections:[{beat:0,t:0,x:0,end:30,mode:'cube',gravity:1,theme:0}],objects:[],jumps:[]};
}
/** Imported levels are data, never executable code or arbitrary URLs. */
export function validateCustom(data) {
  if(!data||typeof data!=='object'||!Array.isArray(data.objects))throw new Error('This is not a level file.');
  if(data.objects.length>1800)throw new Error('A level can contain at most 1,800 objects.');
  const l=blankLevel();l.name=String(data.name||'My Level').replace(/[<>]/g,'').slice(0,32);
  l.bpm=clamp(Number(data.bpm)||128,80,180);l.beats=clamp(Math.round(Number(data.beats)||64),16,160);
  l.beat=60/l.bpm;l.duration=l.beats*l.beat;l.sections[0].end=l.duration;
  let coins=0;
  l.objects=data.objects.map((o,id)=>{
    if(!o||!['block','spike','saw','orb','pad','coin'].includes(o.type))throw new Error('Unsupported object type.');
    for(const k of ['x','y'])if(typeof o[k]!=='number'||!Number.isFinite(o[k]))throw new Error('Coordinates must be finite numbers.');
    const v={id,type:o.type,x:clamp(Math.round(o.x),160,l.duration*SPEED-100),y:clamp(Math.round(o.y),CEILING,FLOOR-5),
      w:clamp(Number(o.w)||40,8,240),h:clamp(Number(o.h)||40,5,240),r:clamp(Number(o.r)||18,8,50)};
    if(v.type==='coin'){if(coins>=3)throw new Error('Use at most three coins.');v.coin=coins++;}
    if(v.type==='pad'){v.y=FLOOR-7;v.h=7;}
    return v;
  }).sort((a,b)=>a.x-b.x);
  return l;
}
