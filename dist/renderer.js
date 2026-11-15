import { ART } from './asset-manifest.js?v=0.2';
import { character } from './combat.js?v=0.2';
const TAU = Math.PI * 2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const projectileKeys={savior:'proj_savior_lightning_spear',ignis:'proj_ignis_hellfire_meteor',glacia:'proj_glacia_ice_lance',aether_x:'proj_aether_x_plasma_orb',malakor:'proj_malakor_obsidian_chain_wave'};
export class AssetBank {
  constructor(){ this.images=new Map();this.loading=new Map(); }
  load(path){
    if(this.loading.has(path))return this.loading.get(path);
    const promise=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.images.set(path,img);resolve(img);};img.onerror=()=>reject(new Error(`Tasvir yuklanmadi: ${path}`));img.src=path;});
    this.loading.set(path,promise);return promise;
  }
  image(path){return this.images.get(path);}
  async preload(onProgress){
    const paths=[ART.ui.menuBackground,ART.ui.tower,...Object.values(ART.fighters).flatMap(f=>[f.atlas,f.portrait,f.hero]),...ART.stages.flatMap(s=>[s.full||s.background,s.thumb]),...Object.values(ART.vfx)];
    let count=0;await Promise.all([...new Set(paths)].map(async p=>{await this.load(p);count++;onProgress(count/paths.length);}));onProgress(1);
  }
}
export class Renderer {
  constructor(canvas,assets,settings){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.assets=assets;this.settings=settings;this.time=0;this.particles=[];this.shake=0;this.flash=0;this.width=1440;this.height=810;this.resize();window.addEventListener('resize',()=>this.resize());}
  resize(){this.width=this.canvas.clientWidth;this.height=this.canvas.clientHeight;const dpr=Math.min(window.devicePixelRatio||1,this.settings.quality==='high'?2:1.5);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.dpr=dpr;}
  effect(e){
    if(['hit','block','cinematicImpact'].includes(e.type)){
      const heavy=e.heavy||e.type==='cinematicImpact';this.shake=this.settings.shake?(heavy?12:5):0;this.flash=heavy?.11:.045;
      const count=e.type==='cinematicImpact'?100:heavy?28:16;
      for(let i=0;i<count;i++) {const angle=Math.random()*TAU,speed=(heavy?390:250)*(.2+Math.random());this.particles.push({x:e.x||785,y:810*.86-(e.y||160),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.25+Math.random()*(heavy?1.3:.35),max:1.5,size:heavy?1.7+Math.random()*4:1+Math.random()*2,color:e.type==='block'?'#d7e8ff':e.color||'#e9c98d'});}
    }
  }
  draw(dt,{screen,fight,stage=0,p1='savior',p2='ignis'}){
    this.time+=dt;const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#080f15';c.fillRect(0,0,this.width,this.height);
    this.shake=Math.max(0,this.shake-dt*35);this.flash=Math.max(0,this.flash-dt);
    if(screen==='game'&&fight){
      const scale=Math.min(this.width/1440,this.height/810);const ox=(this.width-1440*scale)/2,oy=(this.height-810*scale)/2;
      // Extend the arena color into letterboxing without distorting the combat plane.
      const bg=this.assets.image(ART.stages[stage].background);if(bg){c.globalAlpha=.16;this.cover(bg,0,0,this.width,this.height);c.globalAlpha=1;}
      c.save();c.translate(ox,oy);c.scale(scale,scale);c.beginPath();c.rect(0,0,1440,810);c.clip();
      const sx=this.settings.shake?Math.sin(this.time*180)*this.shake:0,sy=this.settings.shake?Math.cos(this.time*140)*this.shake*.4:0;c.translate(sx,sy);
      this.arena(stage,fight,dt);c.restore();
    }else{
      c.save();c.scale(this.width/1440,this.height/810);this.menu(screen,stage,p1,p2);c.restore();
    }
  }
  cover(img,x,y,w,h){const k=Math.max(w/img.width,h/img.height);this.ctx.drawImage(img,x+(w-img.width*k)/2,y+(h-img.height*k)/2,img.width*k,img.height*k);}
  menu(screen,stage,p1,p2){
    const c=this.ctx,t=this.time;
    if(screen==='select'){
      const st=ART.stages[stage],bg=this.assets.image(st.full||st.background);if(bg)c.drawImage(bg,0,0,1440,810);
      c.fillStyle='#07131a9c';c.fillRect(0,0,1440,810);this.ambient(ART.stages[stage].color,stage,t);
      const duel=document.querySelector('.selection-duel');const rect=duel?.getBoundingClientRect();
      const foot=rect?(rect.bottom-10)/this.height*810:410;
      const displaySize=clamp((rect?.height||220)/this.height*810*1.12,175,330);
      this.glow(505,foot-120,210,character(p1).color,.17);this.glow(955,foot-120,210,character(p2).color,.17);
      this.sprite(p1,'idle',t,505,foot,displaySize,1);this.sprite(p2,'idle',t+.3,955,foot,displaySize,-1);
      const grad=c.createLinearGradient(0,500,0,810);grad.addColorStop(0,'#09131a00');grad.addColorStop(1,'#080f17ed');c.fillStyle=grad;c.fillRect(0,460,1440,350);
    }else{
      const bg=this.assets.image(ART.ui.menuBackground);if(bg){this.cover(bg,-12+Math.sin(t*.06)*5,-9,1464,830);}c.fillStyle='#07121b66';c.fillRect(0,0,1440,810);
      const grad=c.createLinearGradient(0,0,1440,0);grad.addColorStop(0,'#061018f5');grad.addColorStop(.40,'#071119e0');grad.addColorStop(.68,'#08142025');grad.addColorStop(1,'#06101877');c.fillStyle=grad;c.fillRect(0,0,1440,810);
      c.save();c.strokeStyle='#c4a96322';c.lineWidth=1;c.beginPath();c.arc(1040,410,246,0,TAU);c.stroke();c.beginPath();c.arc(1040,410,260,.3+t*.015,4.8+t*.015);c.stroke();c.restore();
      this.glow(1020,465,350,'#5ac5dd',.17);this.glow(1020,700,270,'#c5aa65',.12);
      c.fillStyle='#03080b80';c.beginPath();c.ellipse(1030,725,200,19,0,0,TAU);c.fill();
      this.sprite('savior','idle',t,1040,726+Math.sin(t*1.2)*2,665,1);
      this.ambient('#d9b777',-1,t);
      const bottom=c.createLinearGradient(0,625,0,810);bottom.addColorStop(0,'#07131a00');bottom.addColorStop(1,'#060e16ed');c.fillStyle=bottom;c.fillRect(0,625,1440,185);
    }
    this.vignette();
  }
  glow(x,y,r,color,alpha=1){const c=this.ctx,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.save();c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
  sprite(id,clip,time,x,y,size=440,facing=1,opts={}){
    const data=ART.fighters[id],img=this.assets.image(data?.atlas);if(!img)return;
    const frames=data.clips[clip]||data.clips.idle;
    let frame=opts.index===undefined?Math.floor((time%(.85))*frames.length/.85):opts.index;
    if(clip==='idle'&&['aether_x','malakor'].includes(id))frame=0;
    frame=clamp(frame,0,frames.length-1);const index=frames[frame],anchor=data.anchor||[160,310],k=size/320;
    const c=this.ctx;c.save();c.translate(x,y);c.scale(facing,1);if(opts.rotation)c.rotate(opts.rotation);c.globalAlpha=opts.alpha??1;
    if(opts.bright)c.filter='brightness(1.8)';
    c.drawImage(img,(index%data.cols)*320,Math.floor(index/data.cols)*320,320,320,-anchor[0]*k,-anchor[1]*k,size,size);c.restore();
  }
  fighter(f,fight,ground,overrides={}){
    let clip=f.state,index,time=f.stateTime,scale=1,x=f.x,y=ground-f.y;
    if(f.action){clip=f.action.kind;index=Math.floor(f.action.time/f.action.move.duration*(ART.fighters[f.id].clips[clip]?.length||4));}
    if(f.stun>0){clip=f.stun>.48?'knockdown':'hit';index=0;}
    if(f.crouch)scale=.76;
    if(fight.phase==='intro'){
      const local=fight.phaseTime-f.side*2.3;if(local<0)return;clip=local<2.3?'intro':'idle';index=local<2.3?Math.floor(local/2.3*ART.fighters[f.id].clips.intro.length):undefined;time=local;
    }
    if(fight.phase==='roundEnd'||fight.phase==='victory') {clip=fight.roundWinner===f.side?'victory':'ko';index=fight.roundWinner===f.side?Math.min(3,Math.floor(fight.phaseTime*2)):0;}
    if(fight.phase==='finish'){clip=fight.winner===f.side?'idle':'stun';index=undefined;}
    if(f.id==='aether_x'&&!['ko','knockdown'].includes(clip))y-=20+Math.sin(this.time*3)*4;
    const c=this.ctx;c.save();c.globalAlpha=f.y>0?.24:.45;c.fillStyle='#02080c';c.beginPath();c.ellipse(x,ground+3,80-f.y*.12,14-f.y*.012,0,0,TAU);c.fill();c.restore();
    this.sprite(f.id,overrides.clip||clip,time,overrides.x??x,overrides.y??y,440*scale*(overrides.scale||1),overrides.facing??f.facing,{index:overrides.index??index,alpha:overrides.alpha??1,rotation:overrides.rotation||0,bright:f.stun>.35});
  }
  arena(stageIndex,fight,dt){
    const c=this.ctx,stage=ART.stages[stageIndex],ground=810*stage.ground,avg=(fight.fighters[0].x+fight.fighters[1].x)/2;
    const bg=this.assets.image(stage.full||stage.background),drift=(avg-720)*-.02;
    if(bg)c.drawImage(bg,-18+drift,0,1476,810);
    c.fillStyle='#040c1728';c.fillRect(0,0,1440,810);this.ambient(stage.color,stageIndex,this.time);
    if(fight.phase==='cinematic')this.cinematic(fight,ground);else fight.fighters.forEach(f=>this.fighter(f,fight,ground));
    for(const p of fight.projectiles){const f=fight.fighters[p.owner],im=this.assets.image(ART.vfx[projectileKeys[f.id]]);this.glow(p.x,ground-p.y,80,f.color,.25);if(im){c.save();c.translate(p.x,ground-p.y);c.scale(p.dir,1);c.globalCompositeOperation='screen';c.drawImage(im,-75,-75,150,150);c.restore();}else{c.fillStyle=f.color;c.beginPath();c.arc(p.x,ground-p.y,15,0,TAU);c.fill();}}
    this.drawParticles(dt);this.vignette();
    if(this.flash>0&&!this.settings.reducedMotion){c.fillStyle=`rgba(228,243,255,${this.flash*1.5})`;c.fillRect(0,0,1440,810);}
    const bottom=c.createLinearGradient(0,705,0,810);bottom.addColorStop(0,'transparent');bottom.addColorStop(1,'#030910c9');c.fillStyle=bottom;c.fillRect(0,705,1440,105);
  }
  cinematic(fight,ground){
    const c=this.ctx,cin=fight.cinematic,att=fight.fighters[cin.side],def=fight.fighters[1-cin.side],t=cin.time,impact=cin.impact;
    c.fillStyle=`rgba(2,6,14,${Math.min(.77,t*.8)})`;c.fillRect(0,0,1440,810);
    const ax=cin.side===0?560:880,dx=cin.side===0?880:560,dir=cin.side===0?1:-1;
    this.glow(dx,ground-165,330,att.color,.25);
    this.sprite(att.id,cin.kind==='fatality'?'fatality':'xray',t,ax,ground,485,dir,{index:t>2.9?1:0});
    const fade=cin.kind==='fatality'?1-clamp((t-impact-.85)/1.1,0,1):1;
    this.sprite(def.id,t<impact?'stun':cin.kind==='fatality'?'launched':'heavyHit',t,dx+(t>impact?dir*Math.min(38,(t-impact)*70):0),ground-(t>impact?Math.sin(Math.min(1,(t-impact)/1.2)*Math.PI)*50:0),440,-dir,{alpha:fade,index:0,bright:t>impact&&t<impact+.15});
    if(t>.6&&t<2.7){
      const power=Math.min(1,(t-.6)*2);c.save();c.globalCompositeOperation='screen';
      if(att.id==='malakor'){
        for(let i=0;i<9;i++){const x=dx-105+i*25,h=(80+Math.sin(i*7)*60)*power;c.fillStyle=att.color;c.globalAlpha=.65;c.beginPath();c.moveTo(x,ground+15);c.lineTo(x+10,ground-h-90);c.lineTo(x+25,ground+15);c.fill();}
      }else if(att.id==='ignis'){
        for(let i=0;i<6;i++){const radius=55+i*7,yy=ground-35-i*45;c.strokeStyle=i%2?'#ffcf5c':att.color;c.lineWidth=12-i;c.globalAlpha=.6;c.beginPath();c.ellipse(dx,yy,radius,18+i*2,this.time*5+i,0,TAU);c.stroke();}
      }else{
        const y=ground-170;c.shadowColor=att.color;c.shadowBlur=25;c.lineCap='round';
        for(let layer=0;layer<3;layer++){c.strokeStyle=layer===2?'#e6ffff':att.color;c.lineWidth=[27,10,3][layer]*power;c.globalAlpha=[.2,.7,1][layer];c.beginPath();c.moveTo(ax+dir*50,y+10);for(let i=1;i<=12;i++){c.lineTo(ax+dir*(50+i*22),y+Math.sin(i*5+this.time*28)*[0,15,8][layer]);}c.stroke();}
      }
      c.restore();
    }
    if(cin.kind==='xray'&&t>impact&&t<2.6){
      // Stylized energy scan follows the selected defender, rather than a baked generic opponent.
      c.save();c.translate(dx,ground-100);c.globalCompositeOperation='screen';c.strokeStyle=att.color;c.shadowBlur=14;c.shadowColor=att.color;c.globalAlpha=.65+Math.sin(t*20)*.15;c.lineWidth=4;
      c.beginPath();c.arc(0,-164,17,0,TAU);c.moveTo(0,-145);c.lineTo(0,-65);c.moveTo(-35,-133);c.lineTo(35,-133);c.moveTo(-35,-133);c.lineTo(-57,-84);c.moveTo(35,-133);c.lineTo(52,-91);c.moveTo(0,-65);c.lineTo(-30,0);c.moveTo(0,-65);c.lineTo(31,0);c.stroke();for(let i=0;i<5;i++){c.beginPath();c.ellipse(0,-120+i*10,25-i*2,7,0,0,Math.PI);c.stroke();}c.restore();
    }
    c.fillStyle='#03070ce0';c.fillRect(0,0,1440,67);c.fillRect(0,745,1440,65);
  }
  ambient(color,stage,t){
    const c=this.ctx,count=this.settings.quality==='low'?18:45;c.save();
    for(let i=0;i<count;i++){
      let x=((i*137.3+t*(stage===0?-92:10+i%8))%1550+1550)%1550-50,y=(i*83.7-t*(stage===0?-590:stage===2?-31:29))%850;y=(y+850)%850;
      c.globalAlpha=.1+(Math.sin(i*31+t)*.5+.5)*.22;c.fillStyle=color;c.strokeStyle=color;
      if(stage===0){c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x-7,y+30);c.stroke();}else{c.beginPath();c.arc(x,y,i%3===0?1.8:.8,0,TAU);c.fill();}
    }
    c.restore();
  }
  drawParticles(dt){const c=this.ctx;for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;c.save();c.globalCompositeOperation='screen';c.globalAlpha=clamp(p.life/.4,0,1);c.fillStyle=p.color;c.translate(p.x,p.y);c.rotate(p.life*5);c.fillRect(-p.size,-p.size,p.size*2,p.size*2);c.restore();}this.particles=this.particles.filter(p=>p.life>0);}
  vignette(){const c=this.ctx,g=c.createRadialGradient(720,380,260,720,380,860);g.addColorStop(0,'transparent');g.addColorStop(1,'#02070bd4');c.fillStyle=g;c.fillRect(0,0,1440,810);}
}
