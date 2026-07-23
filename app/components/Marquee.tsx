// Бегущая строка (.mq-tile). Две одинаковые дорожки для бесшовной анимации.
// Слова — из словаря (культурный мотив «шеберлік · 匠心» присутствует во всех языках).
// Средние точки окружены обычными пробелами, хвост — неразрывный пробел (&nbsp;).
// Вне вьюпорта анимация ставится на паузу (постоянный композитинг греет GPU).
import { Fragment, useEffect, useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const track = el.querySelector<HTMLElement>(".mq-track");
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          track.style.animationPlayState = e.isIntersecting
            ? "running"
            : "paused";
        });
      },
      { rootMargin: "60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mq-tile rv" ref={ref}>
      <div className="mq" aria-hidden="true">
        <div className="mq-track">
          <Line />
          <Line />
        </div>
      </div>
    </div>
  );
}
