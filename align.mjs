import { chromium } from '@playwright/test';
const b = await chromium.launch({ args: ['--mute-audio'] });
const p = await (await b.newContext()).newPage();
await p.goto('http://localhost:4173/');
const r = await p.evaluate(async () => {
  const load = (u) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  const grab = async (u, W, H) => {
    const im = await load(u);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(im, 0, 0, W, H);
    return g.getImageData(0, 0, W, H).data;
  };
  const W = 256, H = 320;
  const col = await grab('/img/bestiary/cc.png', W, H);
  const nrm = await grab('/img/bestiary/nn.png', W, H);
  const L = (d, x, y) => { const k = (y*W+x)*4; return (d[k]*0.299+d[k+1]*0.587+d[k+2]*0.114)/255; };
  // «Рельефность» цветной карты — модуль градиента яркости (там, где кончается
  // золото, градиент велик). «Рельефность» нормали — отклонение от (128,128).
  const a = [], c = [];
  for (let y=1;y<H-1;y++) for (let x=1;x<W-1;x++) {
    const gx = L(col,x+1,y)-L(col,x-1,y), gy = L(col,x,y+1)-L(col,x,y-1);
    a.push(Math.hypot(gx,gy));
    const k=(y*W+x)*4;
    c.push(Math.hypot((nrm[k]-128)/128, (nrm[k+1]-128)/128));
  }
  const mean = v => v.reduce((s,x)=>s+x,0)/v.length;
  const ma = mean(a), mc = mean(c);
  let num=0, da=0, dc=0;
  for (let i=0;i<a.length;i++){ const x=a[i]-ma, y=c[i]-mc; num+=x*y; da+=x*x; dc+=y*y; }
  return { корреляция: +(num/Math.sqrt(da*dc)).toFixed(3), средняяРельефностьЦветной: +ma.toFixed(4), средняяРельефностьНормали: +mc.toFixed(4) };
});
console.log('совпадение рельефа нормали с рисунком:', r.корреляция);
console.log('  (1.0 = идеально совпадает, 0 = независимы, отрицательное = противоречат)');
console.log('  средний градиент цветной:', r.средняяРельефностьЦветной, '| отклонение нормали:', r.средняяРельефностьНормали);
await b.close();
