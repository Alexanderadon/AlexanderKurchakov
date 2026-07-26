// Hero: bento-сетка (7 плиток). Имя разбито на буквы декларативно (.ch + --i);
// класс .play-in ставится после маунта (client) при отсутствии reduced-motion.
import { useEffect, useState } from "react";
import { ENSP } from "~/lib/chars";
import { useLang } from "~/lib/i18n";
import { cssVars } from "~/lib/style";
import { prefersReducedMotion } from "~/lib/media";
import { NowPreview } from "./previews/NowPreview";
import { MountainsPreview } from "./previews/MountainsPreview";

const NAME = "АЛЕКСАНДР";

export function Hero() {
  const { t } = useLang();
  const [playIn, setPlayIn] = useState(false);
  useEffect(() => {
    if (!prefersReducedMotion()) setPlayIn(true);
  }, []);

  return (
    <section id="hero" aria-label="Главная">
      <div className="bento" data-st>
        <div className="tile td t-name t-video rv">
          <video
            className="hero-video"
            src="/video/hero.mp4"
            poster="/video/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={NAME}
          />
          <div className="hero-top">
            <span className="lab">
              <b>/00</b>
              {ENSP}
              {t.hero.portfolio}
            </span>
            <span className="lab">{t.hero.location}</span>
          </div>
          <h1 hidden id="nm" className={playIn ? "play-in" : undefined} aria-label={NAME}>
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
            {ENSP}
            {t.hero.now}
          </span>
          <div className="now-pv">
            <NowPreview />
          </div>
          <div className="now-name">{t.hero.nowName}</div>
          <span className="now-line">{t.hero.nowLine}</span>
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
          <span className="lab">{t.hero.roleLabel}</span>
          <p className="role">
            {t.hero.roleA} <em>{t.hero.roleB}</em>
          </p>
          <p className="sub">{t.hero.roleSub}</p>
        </div>

        <div className="tile td t-loc rv">
          <span className="lab">
            <b>◆</b>
            {ENSP}
            {t.hero.base}
          </span>
          <MountainsPreview />
          <div>
            <div className="loc-big">{t.hero.city}</div>
            <span className="lab">43.238°N · 76.889°E</span>
          </div>
        </div>

        <div className="tile td t-cont rv">
          <span className="lab">
            <b>/</b>
            {ENSP}
            {t.hero.contacts}
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
          <span className="lab">{t.hero.released}</span>
          <div>
            <div className="num">30+</div>
            <p className="cap">{t.hero.releasedCap}</p>
          </div>
        </div>

        <div className="tile td t-seal rv">
          <span className="lab">{t.hero.seal}</span>
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
