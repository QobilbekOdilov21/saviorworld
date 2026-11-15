// A 90 Hz pose clock and geometric interpolation: one painted silhouette at a
// time, without opacity-crossfading two bodies or rescaling their anatomy.
export function poseSample(data,clip,time,progress=null){
  const frames=data.clips[clip]||data.clips.idle,meta=data.clipMeta[clip]||{fps:90,durationFrames:90,loop:true};
  const duration=meta.durationFrames/90;let p=progress===null?Math.floor(time*90)/90/duration:progress;
  p=meta.loop&&progress===null?((p%1)+1)%1:Math.max(0,Math.min(1,p));
  const position=p*(meta.loop&&progress===null?frames.length:Math.max(1,frames.length-1));
  const slot=Math.min(frames.length-1,Math.floor(position));const a=frames[slot],b=frames[meta.loop?(slot+1)%frames.length:Math.min(slot+1,frames.length-1)];
  return {a,b,blend:a===b?0:position-Math.floor(position),virtualFrame:Math.floor(p*meta.durationFrames),meta};
}

const VERT=`#version 300 es
in vec2 p;out vec2 uv;void main(){gl_Position=vec4(p,0.,1.);uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);}`;
const FRAG=`#version 300 es
precision highp float;in vec2 uv;out vec4 outColor;
uniform sampler2D first;uniform sampler2D second;uniform sampler2D motion;
uniform vec4 regionA;uniform vec4 regionB;uniform vec2 scaleA;uniform vec2 scaleB;uniform float blend;uniform int pairIndex;uniform int gridSize;
vec4 field(vec2 at){vec2 q=clamp(at,0.,1.)*float(gridSize-1);ivec2 lo=ivec2(floor(q));ivec2 hi=min(lo+ivec2(1),ivec2(gridSize-1));vec2 d=fract(q);int row=pairIndex*gridSize;return mix(mix(texelFetch(motion,ivec2(lo.x,lo.y+row),0),texelFetch(motion,ivec2(hi.x,lo.y+row),0),d.x),mix(texelFetch(motion,ivec2(lo.x,hi.y+row),0),texelFetch(motion,ivec2(hi.x,hi.y+row),0),d.x),d.y);}
vec4 art(sampler2D im,vec4 r,vec2 at){if(any(lessThan(at,vec2(0.)))||any(greaterThan(at,vec2(1.))))return vec4(0.);return texture(im,r.xy+clamp(at,.0008,.9992)*r.zw);}
void main(){vec2 a=uv,b=uv;if(pairIndex>=0){a=uv-blend*field(uv).xy;b=uv-(1.-blend)*field(uv).zw;a=uv-blend*field(a).xy;b=uv-(1.-blend)*field(b).zw;}vec2 physicalAnchor=vec2(.5,.90625),sourceAnchor=vec2(.5,.9375);vec4 ca=art(first,regionA,(a-physicalAnchor)*scaleA+sourceAnchor),cb=art(second,regionB,(b-physicalAnchor)*scaleB+sourceAnchor);vec4 chosen=blend<.5?ca:cb;if(ca.a>.94&&cb.a>.94&&distance(ca.rgb,cb.rgb)<.23)chosen.rgb=mix(ca.rgb,cb.rgb,blend);outColor=chosen;}`;
export class PoseWarper {
  constructor(assets){this.assets=assets;this.canvas=document.createElement('canvas');this.canvas.width=512;this.canvas.height=384;this.cache=new Map();this.fields=new Map();this.enabled=false;this.motion=null;
    try{const gl=this.gl=this.canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false});if(!gl)return;
      const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
      const program=this.program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERT));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
      const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      this.locations={};for(const k of ['first','second','motion','regionA','regionB','scaleA','scaleB','blend','pairIndex','gridSize'])this.locations[k]=gl.getUniformLocation(program,k);
      gl.uniform1i(this.locations.first,0);gl.uniform1i(this.locations.second,1);gl.uniform1i(this.locations.motion,2);gl.disable(gl.BLEND);this.enabled=true;
      this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.enabled=false;});
    }catch(error){console.warn('Motion interpolation unavailable; using normalized keyposes.',error.message);}
  }
  async loadMotion(){try{const {MOTION}=await import('./motion-manifest.js?v=0.2');this.motion=MOTION;await Promise.all(Object.entries(MOTION.fighters).map(async([id,f])=>{const r=await fetch(f.file);if(!r.ok)throw Error(f.file);this.fields.set(id,new Float32Array(await r.arrayBuffer()));}));}catch{this.motion=null;}}
  texture(path){if(this.cache.has(path)){const tex=this.cache.get(path);this.cache.delete(path);this.cache.set(path,tex);return tex;}const gl=this.gl,img=this.assets.image(path);if(!img)return null;
    while(this.cache.size>7){const key=this.cache.keys().next().value;gl.deleteTexture(this.cache.get(key));this.cache.delete(key);}
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);this.cache.set(path,tex);return tex;
  }
  draw(id,data,sample){
    if(!this.enabled||sample.a===sample.b||!this.motion?.fighters[id]||!this.fields.has(id))return null;
    const gl=this.gl,info=this.motion.fighters[id],pair=info.pairs[`${sample.a}:${sample.b}`];if(pair===undefined)return null;
    const pathA=data.pages[Math.floor(sample.a/64)],pathB=data.pages[Math.floor(sample.b/64)];
    gl.activeTexture(gl.TEXTURE0);const ta=this.texture(pathA);gl.bindTexture(gl.TEXTURE_2D,ta);gl.activeTexture(gl.TEXTURE1);const tb=this.texture(pathB);gl.bindTexture(gl.TEXTURE_2D,tb);if(!ta||!tb)return null;
    let motionTex=this.cache.get('motion:'+id);if(!motionTex){motionTex=gl.createTexture();gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,motionTex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,this.motion.grid,info.height,0,gl.RGBA,gl.FLOAT,this.fields.get(id));this.cache.set('motion:'+id,motionTex);}
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,motionTex);gl.useProgram(this.program);
    const region=(i,path)=>{const im=this.assets.image(path),local=i%64;return [local%8*512/im.width,Math.floor(local/8)*512/im.height,512/im.width,512/im.height];};
    gl.uniform4fv(this.locations.regionA,region(sample.a,pathA));gl.uniform4fv(this.locations.regionB,region(sample.b,pathB));gl.uniform2f(this.locations.scaleA,2/(data.frameMeta[sample.a]?.renderScale||1),1.5/(data.frameMeta[sample.a]?.renderScale||1));gl.uniform2f(this.locations.scaleB,2/(data.frameMeta[sample.b]?.renderScale||1),1.5/(data.frameMeta[sample.b]?.renderScale||1));gl.uniform1f(this.locations.blend,sample.blend);gl.uniform1i(this.locations.pairIndex,pair);gl.uniform1i(this.locations.gridSize,this.motion.grid);gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);return this.canvas;
  }
}
