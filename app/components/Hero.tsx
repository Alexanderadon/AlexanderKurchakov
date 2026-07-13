// Hero: bento-сетка (7 плиток). Имя разбито на буквы декларативно (.ch + --i);
// класс .play-in ставится после маунта (client) при отсутствии reduced-motion.
import { useEffect, useState } from "react";
import { ENSP } from "~/lib/chars";
import { cssVars } from "~/lib/style";
import { prefersReducedMotion } from "~/lib/media";
import { NowPreview } from "./previews/NowPreview";
import { MountainsPreview } from "./previews/MountainsPreview";

const NAME = "АЛЕКСАНДР";

export function Hero() {
  const [playIn, setPlayIn] = useState(false);
  useEffect(() => {
    if (!prefersReducedMotion()) setPlayIn(true);
  }, []);

  return (
    <section id="hero" aria-label="Главная">
      <div className="bento" data-st>
        <div className="tile td t-name rv">
          <div className="hero-top">
            <span className="lab">
              <b>/00</b>
              {ENSP}портфолио — 2026
            </span>
            <span className="lab">Алматы, Казахстан</span>
          </div>
          <h1 id="nm" className={playIn ? "play-in" : undefined} aria-label={NAME}>
            {NAME.split("").map((ch, i) => (
              <span
                key={i}
                className="ch"
                aria-hidden="true"
                style={cssVars({ "--i": i })}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        <div className="tile td t-now rv">
          <span className="lab">
            <b>●</b>
            {ENSP}сейчас в работе
          </span>
          <div className="now-pv">
            <NowPreview />
          </div>
          <div className="now-name">KIDO — SaaS-платформа детских курсов</div>
          <span className="now-line">fix(booking): validation i18n · сегодня</span>
          <div
            className="now-bar"
            role="img"
            aria-label="Готовность MVP примерно 72 процента"
          >
            <i />
          </div>
          <span className="lab">MVP · React Router 7 · Supabase</span>
        </div>

        <div className="tile tl t-role rv">
          <span className="lab">/ роль</span>
          <p className="role">
            разработчик <em>&amp; дизайнер</em>
          </p>
          <p className="sub">
            frontend из Алматы · React, Next.js, Web3 — плюс айдентика, игры и
            видео
          </p>
        </div>

        <div className="tile td t-loc rv">
          <span className="lab">
            <b>◆</b>
            {ENSP}база
          </span>
          <MountainsPreview />
          <div>
            <div className="loc-big">Алматы</div>
            <span className="lab">43.238°N · 76.889°E</span>
          </div>
        </div>

        <div className="tile td t-cont rv">
          <span className="lab">
            <b>/</b>
            {ENSP}контакты
          </span>
          <ul>
            <li>
              <a href="mailto:alexanderkurachakov@gmail.com" className="mg">
                <i />
                alexanderkurachakov@gmail.com
              </a>
            </li>
            <li>
              <a href="https://github.com/Alexanderadon" className="mg">
                <i />
                github.com/Alexanderadon
              </a>
            </li>
            <li>
              <a href="https://www.behance.net/alexanderkurchakov" className="mg">
                <i />
                behance.net/alexanderkurchakov
              </a>
            </li>
          </ul>
        </div>

        <div className="tile td t-fact rv">
          <span className="lab">выпущено</span>
          <div>
            <div className="num">30+</div>
            <p className="cap">проектов — от лендингов до игровых прототипов</p>
          </div>
        </div>

        <div className="tile td t-seal rv">
          <span className="lab">печать</span>
          <div className="seal-big" aria-hidden="true">
            АК
          </div>
          <div>
            <span className="lab">шеберлік · 匠心</span>
            <div className="orn" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
