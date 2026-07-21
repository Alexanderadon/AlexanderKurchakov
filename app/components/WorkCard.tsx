// Карточка работы (grid). Классы/структура 1:1 с прежней разметкой.
// Видимость (is-hidden + display) и класс reveal (.in) применяются императивно
// на один и тот же узел — поэтому корневой className статичен, а React управляет
// только через prop `visible`. Видео: автоплей по вьюпорту, клик = звук, data-skip.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import type { WorkItem } from "~/data/works";
import { ARROW, PLAY } from "~/lib/chars";
import { useLang } from "~/lib/i18n";
import { prefersReducedMotion } from "~/lib/media";
import { PreviewArt } from "./previews";

const MEDIA_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

// Статус подписи звука: idle → «смотреть», off/on → «звук выкл/вкл» (текст — из словаря).
type SndState = "idle" | "off" | "on";

function rootClass(item: WorkItem): string {
  return [
    "work",
    item.wide ? "w2" : "",
    item.kind === "video" ? "vid" : "",
    "rv",
  ]
    .filter(Boolean)
    .join(" ");
}

export function WorkCard({
  item,
  visible,
  rm,
}: {
  item: WorkItem;
  visible: boolean;
  rm: boolean;
}) {
  const { t, lang } = useLang();
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number>(0);
  const rafIds = useRef<number[]>([]);
  const firstVisible = useRef(true);
  const [snd, setSnd] = useState<SndState>("idle");
  const sndText =
    snd === "idle"
      ? PLAY + " " + t.video.watch
      : snd === "off"
        ? t.video.sndOff
        : t.video.sndOn;

  // Показ/скрытие при фильтрации — таймер на элементе, без гонок (как toggleItem).
  useEffect(() => {
    if (firstVisible.current) {
      firstVisible.current = false;
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    clearTimeout(hideTimer.current);
    rafIds.current.forEach(cancelAnimationFrame);
    rafIds.current = [];
    if (visible) {
      el.style.display = "";
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => el.classList.remove("is-hidden"));
        rafIds.current.push(r2);
      });
      rafIds.current.push(r1);
    } else {
      el.classList.add("is-hidden");
      el.classList.remove("open");
      hideTimer.current = window.setTimeout(
        () => {
          el.style.display = "none";
        },
        rm ? 0 : 330,
      );
    }
    return () => {
      clearTimeout(hideTimer.current);
      rafIds.current.forEach(cancelAnimationFrame);
    };
  }, [visible, rm]);

  // Видео: автоплей по вьюпорту (muted), синхронизация подписи, data-skip.
  useEffect(() => {
    if (item.kind !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // React не всегда рендерит атрибут muted — гарантируем свойство
    const RM = prefersReducedMotion();
    const syncSnd = (): void =>
      setSnd(v.paused ? "idle" : v.muted ? "off" : "on");
    const onPlay = (): void => {
      if (item.dataSkip && v.currentTime < item.dataSkip)
        v.currentTime = item.dataSkip;
      syncSnd();
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", syncSnd);
    syncSnd();
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              if (!RM && v.paused) {
                const p = v.play();
                if (p && typeof p.catch === "function") p.catch(() => {});
              }
            } else if (!v.paused) {
              v.pause();
            }
          });
        },
        { threshold: 0.25 },
      );
      io.observe(v);
    }
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", syncSnd);
      io?.disconnect();
    };
  }, [item]);

  const toggleVid = (): void => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.muted = !v.muted;
    }
    setSnd(v.paused ? "idle" : v.muted ? "off" : "on");
  };

  const onCardClick = (e: MouseEvent<HTMLElement>): void => {
    if ((e.target as HTMLElement).closest("a")) return;
    toggleVid();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleVid();
    }
  };

  const isVideo = item.kind === "video";

  return (
    <article
      ref={cardRef}
      className={rootClass(item)}
      data-cat={item.cat}
      tabIndex={item.linkHref ? undefined : 0}
      onClick={isVideo ? onCardClick : undefined}
      onKeyDown={isVideo ? onKeyDown : undefined}
    >
      {item.linkHref && (
        <a
          className="wlink"
          href={item.linkHref}
          target="_blank"
          rel="noopener"
          aria-label={item.linkAria?.[lang]}
        />
      )}
      <div className="pv">
        {item.kind === "svg" && item.preview && (
          <PreviewArt preview={item.preview} />
        )}
        {item.kind === "img" && (
          <img
            src={item.imgSrc}
            alt={item.imgAlt}
            loading="lazy"
            style={
              item.imgPos
                ? { ...MEDIA_STYLE, objectPosition: item.imgPos }
                : MEDIA_STYLE
            }
          />
        )}
        {isVideo && (
          <>
            <video
              ref={videoRef}
              data-skip={item.dataSkip}
              src={item.videoSrc}
              poster={item.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label={item.videoAria}
              style={MEDIA_STYLE}
            />
            <span className="tc mono">{item.badge ?? "reel"}</span>
            <span className="snd mono" aria-hidden="true">
              {sndText}
            </span>
          </>
        )}
        {isVideo ? (
          <a
            className="arr"
            href={item.reelHref}
            target="_blank"
            rel="noopener"
            aria-label={item.reelAria}
          >
            {ARROW}
          </a>
        ) : (
          <span className="arr" aria-hidden="true">
            {ARROW}
          </span>
        )}
      </div>
      <div className="wm">
        <div className="row">
          <span className="wi">{item.index}</span>
          <h3>{item.title[lang]}</h3>
        </div>
        <span className="tag">
          <span className={"dot " + item.dot} />
          {item.tag[lang]}
        </span>
      </div>
    </article>
  );
}
