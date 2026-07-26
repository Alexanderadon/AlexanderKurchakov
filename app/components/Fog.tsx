// Объёмный туман на WebGL: fbm-шум с domain warp и временем — клубы
// эволюционируют и никогда не повторяются, курсор расталкивает дым.
// Дёшево: рендер в 0.32 от экрана (шум мягкий, разницы не видно), 30 к/с,
// пауза во вкладке-невидимке, выключен при reduced-motion и без WebGL.
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "~/lib/media";

const SCALE = 0.32;
const FRAME_MS = 33;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 u_res;uniform vec2 u_m;uniform float u_t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;
  for(int k=0;k<4;k++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 p=vec2(uv.x*u_res.x/u_res.y,uv.y)*2.4;p.y-=u_t*0.022;
  float t=u_t*0.055;
  vec2 md=uv-u_m;float mi=exp(-dot(md,md)*11.0);
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t*0.8));
  vec2 r=vec2(fbm(p+2.0*q+vec2(1.7,9.2)+t*0.6),fbm(p+2.0*q+vec2(8.3,2.8)-t*0.5));
  r+=md*mi*0.9;
  float f=smoothstep(0.36,0.92,fbm(p+2.4*r));
  float vert=smoothstep(1.02,0.12,uv.y);
  gl_FragColor=vec4(0.93,0.92,0.90,f*vert*0.62+f*mi*0.16);
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
