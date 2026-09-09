// Карточка работы (grid). Классы/структура 1:1 с прежней разметкой.
// Видимость (is-hidden + display) и класс reveal (.in) применяются императивно
// на один и тот же узел — поэтому корневой className статичен, а React управляет
// только через prop `visible`. Видео: автоплей по вьюпорту, клик = звук, data-skip.
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
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

// Запас, на котором картинку карточки считаем нужной: 500 px до кадра. Постер
// успевает приехать до того, как карточка войдёт в вид, и подмены пустого
// прямоугольника на картинку никто не видит.
const NEAR_MARGIN = 500;

// «Карточка подошла к экрану» по геометрии, без посредников. Нулевой
// прямоугольник — карточка убрана фильтром (display:none): грузить ей картинку
// не за чем, иначе первый же фильтр вытянул бы всю сетку разом.
function isNear(el: HTMLElement, margin: number): boolean {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  return r.top < window.innerHeight + margin && r.bottom > -margin;
}

// ── Пробуждение отложенной загрузки ──────────────────────────────────────────
// IntersectionObserver считает от геометрии и докладывает, когда та поехала —
// то есть на прокрутке. Но у страницы есть состояния, когда прокрутки не
// происходит вовсе: книга бестиария и заставка держат body{overflow:hidden},
// страница под ними стоит намертво. Замер прод-сборки: сразу после закрытия
// книги 5 карточек из 23 показывали пустой прямоугольник вместо картинки,
// причём длинных задач в этот момент НОЛЬ — поток свободен, карточки просто
// ждут, когда им наконец поставят картинку. Дождались бы они только следующего
// движения колеса — это и есть «пустые прямоугольники вместо карточек».
//
// Ловим сам момент, когда странице возвращают прокрутку: замок снимают через
// style у <body> (бестиарий) и через атрибут data-preload у <html> (заставка).
// Наблюдатель один на весь модуль, а не по штуке на карточку, и все проверки
// сведены в один кадр: 23 чтения rect подряд стоят браузеру один пересчёт
// раскладки, вразнобой — двадцать три.
const wakeSubs = new Set<() => void>();
let wakeObserver: MutationObserver | null = null;
let wakeRaf = 0;

function fireWake(): void {
  if (wakeRaf) return;
  wakeRaf = requestAnimationFrame(() => {
    wakeRaf = 0;
    wakeSubs.forEach((fn) => fn());
  });
}

function onWake(fn: () => void): () => void {
  wakeSubs.add(fn);
  if (!wakeObserver && typeof MutationObserver !== "undefined") {
    wakeObserver = new MutationObserver(fireWake);
    wakeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    wakeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-preload"],
    });
  }
  return () => {
    wakeSubs.delete(fn);
    if (wakeSubs.size) return;
    wakeObserver?.disconnect();
    wakeObserver = null;
    if (wakeRaf) {
      cancelAnimationFrame(wakeRaf);
      wakeRaf = 0;
    }
  };
}

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
  // Ref СТАБИЛЬНЫЙ (useCallback), а не inline-стрелка. Inline-колбэк React зовёт
  // заново на КАЖДЫЙ рендер (новая функция = новый ref), и el.muted = true
  // срабатывал после каждого клика по звуку: пользователь включал звук →
  // setSnd → рендер → ref снова глушил. Отсюда «жать три раза». Глушим один
  // раз при подключении элемента — до автоплея, как и задумано.
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    if (el) {
      el.muted = true; // см. Hero: проп muted в атрибут не попадает
      el.volume = 0.5; // громкость по умолчанию — половина, не оглушать с первого клика
    }
    videoRef.current = el;
  }, []);
  const [vol, setVol] = useState(0.5);
  const hideTimer = useRef<number>(0);
  const rafIds = useRef<number[]>([]);
  const firstVisible = useRef(true);
  const [snd, setSnd] = useState<SndState>("idle");
  // Картинки карточек — 1.6 МБ jpg, и почти все они ниже первого экрана. У
  // атрибута poster нет ленивой загрузки: браузер тянет его всегда и сразу,
  // отбирая полосу у того, что видно немедленно (руки — почти мегабайт). Ставим
  // постер, только когда карточка подходит к экрану; этим же флагом снимаем
  // ленивость с <img> — у подошедшей карточки картинка нужна наверняка, а не по
  // усмотрению эвристики браузера.
  const [near, setNear] = useState(false);
  const sndText =
    snd === "idle"
      ? PLAY + " " + t.video.watch
      : snd === "off"
        ? t.video.sndOff
        : t.video.sndOn;

  // Карточки первого экрана обязаны получать картинку сразу: спрашиваем
  // геометрию сами, тем же тиком. Раньше тут ждали первый колбэк наблюдателя —
  // он приходит кадром позже и после ещё одного рендера, а карточку видно уже
  // сейчас. Экономия трафика от этого не страдает: всё, что дальше 500 px,
  // по-прежнему ждёт наблюдателя и не тянет свои полтора мегабайта вперёд.
  // Без IntersectionObserver (старые движки) грузим сразу — как было.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    // Сразу — ТОЛЬКО то, что действительно в окне (запас 0), а не всё в пределах
    // 500 px. С широким запасом первая загрузка подорожала с 4867 до 6204 мс:
    // лишние постеры декодировались под заставкой. Остальным по-прежнему
    // занимается наблюдатель со своим запасом в 500 px.
    if (isNear(el, 0) || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          done = true;
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: `${NEAR_MARGIN}px` },
    );
    io.observe(el);
    // Страховка на случай, когда геометрия «поехала» без прокрутки: закрылась
    // книга, ушла заставка. Наблюдатель об этом не докладывает, а карточка уже
    // на экране — проверяем сами и, если пора, ставим картинку не дожидаясь
    // колеса. Дальние карточки проверка не задевает: у них rect не в кадре.
    const stopWake = onWake(() => {
      if (done || !isNear(el, NEAR_MARGIN)) return;
      done = true;
      setNear(true);
      io.disconnect();
    });
    return () => {
      io.disconnect();
      stopWake();
    };
  }, []);

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

  const onVol = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = Number(e.target.value) / 100;
    setVol(val);
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    // Тянуть ползунок вверх при выключенном звуке — значит хотеть его слышать.
    if (val > 0 && v.muted && !v.paused) v.muted = false;
    setSnd(v.paused ? "idle" : v.muted ? "off" : "on");
  };
  // Ползунок живёт внутри кликабельной карточки: его клики и клавиши — его.
  const stop = (e: SyntheticEvent): void => e.stopPropagation();
  // Space на ползунке по умолчанию листает страницу — видео уезжает из вьюпорта
  // и наблюдатель ставит его на паузу. Гасим и всплытие, и прокрутку.
  const stopKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    if (e.key === " ") e.preventDefault();
  };

  const onCardClick = (e: MouseEvent<HTMLElement>): void => {
    if ((e.target as HTMLElement).closest("a")) return;
    toggleVid();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
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
            // Пока карточка далеко — ленивая загрузка, как было. Подошла —
            // переводим в eager: смена lazy→eager запускает загрузку сразу, и
            // картинка перестаёт зависеть от эвристики браузера, которая под
            // открытой модалкой карточку из виду не теряет, но и не торопится.
            loading={near ? "eager" : "lazy"}
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
              ref={setVideoRef}
              data-skip={item.dataSkip}
              src={item.videoSrc}
              poster={near ? item.poster : undefined}
              muted
              loop
              playsInline
              preload="none"
              aria-label={item.videoAria}
              style={MEDIA_STYLE}
            />
            <span className="tc mono">{item.badge ?? "reel"}</span>
            <div className="sndbar" onClick={stop}>
              <input
                className="vol"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(vol * 100)}
                onChange={onVol}
                onKeyDown={stopKey}
                aria-label={t.video.vol}
              />
              <span className="snd mono" aria-hidden="true">
                {sndText}
              </span>
            </div>
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
