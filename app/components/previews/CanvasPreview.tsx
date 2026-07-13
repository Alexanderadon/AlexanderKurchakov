// Превью карточки /07 мини-игры на Canvas. Портировано 1:1 из site-markup.
export function CanvasPreview() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="640" height="400" fill="#15171B" />
      <g stroke="#1E2126" strokeWidth="1">
        <path d="M80 0v400M160 0v400M240 0v400M320 0v400M400 0v400M480 0v400M560 0v400M0 80h640M0 160h640M0 240h640M0 320h640" />
      </g>
      <g className="pl1">
        <rect x="122" y="122" width="36" height="36" rx="8" fill="#FF5A2C" />
        <rect x="162" y="122" width="36" height="36" rx="8" fill="#FF5A2C" opacity=".85" />
        <rect x="202" y="122" width="36" height="36" rx="8" fill="#FF5A2C" opacity=".7" />
        <rect x="202" y="162" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".6" />
        <rect x="202" y="202" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".45" />
        <rect x="242" y="202" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".3" />
        <circle cx="140" cy="134" r="4" fill="#15171B" />
        <circle cx="152" cy="134" r="4" fill="#15171B" />
        <circle cx="102" cy="140" r="13" fill="#3D6FE0" />
        <path d="M102 122q4-8 10-8" stroke="#3A7D44" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <g className="pl2">
        <circle cx="472" cy="150" r="58" fill="none" stroke="#3D6FE0" strokeWidth="3" opacity=".7" />
        <circle cx="472" cy="150" r="34" fill="none" stroke="#3D6FE0" strokeWidth="3" opacity=".85" />
        <circle cx="472" cy="150" r="10" fill="#FF5A2C" />
        <path d="M472 78v28m0 88v28m-72-72h28m88 0h28" stroke="#EFEDE8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="404" cy="256" r="7" fill="#FF8A5C" />
        <circle cx="540" cy="236" r="5" fill="#FF8A5C" opacity=".7" />
      </g>
      <g className="pl3">
        <text x="122" y="316" fontFamily="ui-monospace,Consolas,monospace" fontSize="20" fill="#EFEDE8" letterSpacing="3">SCORE 042</text>
        <text x="400" y="336" fontFamily="ui-monospace,Consolas,monospace" fontSize="16" fill="#6C6E75" letterSpacing="2">{"<canvas>"}</text>
        <path d="M560 60h14m-7-7v14" stroke="#FF5A2C" strokeWidth="4" strokeLinecap="round" />
        <path d="M66 350h14m-7-7v14" stroke="#3D6FE0" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
