// Готический каркас фона: стрельчатые арки, аркады и розетка — тонкой линией.
// Геометрия честная: равносторонняя арка строится двумя дугами радиусом в пролёт,
// розетка — кольцо касающихся окружностей. Только контуры, без орнамента.

// стрельчатая арка: пролёт w, пята на высоте h, k — доля подъёма (1 = равносторонняя)
function lancet(w: number, h: number, k = 1): string {
  const r = w / k;
  const top = h - Math.sqrt(r * r - (w / 2) * (w / 2));
  return `M0 ${h} A${r} ${r} 0 0 1 ${w / 2} ${top} A${r} ${r} 0 0 1 ${w} ${h}`;
}

function Arcade({ n, w, h, base }: { n: number; w: number; h: number; base: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * w} 0)`}>
          <path d={lancet(w, h)} />
          <path d={`M${w / 2} ${h} L${w / 2} ${base}`} />
          <path d={`M0 ${h} L0 ${base} M${w} ${h} L${w} ${base}`} />
        </g>
      ))}
    </>
  );
}

function Rose({ r, n }: { r: number; n: number }) {
  const ir = (r * Math.sin(Math.PI / n)) / (1 + Math.sin(Math.PI / n));
  const d = r - ir;
  return (
    <g transform={`translate(${r} ${r})`}>
      <circle r={r} />
      <circle r={r * 0.62} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={i}>
            <circle cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={ir} />
            <path d={`M0 0 L${Math.cos(a) * r} ${Math.sin(a) * r}`} />
          </g>
        );
      })}
    </g>
  );
}

// группы каркаса, разложенные по высоте документа
export function Gothic() {
  return (
    <div className="cinebg-goth" aria-hidden="true">
      <svg className="gf gf-1" viewBox="0 0 520 520" fill="none">
        <Rose r={250} n={8} />
      </svg>
      <svg className="gf gf-2" viewBox="0 0 660 420" fill="none">
        <Arcade n={3} w={220} h={300} base={420} />
      </svg>
      <svg className="gf gf-3" viewBox="0 0 320 640" fill="none">
        <path d={lancet(300, 420)} transform="translate(10 0)" />
        <path d="M160 420 L160 640 M10 420 L10 640 M310 420 L310 640" />
      </svg>
      <svg className="gf gf-4" viewBox="0 0 760 460" fill="none">
        <Arcade n={4} w={190} h={330} base={460} />
      </svg>
      <svg className="gf gf-5" viewBox="0 0 360 360" fill="none">
        <Rose r={175} n={6} />
      </svg>
    </div>
  );
}
