// Горы в плитке «база» (hero .t-loc .mnt). Портировано 1:1 из site-markup.
export function MountainsPreview() {
  return (
    <svg className="mnt" viewBox="0 0 240 90" aria-hidden="true">
      <polyline
        points="0,84 46,34 78,62 112,22 148,58 186,30 240,78"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="4"
        strokeLinejoin="round"
        opacity=".7"
      />
      <polyline
        points="0,90 56,52 96,74 138,44 176,70 214,50 240,88"
        fill="none"
        stroke="var(--tile2)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
