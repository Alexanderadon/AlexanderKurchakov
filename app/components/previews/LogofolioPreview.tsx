// Превью карточки /04 Логофолио. Портировано 1:1 из site-markup.
export function LogofolioPreview() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="640" height="400" fill="#1A1C1F" />
      <g stroke="#26282E" strokeWidth="1">
        <path d="M160 0v400M320 0v400M480 0v400M0 133h640M0 266h640" />
      </g>
      <g className="pl2">
        <path d="M320 66l86 50v100l-86 50-86-50V116Z" fill="none" stroke="#FF5A2C" strokeWidth="7" strokeLinejoin="round" />
        <path d="M320 112l46 27v54l-46 27-46-27v-54Z" fill="#FF5A2C" />
        <path d="M348 222l40 40" stroke="#FF5A2C" strokeWidth="9" strokeLinecap="round" />
        <path d="M320 139l23 14v27l-23 14-23-14v-27Z" fill="#1A1C1F" />
      </g>
      <g className="pl1">
        <text x="320" y="310" textAnchor="middle" fontFamily="ui-monospace,Consolas,monospace" fontWeight="700" fontSize="34" letterSpacing="10" fill="#EFEDE8">LOGOFOLIO</text>
        <rect x="238" y="330" width="164" height="6" rx="3" fill="#3D6FE0" />
      </g>
      <g className="pl3">
        <rect x="470" y="308" width="130" height="76" rx="10" fill="#F5F4F0" transform="rotate(-6 535 346)" />
        <rect x="484" y="330" width="56" height="7" rx="3.5" fill="#1C1B19" transform="rotate(-6 512 333)" />
        <rect x="484" y="346" width="80" height="5" rx="2.5" fill="#8A867C" transform="rotate(-6 524 348)" />
        <rect x="42" y="42" width="96" height="58" rx="10" fill="#3D6FE0" transform="rotate(5 90 71)" />
        <path d="M66 76l14-18 14 18" stroke="#EFEDE8" strokeWidth="4" fill="none" transform="rotate(5 90 71)" />
      </g>
    </svg>
  );
}
