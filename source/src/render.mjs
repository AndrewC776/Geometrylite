import {W,H,FLOOR,CEILING,SIZE,THEMES,clamp} from './engine.mjs';
export const PALETTE=['#8eff2b','#25e6ed','#ff4bc8','#ffe62f','#ff823c','#aa70ff','#ffffff','#37a7ff','#ff4545','#40ffb4'];
export function drawCube(c,x,y,size=34,angle=0,primary=PALETTE[0],secondary=PALETTE[1],icon=0){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(size/34,size/34);c.lineJoin='miter';c.lineWidth=2.5;
 c.fillStyle=primary;c.strokeStyle='#091313';c.fillRect(-17,-17,34,34);c.strokeRect(-17,-17,34,34);
 c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1;c.strokeRect(-14.5,-14.5,29,29);c.strokeStyle='#07100e';c.lineWidth=2;c.fillStyle=secondary;
 if(icon===1){c.fillRect(-10,-10,20,20);c.strokeRect(-10,-10,20,20);c.fillStyle=primary;c.fillRect(-4,-4,8,8);c.strokeRect(-4,-4,8,8);}
 else if(icon===2){c.beginPath();c.moveTo(0,-12);c.lineTo(12,0);c.lineTo(0,12);c.lineTo(-12,0);c.closePath();c.fill();c.stroke();c.fillStyle='#091313';c.fillRect(-3,-3,6,6);}
 else if(icon===3){c.fillRect(-11,-10,8,10);c.strokeRect(-11,-10,8,10);c.fillRect(3,-10,8,10);c.strokeRect(3,-10,8,10);c.fillStyle='#091313';c.fillRect(-11,7,22,4);c.fillRect(-2,2,4,7);}
 else if(icon===4){c.fillRect(-11,-11,22,7);c.strokeRect(-11,-11,22,7);c.fillRect(-11,4,22,7);c.strokeRect(-11,4,22,7);c.fillStyle=primary;c.fillRect(-3,-15,6,30);}
 else if(icon===5){c.beginPath();c.moveTo(-12,-8);c.lineTo(-2,-3);c.lineTo(-11,2);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(12,-8);c.lineTo(2,-3);c.lineTo(11,2);c.closePath();c.fill();c.stroke();c.fillRect(-7,7,14,4);c.strokeRect(-7,7,14,4);}
 else{c.fillRect(-10,-8,7,8);c.strokeRect(-10,-8,7,8);c.fillRect(3,-8,7,8);c.strokeRect(3,-8,7,8);c.fillRect(-9,7,18,5);c.strokeRect(-9,7,18,5);}
 c.restore();
}
export function cubeSVG(primary,secondary,icon=0){
 const faces=['<path d="M18 20h10v11H18zm24 0h-10v11h10zM19 41h26v7H19z"/>','<path fill-rule="evenodd" d="M17 17h30v30H17zm9 9v12h12V26z"/>','<path d="M32 14l18 18-18 18-18-18z"/><path fill="'+primary+'" d="M28 28h8v8h-8z"/>','<path d="M17 17h11v15H17zm19 0h11v15H36zM18 43h28v5H18zM29 36h6v7h-6z"/>','<path d="M16 17h32v10H16zm0 22h32v10H16z"/><path fill="'+primary+'" stroke="none" d="M28 10h8v44h-8z"/>','<path d="M15 19l16 9-15 7zm34 0l-16 9 15 7zM22 43h20v6H22z"/>'];
 return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="7" y="7" width="50" height="50" fill="${primary}" stroke="#071410" stroke-width="5"/><rect x="11" y="11" width="42" height="42" fill="none" stroke="#fff" stroke-opacity=".5"/><g fill="${secondary}" stroke="#08130d" stroke-width="3">${faces[icon%faces.length]}</g></svg>`;
}
function path(c,points,fill,stroke,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function star(c,x,y,r,fill,stroke,points=5,inner=.45,rotation=-Math.PI/2){const p=[];for(let i=0;i<points*2;i++){const a=rotation+i*Math.PI/points,rr=i%2?r*inner:r;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}path(c,p,fill,stroke);}
export class Renderer {
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.particles=[];this.trace=[];this.hue=222;this.last=0;this.flash=0;this.shake=0;}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(globalThis.devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.round(r.width*d));this.canvas.height=Math.max(1,Math.round(r.height*d));}
 burst(event,primary){const count=event.type==='death'?42:event.type==='coin'?22:12;
  for(let i=0;i<count;i++){const a=i*2.39996,sp=event.type==='death'?80+(i%9)*28:35+(i%7)*18;this.particles.push({x:event.x,y:event.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:event.type==='death'?1.8:2.3,size:3+i%4,color:event.type==='coin'?'#ffe839':i%4?primary:'#ffffff'});}
  if(event.type==='death'){this.shake=.3;this.flash=.12;}if(event.type==='portal')this.flash=.2;
 }
 background(h,t,scroll){const c=this.c,g=c.createLinearGradient(0,0,0,FLOOR);g.addColorStop(0,`hsl(${h} 96% 24%)`);g.addColorStop(.58,`hsl(${h} 98% 37%)`);g.addColorStop(1,`hsl(${h} 100% 45%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
  const tiles=[[0,-30,185,145],[197,-80,200,280],[409,-40,260,137],[680,-30,124,234],[816,-28,206,135],[-32,128,142,220],[122,127,262,145],[400,111,255,248],[669,218,148,205],[831,121,220,228],[120,288,265,176],[0,364,110,124],[395,375,250,138]],shift=(scroll*.17)%1060;
  for(let repeat=-1;repeat<2;repeat++)for(const[x,y,w,h0]of tiles){const xx=x+repeat*1060-shift;c.fillStyle='rgba(0,0,0,.11)';c.fillRect(xx,y,w,h0);c.strokeStyle='rgba(0,0,0,.10)';c.lineWidth=6;c.strokeRect(xx,y,w,h0);c.strokeStyle='rgba(255,255,255,.045)';c.lineWidth=2;c.strokeRect(xx+6,y+6,w-12,h0-12);}
  path(c,[[0,25],[W,350],[W,414],[0,92]],'rgba(0,0,0,.055)');path(c,[[0,285],[W,450],[W,490],[0,360]],'rgba(255,255,255,.018)');
  for(let i=0;i<17;i++){const x=((i*167.7-scroll*.10)%1020+1020)%1020-30,y=35+(i*79.3)%345;c.globalAlpha=.08+.07*Math.sin(t*1.6+i);c.fillStyle='#fff';c.fillRect(x,y,3+(i%2)*2,3+(i%2)*2);}c.globalAlpha=1;
 }
 ground(h,scroll,ceiling=false){const c=this.c,y=ceiling?0:FLOOR,height=ceiling?CEILING:H-FLOOR;
  const g=c.createLinearGradient(0,y,0,y+height);g.addColorStop(0,`hsl(${h} 88% ${ceiling?16:29}%)`);g.addColorStop(1,`hsl(${h} 90% ${ceiling?29:14}%)`);c.fillStyle=g;c.fillRect(0,y,W,height);const shift=((scroll*.9)%80+80)%80;
  for(let x=-80-shift;x<W+80;x+=80)for(let yy=y+10;yy<y+height;yy+=66){c.strokeStyle='rgba(0,0,0,.32)';c.lineWidth=3;c.strokeRect(x+5,yy,70,55);c.strokeStyle='rgba(255,255,255,.10)';c.lineWidth=1;c.strokeRect(x+9,yy+4,62,47);c.fillStyle='rgba(0,0,0,.12)';c.fillRect(x+16,yy+11,48,32);}
  const line=ceiling?CEILING:FLOOR;c.fillStyle='#eaffff';c.fillRect(0,line-1,W,2);c.fillStyle='rgba(130,220,255,.22)';c.fillRect(0,line-4,W,3);
 }
 object(o,cam,t,h,consumed,editor=false){const c=this.c,x=o.x-cam,y=o.y;
  if(x+(o.w||o.r||0)<-60||x>W+80)return;if(['coin','orb','pad'].includes(o.type)&&consumed?.has(o.id)&&!editor)return;c.save();c.lineJoin='miter';
  if(o.type==='block'){
   const g=c.createLinearGradient(0,y,0,y+Math.min(o.h,100));g.addColorStop(0,'#020309');g.addColorStop(1,`hsl(${h} 83% 17%)`);c.fillStyle=g;c.fillRect(x,y,o.w,o.h);c.strokeStyle=`hsla(${h} 100% 70% / .28)`;c.lineWidth=1;
   for(let xx=x+40;xx<x+o.w;xx+=40){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y+o.h);c.stroke();}for(let yy=y+40;yy<y+o.h;yy+=40){c.beginPath();c.moveTo(x,yy);c.lineTo(x+o.w,yy);c.stroke();}
   c.strokeStyle='#f3ffff';c.lineWidth=2;c.shadowColor='#9fceff';c.shadowBlur=3;c.strokeRect(x+.5,y+.5,o.w-1,o.h-1);c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.13)';c.lineWidth=1;c.strokeRect(x+4,y+4,o.w-8,o.h-8);
   if(o.h>=80&&o.w<80){c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x+5,y+5,4,4);}
  }else if(o.type==='spike'){
   const g=c.createLinearGradient(0,y,0,y+o.h);g.addColorStop(0,'#020205');g.addColorStop(.6,'#07040c');g.addColorStop(1,`hsl(${h} 80% 23%)`);
   const pts=o.flip?[[x,y],[x+o.w,y],[x+o.w/2,y+o.h]]:[[x,y+o.h],[x+o.w,y+o.h],[x+o.w/2,y]];
   c.shadowColor='#a8d9ff';c.shadowBlur=3;path(c,pts,g,'#fff',2);c.shadowBlur=0;
   if(!o.flip)path(c,[[x+10,y+o.h-5],[x+o.w-10,y+o.h-5],[x+o.w/2,y+11]],null,'rgba(255,255,255,.12)',1);
  }else if(o.type==='saw'){
   star(c,x,y,o.r,'#030411','#edfaff',12,.73,t*1.7);c.beginPath();c.arc(x,y,o.r*.47,0,Math.PI*2);c.fillStyle=`hsl(${h} 75% 32%)`;c.fill();c.strokeStyle='#bfefff';c.lineWidth=2;c.stroke();c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fillStyle='#fff';c.fill();
  }else if(o.type==='coin'){
   const sx=Math.max(.42,Math.abs(Math.cos(t*1.8+o.coin)));c.translate(x,y);c.scale(sx,1);c.shadowColor='#ffe455';c.shadowBlur=10;c.beginPath();c.arc(0,0,o.r,0,Math.PI*2);c.fillStyle='#e8a817';c.fill();c.lineWidth=2.5;c.strokeStyle='#563506';c.stroke();c.shadowBlur=0;
   c.beginPath();c.arc(0,0,o.r-4,0,Math.PI*2);c.strokeStyle='#ffe97a';c.lineWidth=1.5;c.stroke();star(c,0,0,o.r-6,'#fff29a','#916608',5,.47);
  }else if(o.type==='orb'){
   c.fillStyle='rgba(255,224,40,.09)';c.beginPath();c.arc(x,y,o.r+9+Math.sin(t*5)*3,0,Math.PI*2);c.fill();c.strokeStyle='rgba(255,235,70,.65)';c.lineWidth=1;c.stroke();c.beginPath();c.arc(x,y,o.r,0,Math.PI*2);c.strokeStyle='#fff';c.lineWidth=2;c.stroke();c.beginPath();c.arc(x,y,o.r-5,0,Math.PI*2);c.fillStyle='#fff531';c.fill();c.strokeStyle='#aa931a';c.stroke();
   for(let i=0;i<4;i++){const a=t*2+i*Math.PI/2;c.fillStyle='#fff78d';c.fillRect(x+Math.cos(a)*(o.r+6)-2,y+Math.sin(a)*(o.r+6)-2,3,3);}
  }else if(o.type==='pad'){
   c.beginPath();c.ellipse(x+o.w/2,y+o.h,o.w/2,11,0,Math.PI,Math.PI*2);c.fillStyle='#ffe930';c.shadowColor='#ffdb17';c.shadowBlur=12;c.fill();c.strokeStyle='#fff9ae';c.lineWidth=2;c.stroke();c.shadowBlur=0;c.fillStyle='rgba(255,233,38,.22)';c.fillRect(x+5,y-10-Math.sin(t*6)*4,o.w-10,3);
  }else if(o.type==='portal'){
   const col=o.mode==='ship'?'#ff91f1':o.mode==='wave'?'#5bffff':o.gravity===-1?'#ffe642':'#66ff58',cy=CEILING+(FLOOR-CEILING)/2;
   c.translate(x+17,cy);c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.ellipse(0,0,22,92,0,0,Math.PI*2);c.fill();c.strokeStyle=col;c.lineWidth=5;c.shadowColor=col;c.shadowBlur=9;c.stroke();c.shadowBlur=0;c.beginPath();c.ellipse(8,0,22,92,0,0,Math.PI*2);c.strokeStyle='#fff';c.lineWidth=1;c.stroke();
   for(let i=0;i<12;i++){const a=t*1.8+i*Math.PI/6;c.fillStyle=col;c.beginPath();c.arc(Math.cos(a)*22,Math.sin(a)*91,3.5,0,Math.PI*2);c.fill();}c.fillStyle=col;for(let i=-1;i<=1;i++)path(c,[[-6,i*27-8],[5,i*27],[-6,i*27+8]],null,col,3);
  }else if(o.type==='label'){c.font='900 17px "Arial Black",sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.6)';c.strokeText(o.text,x,y);c.fillStyle='rgba(255,255,255,.75)';c.fillText(o.text,x,y);}
  c.restore();
 }
 player(s,x,t,colors,icon){const c=this.c,[p,q]=colors;
  if(s.mode==='cube')drawCube(c,x,s.y,SIZE,s.angle,p,q,icon);
  else if(s.mode==='ship'){c.save();c.translate(x,s.y);c.rotate(s.angle);const length=24+(Math.sin(t*57)+1)*6;path(c,[[-19,-6],[-19-length,1],[-19,9]],'#ffb735',null);path(c,[[-20,-3],[-19-length*.67,1],[-20,5]],'#fffcb0',null);
   path(c,[[-25,-2],[12,-2],[25,2],[10,15],[-14,15],[-24,9]],p,'#061214',3);path(c,[[-14,3],[10,3],[3,10],[-9,10]],q,'#082018',1.5);drawCube(c,-1,-8,20,0,p,q,icon);c.restore();
  }else if(s.mode==='wave'){c.save();c.translate(x,s.y);c.rotate(s.angle);path(c,[[-16,-12],[18,0],[-16,12],[-8,0]],p,'#092315',3);path(c,[[-9,-6],[10,0],[-9,6],[-4,0]],'#eafffb',null);c.restore();}
 }
 draw(game,now){
  const c=this.c,dt=Math.min(.04,(now-this.last)||.016);this.last=now;c.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);
  const active=['game','pause','result'].includes(game.screen),editing=game.screen==='editor',world=active?game.world:null,level=editing?game.custom:game.level;
  const target=THEMES[world?.theme??level?.sections?.[0]?.theme??0].h;this.hue+=(((target-this.hue+540)%360)-180)*Math.min(1,dt*2.5);
  const scroll=editing?game.editorX:world?world.x:now*34,cam=editing?game.editorX:(world?world.x-224:scroll-224);
  c.save();if(this.shake>0&&!game.settings.reducedMotion){c.translate(Math.sin(now*120)*this.shake*10,Math.cos(now*99)*this.shake*7);this.shake=Math.max(0,this.shake-dt);}this.background(this.hue,now,scroll);
  if(editing){
   c.fillStyle='rgba(0,0,0,.24)';c.fillRect(0,0,W,FLOOR);c.lineWidth=1;c.strokeStyle='rgba(220,242,255,.16)';
   for(let x=-((cam)%40);x<W;x+=40){c.beginPath();c.moveTo(x,48);c.lineTo(x,FLOOR);c.stroke();}for(let y=CEILING;y<FLOOR;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
   const unit=level.beat*level.speed;for(let b=Math.floor(cam/unit);b<(cam+W)/unit;b++){const x=b*unit-cam;c.fillStyle='rgba(255,255,255,.45)';c.font='12px sans-serif';c.fillText(String(b+1),x+3,78);}
   for(const o of level.objects)this.object(o,cam,now,this.hue,null,true);drawCube(c,80-cam,FLOOR-17,34,0,...game.colors,game.settings.icon);
  }else if(world){
   if(!world.dead&&game.screen==='game'){this.trace.push({x:world.x,y:world.y,mode:world.mode});if(this.trace.length>55)this.trace.shift();}
   if(game.settings.particles){
    if(world.mode==='wave'){c.beginPath();const points=this.trace.filter(p=>p.mode==='wave');points.forEach((p,i)=>i?c.lineTo(p.x-cam,p.y):c.moveTo(p.x-cam,p.y));c.strokeStyle=game.colors[0];c.lineWidth=8;c.stroke();c.strokeStyle='#edffff';c.lineWidth=3;c.stroke();}
    else for(let i=0;i<this.trace.length;i+=3){const p=this.trace[i];c.globalAlpha=i/this.trace.length*.30;c.fillStyle=game.colors[0];const size=2+i/this.trace.length*4;c.fillRect(p.x-cam-size/2,p.y+9,size,size);}c.globalAlpha=1;
   }
   for(const o of level.objects)this.object(o,cam,now,this.hue,world.consumed);
   if(game.practice&&game.checkpoints.length)for(const cp of game.checkpoints){const x=cp.x-cam;if(x>-20&&x<W)star(c,x,FLOOR-18,10,'#6aff79','#fff',4,.55,0);}
   if(!world.dead)this.player(world,224,now,game.colors,game.settings.icon);
  }else{
   const xx=740-(scroll%1400);this.object({type:'spike',x:xx+cam,y:FLOOR-37,w:36,h:37},cam,now,this.hue);this.object({type:'spike',x:xx+40+cam,y:FLOOR-37,w:36,h:37},cam,now,this.hue);this.object({type:'block',x:xx+330+cam,y:FLOOR-80,w:80,h:80},cam,now,this.hue);
   const cycle=(now%3)/3,jump=cycle<.24?Math.sin(cycle/.24*Math.PI)*102:0;drawCube(c,145,FLOOR-17-jump,34,cycle<.24?cycle/.24*Math.PI*2:0,...game.colors,game.settings.icon);
  }
  if(game.settings.particles)for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt*p.decay;if(p.life<=0){this.particles.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=190*dt;c.globalAlpha=p.life;c.fillStyle=p.color;c.fillRect(p.x-cam,p.y,p.size,p.size);}c.globalAlpha=1;
  this.ground(this.hue,scroll);if(world&&(world.mode!=='cube'||world.gravity===-1))this.ground(this.hue,scroll,true);
  if(world&&world.t<1.6&&!world.dead){c.font='900 38px "Arial Black",sans-serif';c.textAlign='center';c.strokeStyle='#0b152a';c.lineWidth=6;const text=`ATTEMPT ${game.attempt}`;c.strokeText(text,W/2,FLOOR-145);c.fillStyle='#fff';c.fillText(text,W/2,FLOOR-145);}
  if(world?.dead){const age=Math.max(0,now-game.deathAt),alpha=clamp((age-.10)*5,0,1);c.globalAlpha=alpha;c.textAlign='center';c.font='900 52px "Arial Black",sans-serif';c.lineWidth=7;c.strokeStyle='#17112c';c.strokeText(game.newBest?'NEW BEST!':'TRY AGAIN',W/2,235);c.fillStyle=game.newBest?'#c1ff35':'#fff';c.fillText(game.newBest?'NEW BEST!':'TRY AGAIN',W/2,235);c.font='900 25px sans-serif';c.lineWidth=4;const text=`${Math.floor(world.t/level.duration*100)}%`;c.strokeText(text,W/2,278);c.fillStyle='#fff';c.fillText(text,W/2,278);c.globalAlpha=1;}
  if(this.flash>0){if(!game.settings.reducedMotion){c.fillStyle=`rgba(255,255,255,${Math.min(.06,this.flash*.25)})`;c.fillRect(0,0,W,H);}this.flash=Math.max(0,this.flash-dt);}c.restore();
 }
}
