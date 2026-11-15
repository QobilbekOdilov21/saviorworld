import { ART } from './asset-manifest.js?v=0.2';
export class AudioDirector {
  constructor(settings){this.settings=settings;this.ctx=null;this.unlocked=false;this.player=null;this.current=null;this.targetVolume=0;this.volume=0;this.desired=1;this.musicError=false;}
  async unlock(){this.unlocked=true;try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{} }
  track(index){this.desired=index;const forced=Number(this.settings.track);if(this.settings.track!=='auto'&&Number.isInteger(forced))index=forced;index=Math.max(0,Math.min(ART.music.length-1,index));if(this.current===index&&this.player){if(this.unlocked&&this.player.paused)this.player.play().catch(()=>{});return;}this.current=index;
    if(this.player){this.player.pause();this.player.src='';}const audio=new Audio(ART.music[index].file);audio.loop=true;audio.preload='auto';audio.volume=0;this.player=audio;this.volume=0;this.musicError=false;audio.addEventListener('error',()=>{this.musicError=true;});if(this.unlocked)audio.play().catch(()=>{});
  }
  update(dt,duck=1){this.targetVolume=this.settings.muted?0:this.settings.music*duck;this.volume+=(this.targetVolume-this.volume)*Math.min(1,dt*3);if(this.player)this.player.volume=Math.max(0,Math.min(1,this.volume));}
  stop(){if(this.player)this.player.pause();}
  resume(){if(this.unlocked&&this.player)this.player.play().catch(()=>{});}
  sound(kind){
    if(!this.ctx||this.settings.muted||this.settings.effects<=0)return;const c=this.ctx,t=c.currentTime,vol=this.settings.effects;
    const tone=(freq,end,duration,gain,type='sine')=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(15,end),t+duration);g.gain.setValueAtTime(gain*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(c.destination);o.start(t);o.stop(t+duration);};
    const noise=(duration,gain,freq)=>{const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const n=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();n.buffer=buffer;f.type='lowpass';f.frequency.value=freq;g.gain.setValueAtTime(gain*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);n.connect(f).connect(g).connect(c.destination);n.start(t);n.stop(t+duration);};
    if(kind==='hit'){tone(150,43,.17,.15);noise(.12,.15,1600);}else if(kind==='heavy'||kind==='cinematicImpact'){tone(95,25,.35,.26);noise(.32,.21,2200);}else if(kind==='block'){tone(740,160,.17,.09,'triangle');noise(.06,.05,4000);}else if(kind==='swing'){noise(.09,.035,1100);}else if(kind==='projectile'){tone(350,70,.28,.09,'sawtooth');}else if(kind==='cinematicStart'){tone(70,460,.65,.08,'triangle');}else if(kind==='fight'||kind==='roundWin'){tone(210,80,.38,.14,'triangle');}else if(kind==='select'){tone(500,850,.08,.055,'sine');}else if(kind==='jump'){noise(.12,.025,600);}
  }
}
