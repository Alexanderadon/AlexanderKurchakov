// Строка списка работ (.irow). Нет класса reveal (.rv), поэтому is-hidden/open —
// чистое React-состояние. Показ/скрытие с таймером (330/420мс как в оригинале).
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { WorkItem } from "~/data/works";
import { PreviewClone } from "./previews";

export function IndexRow({
  item,
  index,
  open,
  visible,
  rm,
  flyEnabled,
  clickToggles,
  onToggle,
  onFlyEnter,
  onFlyLeave,
}: {
  item: WorkItem;
  index: number;
  open: boolean;
  visible: boolean;
  rm: boolean;
  flyEnabled: boolean;
  clickToggles: boolean;
  onToggle: (i: number) => void;
  onFlyEnter: (i: number) => void;
  onFlyLeave: (i: number) => void;
}) {
  const [displayNone, setDisplayNone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hideTimer = useRef<number>(0);
  const rafIds = useRef<number[]>([]);
  const firstVisible = useRef(true);

  useEffect(() => {
    if (firstVisible.current) {
      firstVisible.current = false;
      return;
    }
    clearTimeout(hideTimer.current);
    rafIds.current.forEach(cancelAnimationFrame);
    rafIds.current = [];
    if (visible) {
      setDisplayNone(false);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setHidden(false));
        rafIds.current.push(r2);
      });
      rafIds.current.push(r1);
    } else {
      setHidden(true);
      hideTimer.current = window.setTimeout(
        () => setDisplayNone(true),
        rm ? 0 : 420,
      );
    }
    return () => {
      clearTimeout(hideTimer.current);
      rafIds.current.forEach(cancelAnimationFrame);
    };
  }, [visible, rm]);

  const cls = ["irow", open ? "open" : "", hidden ? "is-hidden" : ""]
    .filter(Boolean)
    .join(" ");
  const style: CSSProperties | undefined = displayNone
    ? { display: "none" }
    : undefined;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(index);
    }
  };

  return (
    <article
      className={cls}
      style={style}
      data-cat={item.cat}
      data-i={index}
      tabIndex={0}
      onMouseEnter={flyEnabled ? () => onFlyEnter(index) : undefined}
      onMouseLeave={flyEnabled ? () => onFlyLeave(index) : undefined}
      onClick={clickToggles ? () => onToggle(index) : undefined}
      onKeyDown={onKeyDown}
    >
      <span className="ridx">{item.index}</span>
      <h3 className="rttl">
        {item.listTitle}
        <small>{item.listSub}</small>
      </h3>
      <span className="rcat">{item.listCat}</span>
      <div className="row-pre">{open && <PreviewClone item={item} />}</div>
    </article>
  );
}
