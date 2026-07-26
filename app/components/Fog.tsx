// Объёмный туман на WebGL: fbm-шум с domain warp и временем — клубы
// эволюционируют и никогда не повторяются, курсор расталкивает дым.
// Дёшево: рендер в 0.32 от экрана (шум мягкий, разницы не видно), 30 к/с,
// пауза во вкладке-невидимке, выключен при reduced-motion и без WebGL.
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "~/lib/media";

const SCALE = 0.5;
const FRAME_MS = 33;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;uniform vec2 u_m;uniform float u_t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;
  for(int k=0;k<4;k++){v+=a*n(p);p*=2.05;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 md=uv-u_m;
  // зона влияния курсора — вытянутый эллипс (по земле шире, чем вверх)
  vec2 me=md*vec2(1.25,1.9);
  float mi=exp(-dot(me,me)*11.0);
  // поле сильно сжато по вертикали => пелена стелется, а не поднимается клубами
  vec2 p=vec2(uv.x*u_res.x/u_res.y*1.05,uv.y*4.2);
  p.x-=mod(u_t,4096.0)*0.008;
  // расталкивание: у курсора туман уходит наружу
  p+=vec2(md.x,md.y*2.2)*mi*2.4;
  float t=u_t*0.045;
  vec2 d1=vec2(cos(t*0.9),sin(t*0.7))*1.2,d2=vec2(sin(t*0.61),cos(t*0.83))*1.0;
  vec2 q=vec2(fbm(p+d1),fbm(p+vec2(5.2,1.3)+d2));
  vec2 d3=vec2(cos(t*0.43),sin(t*0.37))*0.8;
  vec2 r=vec2(fbm(p+1.2*q+vec2(1.7,9.2)+d3),fbm(p+1.2*q+vec2(8.3,2.8)-d3));
  float f=smoothstep(0.22,0.66,fbm(p+1.3*r));f=f*f*(3.0-2.0*f);
  // потолок: 30% экрана, выше поднимается только там, где тронули
  float ceilY=0.42+mi*0.38;
  float vert=smoothstep(ceilY,ceilY-0.30,uv.y);vert*=smoothstep(-0.14,0.06,uv.y)*0.35+0.65;
  float a=(0.42+0.58*f)*vert*0.40;
  a*=1.0-mi*0.5;
  a+=(h(gl_FragCoord.xy)-0.5)*0.006;
  gl_FragColor=vec4(0.88,0.89,0.92,max(0.0,a));
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export function Fog() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uM = gl.getUniformLocation(prog, "u_m");
    const uT = gl.getUniformLocation(prog, "u_t");

    function size(): void {
      if (!cv || !gl) return;
      cv.width = Math.max(2, Math.round(window.innerWidth * SCALE));
      cv.height = Math.max(2, Math.round(window.innerHeight * SCALE));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    }
    size();
    window.addEventListener("resize", size);

    let mx = 0.5, my = 0.4, tx = 0.5, ty = 0.4;
    const onMove = (e: MouseEvent): void => {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0, last = 0;
    const t0 = performance.now();
    function loop(now: number): void {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS || document.hidden || !gl) return;
      last = now;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas className="fogshader" ref={ref} aria-hidden="true" />;
}
