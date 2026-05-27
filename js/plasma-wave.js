(function(G){
'use strict';
var V='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
var F='precision highp float;\nuniform vec2  u_res;\nuniform float u_time;\nuniform vec3  u_color;\nuniform vec3  u_bg;\nuniform float u_speed;\nuniform float u_intensity;\nfloat h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat n(vec2 p){\n  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);\n  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);\n}\nfloat fbm(vec2 p){\n  float v=0.0,a=0.5;\n  mat2 m=mat2(0.8,0.6,-0.6,0.8);\n  for(int i=0;i<4;i++){v+=a*n(p);p=m*p*2.1;a*=0.5;}\n  return v;\n}\nvoid main(){\n  vec2 uv=gl_FragCoord.xy/u_res;\n  vec2 st=(uv*2.0-1.0)*vec2(u_res.x/u_res.y,1.0);\n  float t=u_time*u_speed;\n  vec2 q=vec2(\n    fbm(st*0.7+vec2(0.0,0.0)+t*0.07),\n    fbm(st*0.7+vec2(5.2,1.3)-t*0.05)\n  );\n  vec2 r=vec2(\n    fbm(st*0.9+q*2.2+vec2(1.7,9.2)+t*0.06),\n    fbm(st*0.9+q*2.2+vec2(8.3,2.8)-t*0.04)\n  );\n  float f=fbm(st*1.1+r*1.8+t*0.03);\n  float plasma=0.0;\n  float thr1=0.52;\n  float thr2=0.44;\n  float thr3=0.36;\n  float bw=0.045;\n  float band1=exp(-pow((f-thr1)/bw,2.0)*2.5);\n  float band2=exp(-pow((f-thr2)/bw,2.0)*2.5)*0.7;\n  float band3=exp(-pow((f-thr3)/bw,2.0)*2.5)*0.45;\n  plasma=band1+band2+band3;\n  float shim=fbm(st*2.0+vec2(t*0.25,-t*0.18));\n  plasma*=(0.5+shim*1.0);\n  plasma=clamp(plasma*u_intensity,0.0,1.0);\n  float inner=clamp((f-thr3)/(thr1-thr3),0.0,1.0);\n  vec3 hotCol=u_color*1.2;\n  vec3 coolCol=u_color*0.5;\n  vec3 bandCol=mix(coolCol,hotCol,inner);\n  vec3 col=mix(u_bg,bandCol,plasma);\n  col+=u_color*band1*0.4*shim;\n  float vr=dot(uv*2.0-1.0,uv*2.0-1.0);\n  col*=1.0-clamp(vr*0.18,0.0,0.4);\n  col=clamp(col,0.0,1.0);\n  gl_FragColor=vec4(col,1.0);\n}';
function hv(h){h=h.replace(/^#/,'');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
function mks(gl,t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x;}
function mkp(gl){var p=gl.createProgram();gl.attachShader(p,mks(gl,gl.VERTEX_SHADER,V));gl.attachShader(p,mks(gl,gl.FRAGMENT_SHADER,F));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
function Inst(el,o){this.el=el;this.o=Object.assign({color:'#00e554',bgColor:'#010601',speed:0.5,intensity:1.2,fps:40,zIndex:0,opacity:1},o);this._b();this._s();}
Inst.prototype._b=function(){
  var el=this.el,me=this;
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  var c=document.createElement('canvas');
  c.style.position='absolute';c.style.top='0';c.style.left='0';
  c.style.width='100%';c.style.height='100%';c.style.display='block';
  c.style.pointerEvents='none';c.style.zIndex=String(this.o.zIndex);c.style.opacity=String(this.o.opacity);
  el.insertBefore(c,el.firstChild);this.c=c;
  var gl=c.getContext('webgl',{antialias:false,alpha:false})||c.getContext('experimental-webgl',{antialias:false,alpha:false});
  if(!gl){console.warn('no WebGL');return;}this.gl=gl;
  this.p=mkp(gl);gl.useProgram(this.p);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var l=gl.getAttribLocation(this.p,'a');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
  this.u={};['u_res','u_time','u_color','u_bg','u_speed','u_intensity'].forEach(function(n){me.u[n]=gl.getUniformLocation(me.p,n);});
  this._r();this._ro=new ResizeObserver(function(){me._r();});this._ro.observe(el);
};
Inst.prototype._r=function(){
  var w=this.el.offsetWidth,h=this.el.offsetHeight;
  var d=Math.min(window.devicePixelRatio||1,2);
  var pw=Math.ceil(w*d),ph=Math.ceil(h*d);
  if(!pw||!ph||this.c.width===pw&&this.c.height===ph)return;
  this.c.width=pw;this.c.height=ph;
  if(this.gl)this.gl.viewport(0,0,pw,ph);
};
Inst.prototype._s=function(){var me=this;this._on=true;this._t0=performance.now();this._l=0;var iv=1000/this.o.fps;(function lp(ts){if(!me._on)return;me._raf=requestAnimationFrame(lp);if(ts-me._l<iv-1)return;me._l=ts;me._r();me._d((ts-me._t0)*0.001);})(0);};
Inst.prototype._d=function(t){var gl=this.gl,u=this.u,o=this.o;if(!gl||!this.c.width||!this.c.height)return;gl.useProgram(this.p);gl.uniform2f(u.u_res,this.c.width,this.c.height);gl.uniform1f(u.u_time,t);gl.uniform1f(u.u_speed,o.speed);gl.uniform1f(u.u_intensity,o.intensity);var c=hv(o.color),b=hv(o.bgColor);gl.uniform3f(u.u_color,c[0],c[1],c[2]);gl.uniform3f(u.u_bg,b[0],b[1],b[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
Inst.prototype.set=function(o){Object.assign(this.o,o);};
Inst.prototype.destroy=function(){this._on=false;if(this._raf)cancelAnimationFrame(this._raf);if(this._ro)this._ro.disconnect();var e=this.gl&&this.gl.getExtension('WEBGL_lose_context');if(e)e.loseContext();if(this.c&&this.c.parentNode)this.c.parentNode.removeChild(this.c);};
var mp=new Map();
function rs(t){if(typeof t==='string')return Array.from(document.querySelectorAll(t));if(t instanceof Element)return[t];if(t instanceof NodeList||Array.isArray(t))return Array.from(t);return[];}
var PlasmaWave={apply:function(t,o){o=o||{};var r=rs(t).map(function(el){if(mp.has(el))mp.get(el).destroy();var i=new Inst(el,o);mp.set(el,i);return i;});return r.length===1?r[0]:r;},update:function(t,o){o=o||{};rs(t).forEach(function(el){if(mp.has(el))mp.get(el).set(o);});},destroy:function(t){rs(t).forEach(function(el){if(mp.has(el)){mp.get(el).destroy();mp.delete(el);}});},destroyAll:function(){mp.forEach(function(i){i.destroy();});mp.clear();},getInstance:function(t){var el=rs(t)[0];return el?(mp.get(el)||null):null;}};
if(typeof module!=='undefined'&&module.exports)module.exports=PlasmaWave;else G.PlasmaWave=PlasmaWave;
})(typeof globalThis!=='undefined'?globalThis:window);
