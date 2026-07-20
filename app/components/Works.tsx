// Секция «Работы»: фильтры (pills) + тумблер вид (сетка/список) + сетка + список
// + плавающее превью за курсором. Состояние (категория/вид/открытая строка/фильтр
// превью) — React; позиции индикаторов, кроссфейд и rAF-превью — типизированные эффекты.
import { useEffect, useRef, useState } from "react";
import type { FilterCategory, WorkItem } from "~/data/works";
import { WORKS, PILLS } from "~/data/works";
import { ENSP } from "~/lib/chars";
import { useLang } from "~/lib/i18n";
import { usePrefs } from "~/lib/prefs";
import { useWorks } from "~/lib/works-context";
import { useMascot } from "~/lib/mascot";
import { pointerFine, prefersReducedMotion } from "~/lib/media";
import { WorkCard } from "./WorkCard";
import { IndexRow } from "./IndexRow";
import { PreviewClone } from "./previews";

function isVisible(item: WorkItem, cat: FilterCategory): boolean {
  return cat === "all" || item.cat === cat;
}

function moveInd(marker: HTMLElement | null, btn: HTMLElement | null): void {
  if (!marker || !btn) return;
  marker.style.width = btn.offsetWidth + "px";
  marker.style.transform = "translateX(" + btn.offsetLeft + "px)";
}

export function Works() {
  const { t, lang } = useLang();
  const { category, setCategory } = useWorks();
  const { setFigure } = useMascot();
  const { fonts } = usePrefs();

  const [view, setViewState] = useState<"grid" | "list">("grid");
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [flyIndex, setFlyIndex] = useState<number | null>(null);
  const [flyEnabled, setFlyEnabled] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [rm, setRm] = useState(false);

  const pillsRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLDivElement>(null);
  const vmodeRef = useRef<HTMLDivElement>(null);
  const vindRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const flyPos = useRef({ x: 0, y: 0 });
  const flyIndexRef = useRef<number | null>(null);
  flyIndexRef.current = flyIndex;

  const firstView = useRef(true);
  const viewTimer = useRef<number>(0);
  const viewRafs = useRef<number[]>([]);

  // media-флаги (клиент)
  useEffect(() => {
    const fine = pointerFine();
    const reduce = prefersReducedMotion();
    setFlyEnabled(fine && !reduce);
    setCoarse(!fine);
    setRm(reduce);
  }, []);

  // фильтр меняется → прячем превью и закрываем строку, если она уходит из выборки
  useEffect(() => {
    setFlyIndex(null);
    setOpenRow((prev) =>
      prev != null && !isVisible(WORKS[prev], category) ? null : prev,
    );
  }, [category]);

  // позиции индикаторов .ind / .vind (после маунта, ресайза и готовности шрифтов)
  useEffect(() => {
    const position = (): void => {
      moveInd(
        indRef.current,
        pillsRef.current?.querySelector<HTMLElement>(
          `[data-cat="${category}"]`,
        ) ?? null,
      );
      moveInd(
        vindRef.current,
        vmodeRef.current?.querySelector<HTMLElement>(
          `[data-view="${view}"]`,
        ) ?? null,
      );
    };
    position();
    window.addEventListener("resize", position);
    let cancelled = false;
    const fontSet = document.fonts;
    if (fontSet && fontSet.ready)
      fontSet.ready.then(() => !cancelled && position()).catch(() => {});
    return () => {
      cancelled = true;
      window.removeEventListener("resize", position);
    };
  }, [category, view, fonts, lang]);

  // кроссфейд сетка ↔ список (пропускаем первый рендер)
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const grid = gridRef.current;
    const list = listRef.current;
    if (!grid || !list) return;
    const RM = prefersReducedMotion();
    const out = view === "list" ? grid : list;
    const inn = view === "list" ? list : grid;
    setFlyIndex(null);
    clearTimeout(viewTimer.current);
    viewRafs.current.forEach(cancelAnimationFrame);
    viewRafs.current = [];
    out.classList.add("fade");
    viewTimer.current = window.setTimeout(
      () => {
        out.hidden = true;
        inn.hidden = false;
        inn.classList.add("fade");
        const r1 = requestAnimationFrame(() => {
          const r2 = requestAnimationFrame(() => inn.classList.remove("fade"));
          viewRafs.current.push(r2);
        });
        viewRafs.current.push(r1);
      },
      RM ? 0 : 240,
    );
    return () => {
      clearTimeout(viewTimer.current);
      viewRafs.current.forEach(cancelAnimationFrame);
    };
  }, [view]);

  const flyTarget = (): [number, number] => {
    const fly = flyRef.current;
    const w = fly?.offsetWidth || 340;
    const h = fly?.offsetHeight || 214;
    return [
      Math.min(Math.max(mouse.current.x + 30, 12), window.innerWidth - w - 12),
      Math.min(Math.max(mouse.current.y - h - 26, 12), window.innerHeight - h - 12),
    ];
  };

  // плавающее превью: трекинг мыши + rAF-lerp (только pointer:fine, без reduced-motion)
  useEffect(() => {
    mouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (!flyEnabled) return;
    const onMove = (e: MouseEvent): void => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    let raf = 0;
    const loop = (): void => {
      if (flyIndexRef.current != null && flyRef.current) {
        const t = flyTarget();
        flyPos.current.x += (t[0] - flyPos.current.x) * 0.13;
        flyPos.current.y += (t[1] - flyPos.current.y) * 0.13;
        flyRef.current.style.transform = `translate3d(${flyPos.current.x}px,${flyPos.current.y}px,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [flyEnabled]);

  const setView = (v: "grid" | "list"): void => {
    if (v === view) return;
    setViewState(v);
    if (v === "list") setFigure("wide", t.mascot.listView);
    else setFigure("buddy", t.mascot.gridView);
  };

  const onFlyEnter = (i: number): void => {
    setFlyIndex(i);
    const t = flyTarget();
    flyPos.current.x = t[0];
    flyPos.current.y = t[1];
    if (flyRef.current)
      flyRef.current.style.transform = `translate3d(${t[0]}px,${t[1]}px,0)`;
  };
  const onFlyLeave = (i: number): void => {
    setFlyIndex((cur) => (cur === i ? null : cur));
  };
  const toggleRow = (i: number): void =>
    setOpenRow((prev) => (prev === i ? null : i));

  return (
    <>
      <section id="works" aria-label="Работы">
        <div className="shead">
          <div className="h2wrap">
            <span className="lab">
              <b>/01</b>
              {ENSP}
              {t.works.label}
            </span>
            <h2>{t.works.title}</h2>
          </div>
          <div className="ctrls">
            <div
              className="pills"
              role="group"
              aria-label="Фильтр работ"
              ref={pillsRef}
            >
              <div className="ind" aria-hidden="true" ref={indRef} />
              {PILLS.map((p) => (
                <button
                  key={p.cat}
                  className="pill"
                  data-cat={p.cat}
                  aria-pressed={category === p.cat}
                  onClick={() => setCategory(p.cat)}
                >
                  {p.label[lang]}
                </button>
              ))}
            </div>
            <div
              className="vmode"
              role="group"
              aria-label="Вид списка работ"
              id="vmode"
              ref={vmodeRef}
            >
              <div className="vind" aria-hidden="true" ref={vindRef} />
              <button
                data-view="grid"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                {t.works.grid}
              </button>
              <button
                data-view="list"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                {t.works.list}
              </button>
            </div>
          </div>
        </div>

        <div className="wview" id="worksGrid" ref={gridRef}>
          <div className="works" data-st="">
            {WORKS.map((item) => (
              <WorkCard
                key={item.index}
                item={item}
                visible={isVisible(item, category)}
                rm={rm}
              />
            ))}
          </div>
        </div>

        <div className="wview index" id="worksList" ref={listRef} hidden>
          {WORKS.map((item, i) => (
            <IndexRow
              key={item.index}
              item={item}
              index={i}
              open={openRow === i}
              visible={isVisible(item, category)}
              rm={rm}
              flyEnabled={flyEnabled}
              clickToggles={coarse}
              onToggle={toggleRow}
              onFlyEnter={onFlyEnter}
              onFlyLeave={onFlyLeave}
            />
          ))}
        </div>
      </section>

      <div
        className={"fly" + (flyIndex != null ? " show" : "")}
        id="fly"
        ref={flyRef}
        aria-hidden="true"
      >
        <div className="fly-in" id="flyIn">
          {flyIndex != null && <PreviewClone item={WORKS[flyIndex]} />}
        </div>
      </div>
    </>
  );
}
