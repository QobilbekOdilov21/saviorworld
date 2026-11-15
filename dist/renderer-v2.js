import { Renderer as PreviousRenderer, AssetBank as PreviousBank } from './renderer.js?v=0.2';
import { ART } from './asset-manifest.js?v=0.2';
import { FRAMES } from './frame-manifest.js?v=0.2';
import { UI } from './ui-manifest.js?v=0.2';
import { poseSample, PoseWarper } from './animation.js?v=0.2';
import { getHurtbox, getAttackBox } from './combat.js?v=0.2';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const effects={savior:'proj_savior_lightning_spear',ignis:'proj_ignis_hellfire_meteor',glacia:'proj_glacia_ice_lance',aether_x:'proj_aether_x_plasma_orb',malakor:'proj_malakor_obsidian_chain_wave'};
export class AssetBank extends PreviousBank {
  async preload(onProgress){
    const paths=new Set([UI.menuBackground,UI.tower,UI.clashBackground,'assets/regenerated-v2/world-of-savior-logo.png']);
    for(const f of Object.values(FRAMES.fighters))f.pages.forEach(p=>paths.add(p));
    for(const f of Object.values(FRAMES.clash||{}))paths.add(f.atlas);
    for(const s of ART.stages)[s.full,s.background,s.foreground,...s.weather].forEach(p=>paths.add(p));
    for(const group of ['buttons','avatars','avatarCards','banners','touch'])Object.values(UI[group]).forEach(p=>paths.add(p));
    UI.cards.forEach(p=>paths.add(p));for(const k of ['chrome','meterBlueChrome','meterGoldChrome','fpsBadge'])paths.add(UI.hud[k]);
    Object.values(UI.effects).forEach(e=>paths.add(e.atlas));
    let count=0;await Promise.all([...paths].filter(Boolean).map(async p=>{await this.load(p);onProgress(++count/paths.size);}));
    this.images.set(ART.ui.menuBackground,this.image(UI.menuBackground));onProgress(1);
  }
}
export class Renderer extends PreviousRenderer {
  constructor(canvas,assets,settings){super(canvas,assets,settings);this.warper=new PoseWarper(assets);this.fx=[];this.overlay=false;this.viewer=null;this.clashTime=0;this.lastFrame=0;this.measuredFPS=0;this.fpsTime=0;this.fpsFrames=0;this.blockTimes=[-10,-10];this.guardHistory=[false,false];this.guardRelease=[-10,-10];}
  effect(e){super.effect(e);if(e.type==='block')this.blockTimes[e.target]=this.time;if(e.type==='hit'||e.type==='block')this.fx.push({key:e.type==='block'?'vfx_block_shield_hex_flash':e.heavy?'vfx_critical_blood_shatter':'vfx_hit_spark_gold_electric',x:e.x,y:e.y,age:0,duration:.32,color:e.color});}
  draw(dt,info){
    this.activeScreen=info.screen;
    this.fpsTime+=dt;this.fpsFrames++;if(this.fpsTime>.6){this.measuredFPS=Math.round(this.fpsFrames/this.fpsTime);this.fpsTime=0;this.fpsFrames=0;}
    if(info.screen==='viewer'){this.drawViewer(dt,info.viewer);return;}
    if(info.screen==='clash'){this.time+=dt;this.clashTime=info.clashTime||0;this.drawClash();return;}
    super.draw(dt,info);
    if(info.screen==='game'&&info.fight){const c=this.ctx,scale=Math.min(this.width/1440,this.height/810);c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);c.translate((this.width-1440*scale)/2,(this.height-810*scale)/2);c.scale(scale,scale);this.hud(info.fight);c.restore();}
  }
  sprite(id,clip,time,x,y,size=512,facing=1,opts={}){
    const data=FRAMES.fighters[id];if(!data)return;
    const sample=poseSample(data,clip,time,opts.progress??null);
    if(opts.index!==undefined){const indices=data.clips[clip]||data.clips.idle;sample.a=sample.b=indices[clamp(opts.index,0,indices.length-1)];sample.blend=0;}
    const c=this.ctx;c.save();c.translate(x,y);c.scale(facing*(size/512),size/512);if(opts.rotation)c.rotate(opts.rotation);c.globalAlpha=opts.alpha??1;
    // Keep anatomy at canonical physical scale; wide-effect packing is undone
    // around the common foot anchor before any geometric interpolation.
    const warped=['game','viewer'].includes(this.activeScreen)&&this.settings.quality!=='low'&&this.settings.interpolation!==false?this.warper.draw(id,data,sample):null;
    if(warped)c.drawImage(warped,-512,-696,1024,768);
    else{const index=sample.blend<.5?sample.a:sample.b,local=index%64,page=this.assets.image(data.pages[Math.floor(index/64)]),scale=data.frameMeta[index]?.renderScale||1;if(page)c.drawImage(page,(local%8)*512,Math.floor(local/8)*512,512,512,-256*scale,-480*scale,512*scale,512*scale);}
    c.restore();return sample;
  }
  fighter(f,fight,ground){
    let clip=f.state,progress=null,index,time=f.stateTime,x=f.x,y=ground-f.y;
    if(f.action){clip=f.action.kind;progress=clamp(f.action.time/f.action.move.duration,0,1);}
    if(!f.action&&f.state==='air')progress=f.vy>0?.08+(1-f.vy/790)*.23:.52+clamp(-f.vy/790,0,1)*.38;
    if(fight.phase==='intro'){const local=fight.phaseTime-f.side*2.4;if(local<0)return;clip=local<2.4?'intro':'idle';progress=local<2.4?local/2.4:null;time=local;}
    if(['roundEnd','victory'].includes(fight.phase)){clip=fight.roundWinner===f.side?'victory':'ko';progress=clip==='victory'?clamp(fight.phaseTime/1.5,0,1):0;}
    if(fight.phase==='finish'){clip=fight.winner===f.side?'idle':'stun';progress=null;}
    if(fight.phase==='fight'){
      if(this.guardHistory[f.side]&&!f.guard)this.guardRelease[f.side]=this.time;
      if(f.guard){const age=this.time-this.blockTimes[f.side];if(f.crouch){clip='guard';index=2;}else if(age<.07){clip='guard';index=1;}else if(age<.16){clip='block';index=1;}else if(f.stateTime<.1){clip='guard';index=0;}else{clip='block';index=0;}}
      else if(!f.action&&f.stun<=0&&this.time-this.guardRelease[f.side]<.08){clip='guard';index=3;}
      this.guardHistory[f.side]=f.guard;
    }
    if(f.id==='aether_x'&&!['ko','knockdown','getup','crouch','sweep'].includes(clip))y-=20+Math.sin(this.time*3)*2;
    const c=this.ctx;c.save();c.globalAlpha=.35;c.fillStyle='#000';c.beginPath();c.ellipse(x,ground+3,clamp(83-f.y*.12,36,85),12,0,0,Math.PI*2);c.fill();c.restore();
    this.sprite(f.id,clip,time,x,y,512,f.facing,{progress,index});
  }
  arena(stageIndex,fight,dt){
    const c=this.ctx,stage=ART.stages[stageIndex],ground=810*stage.ground,avg=(fight.fighters[0].x+fight.fighters[1].x)/2,drift=(avg-720)*-.014;
    const far=this.assets.image(stage.background),full=this.assets.image(stage.full),front=this.assets.image(stage.foreground);
    if(far)c.drawImage(far,-20+drift*.3,0,1480,810);if(full){c.globalAlpha=.97;c.drawImage(full,-14+drift,0,1468,810);c.globalAlpha=1;}
    if(front){c.save();c.beginPath();c.rect(0,ground+16,1440,810-ground);c.clip();c.globalAlpha=.24;c.drawImage(front,-10+drift*1.5,0,1460,810);c.restore();}
    const weather=this.assets.image(stage.weather[Math.floor(this.time*18)%stage.weather.length]);if(weather){c.save();c.globalAlpha=stageIndex===0?.55:.36;c.drawImage(weather,-5,(this.time*18%1)*4,1450,810);c.restore();}
    c.fillStyle='#040c1714';c.fillRect(0,0,1440,810);
    if(fight.phase==='cinematic')this.cinematic(fight,ground);else fight.fighters.forEach(f=>this.fighter(f,fight,ground));
    for(const p of fight.projectiles){if(p.beam)this.glow(p.x,ground-p.y,200,fight.fighters[p.owner].color,.28);this.effectStrip(effects[fight.fighters[p.owner].id],this.time,p.x,ground-p.y,p.beam?290:148,p.dir);}
    for(const fx of this.fx){fx.age+=dt;this.effectStrip(fx.key,fx.age,fx.x,ground-fx.y,fx.key.includes('critical')?200:145,1,fx.age/fx.duration);}
    this.fx=this.fx.filter(fx=>fx.age<fx.duration);this.drawParticles(dt);this.vignette();
    if(this.overlay&&fight.phase==='fight')this.hitboxes(fight,ground);
    if(this.flash>0&&!this.settings.reducedMotion){c.fillStyle=`rgba(218,241,255,${this.flash})`;c.fillRect(0,0,1440,810);}
  }
  effectStrip(key,time,x,y,size=150,facing=1,progress=null){const data=UI.effects[key];if(!data)return;const image=this.assets.image(data.atlas);if(!image)return;const frame=progress===null?Math.floor(time*90)%data.frames:clamp(Math.floor(progress*data.frames),0,data.frames-1),c=this.ctx;c.save();c.translate(x,y);c.scale(facing,1);c.drawImage(image,frame*data.cell,0,data.cell,data.cell,-size/2,-size/2,size,size);c.restore();}
  cinematic(fight,ground){
    const c=this.ctx,cin=fight.cinematic,att=fight.fighters[cin.side],t=cin.time,progress=t/cin.duration;
    c.fillStyle='#02070cbd';c.fillRect(0,0,1440,810);this.glow(720,ground-190,400,att.color,.22);
    // Every regenerated source X-ray/fatality keypose is now played in order.
    // Full composed panels are not replaced by a runtime stick-figure overlay.
    this.sprite(att.id,cin.kind,t,720,ground,512,cin.side===0?1:-1,{progress});
    c.fillStyle='#03080de8';c.fillRect(0,0,1440,65);c.fillRect(0,755,1440,55);
    c.font='11px Arial';c.fillStyle='#cbd5d5';c.textAlign='center';c.fillText(`${att.name}  /  ${fight.fighters[1-cin.side].name}`,720,738);
  }
  hud(fight){
    const c=this.ctx,chrome=this.assets.image(UI.hud.chrome);if(!chrome)return;const x=59,y=58,g=UI.hud.geometry;
    c.save();c.translate(x,y);
    const polygon=pts=>{c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();};
    for(let side=0;side<2;side++){const poly=side?g.rightHpPolygon:g.leftHpPolygon,rect=side?g.rightHpRect:g.leftHpRect,hp=fight.fighters[side].hp/1000;c.save();polygon(poly);c.clip();c.fillStyle='#1b161b';c.fillRect(...rect);const gradient=c.createLinearGradient(rect[0],0,rect[0]+rect[2],0);gradient.addColorStop(0,side?'#d92e49':'#24bfc9');gradient.addColorStop(1,side?'#ff8773':'#98fff4');c.fillStyle=gradient;c.fillRect(side?rect[0]:rect[0]+rect[2]*(1-hp),rect[1],rect[2]*hp,rect[3]);c.restore();}
    c.fillStyle='#07131e';c.beginPath();c.arc(...g.timerCenter,g.timerRadius,0,Math.PI*2);c.fill();c.drawImage(chrome,0,0);
    c.textAlign='center';c.fillStyle='#f7e3b9';c.font='40px Georgia';c.fillText(fight.mode==='training'?'∞':String(Math.ceil(fight.timer)).padStart(2,'0'),g.timerCenter[0],g.timerCenter[1]+14);
    c.font='9px Arial';c.fillStyle='#d0b57c';c.fillText(fight.mode==='training'?'TRAINING':`ROUND ${fight.round}`,g.timerCenter[0],g.timerCenter[1]-24);
    for(let side=0;side<2;side++){const f=fight.fighters[side];c.textAlign=side?'right':'left';c.font='21px Georgia';c.fillStyle='#efdfba';c.fillText(f.name,side?1268:54,61);for(let n=0;n<2;n++){c.save();c.translate(side?1258-n*20:62+n*20,155);c.rotate(Math.PI/4);c.fillStyle=n<f.wins?'#e6c079':'#101b23';c.strokeStyle='#b89b5d';c.fillRect(-4,-4,8,8);c.strokeRect(-4,-4,8,8);c.restore();}}
    c.restore();
    const mg=UI.hud.meterGeometry,sy=.60;
    for(let side=0;side<2;side++){const f=fight.fighters[side],img=this.assets.image(side?UI.hud.meterBlueChrome:UI.hud.meterGoldChrome);if(!img)continue;c.save();c.translate(side?1021:60,731);c.scale(sy,sy);polygon(mg.fillPolygon);c.save();c.clip();const [rx,ry,rw,rh]=mg.fillRect;c.fillStyle='#06131d';c.fillRect(rx,ry,rw,rh);c.fillStyle=side?'#57d7ea':'#e5bb5f';c.fillRect(side?rx+rw*(1-f.meter/100):rx,ry,rw*f.meter/100,rh);c.restore();c.drawImage(img,0,0);c.restore();c.font='9px Arial';c.textAlign=side?'right':'left';c.fillStyle=f.meter>=100?'#ffe1a0':'#b8c4c4';c.fillText(`${Math.floor(f.meter)}%  ·  ${f.meter>=100?'X-RAY TAYYOR':'MAXSUS KUCH'}`,side?1360:80,733);}
    const badge=this.assets.image(UI.hud.fpsBadge);if(badge){c.globalAlpha=.7;c.drawImage(badge,676,751,88,34);c.globalAlpha=1;c.font='8px Arial';c.textAlign='center';c.fillStyle='#94b6b5';c.fillText('MAQSADLI CHASTOTA',720,795);}
  }
  hitboxes(fight,ground){const c=this.ctx;for(const f of fight.fighters){const hurt=getHurtbox(f);c.strokeStyle='#6df7aa';c.fillStyle='#6df7aa13';c.fillRect(hurt.left,ground-hurt.top,hurt.right-hurt.left,hurt.top-hurt.bottom);c.strokeRect(hurt.left,ground-hurt.top,hurt.right-hurt.left,hurt.top-hurt.bottom);if(f.action&&f.action.time>=f.action.move.start&&f.action.time<=f.action.move.end){const hit=getAttackBox(f);if(hit){c.fillStyle='#ff634d38';c.strokeStyle='#ff8b4d';c.fillRect(hit.left,ground-hit.top,hit.right-hit.left,hit.top-hit.bottom);c.strokeRect(hit.left,ground-hit.top,hit.right-hit.left,hit.top-hit.bottom);}}}}
  drawClash(){const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#050a10';c.fillRect(0,0,this.width,this.height);c.save();c.scale(this.width/1440,this.height/810);const bg=this.assets.image(UI.clashBackground);if(bg)c.drawImage(bg,0,0,1440,810);c.fillStyle='#05101b44';c.fillRect(0,0,1440,810);const t=clamp(this.clashTime/3.2,0,1);
    for(const [id,x,dir]of [['savior',570,1],['ignis',900,-1]]){const data=FRAMES.clash?.[id];const im=this.assets.image(data?.atlas);if(!im)continue;const i=Math.min(data.frames-1,Math.floor(t*data.frames)),k=data.frameMeta?.[i]?.renderScale||1;c.save();c.translate(x,700);c.scale(dir,1);c.drawImage(im,i*512,0,512,512,-256*k,-480*k,512*k,512*k);c.restore();}
    if(t>.55&&t<.85){this.glow(805,500,180,'#8cf7ff',.65);this.effectStrip('vfx_hit_spark_gold_electric',this.clashTime,805,500,270);}
    this.vignette();c.restore();}
  drawViewer(dt,viewer){
    this.time+=dt;const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#09121c';c.fillRect(0,0,this.width,this.height);if(!viewer)return;
    if(viewer.playing)viewer.time+=dt;const data=FRAMES.fighters[viewer.id],clip=viewer.clip,meta=data.clipMeta[clip],p=viewer.playing?null:viewer.frame/meta.durationFrames;
    const scale=Math.min(this.width/1440,this.height/810);c.save();c.translate((this.width-1440*scale)/2,(this.height-810*scale)/2);c.scale(scale,scale);
    for(let yy=150;yy<760;yy+=32)for(let xx=340;xx<1130;xx+=32){c.fillStyle=((xx-340)/32+(yy-150)/32)%2?'#111e2b':'#152330';c.fillRect(xx,yy,32,32);}
    c.strokeStyle='#dfbe7688';c.lineWidth=1;c.beginPath();c.moveTo(340,700);c.lineTo(1130,700);c.moveTo(720,175);c.lineTo(720,735);c.stroke();
    this.sprite(viewer.id,clip,viewer.time,720,700,512,1,{progress:p});
    c.font='11px Arial';c.fillStyle='#c2b28f';c.fillText('512 × 512  /  TAYANCH [256, 480]  /  TANA MASSHTABI 1:1',360,748);
    c.restore();
  }
}
