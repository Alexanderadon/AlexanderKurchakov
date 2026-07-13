// Бегущая строка (.mq-tile). Две одинаковые дорожки для бесшовной анимации.
// Средние точки окружены обычными пробелами, хвост — неразрывный пробел (&nbsp;).
const NBSP = " ";

function Line() {
  return (
    <span>
      сайты <b>·</b> игры <b>·</b> айдентика <b>·</b> видео <b>·</b> шеберлік <b>·</b> 匠心 <b>·</b> мастерство <b>·</b>
      {NBSP}
    </span>
  );
}

export function Marquee() {
  return (
    <div className="mq-tile rv">
      <div className="mq" aria-hidden="true">
        <div className="mq-track">
          <Line />
          <Line />
        </div>
      </div>
    </div>
  );
}
