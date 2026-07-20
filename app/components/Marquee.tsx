// Бегущая строка (.mq-tile). Две одинаковые дорожки для бесшовной анимации.
// Слова — из словаря (культурный мотив «шеберлік · 匠心» присутствует во всех языках).
// Средние точки окружены обычными пробелами, хвост — неразрывный пробел (&nbsp;).
import { Fragment } from "react";
import { useLang } from "~/lib/i18n";

const NBSP = " ";

function Line() {
  const { t } = useLang();
  return (
    <span>
      {t.marquee.map((word, i) => (
        <Fragment key={i}>
          {word} <b>·</b>
          {i === t.marquee.length - 1 ? NBSP : " "}
        </Fragment>
      ))}
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
