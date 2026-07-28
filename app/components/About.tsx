// Секция «Обо мне»: фото, текст, таймлайн опыта, факты и плитка стека.
// Тексты — из словаря; навыки-чипы и техтермины не переводятся.
import { ENSP } from "~/lib/chars";
import { useLang } from "~/lib/i18n";
import { EXPERIENCE } from "~/data/experience";
import { KEY_STACK, STACK } from "~/data/stack";

export function About() {
  const { t, lang } = useLang();
  return (
    <section id="about" aria-label="Обо мне">
      <div className="shead">
        <div className="h2wrap">
          <span className="lab">
            <b>/02</b>
            {ENSP}
            {t.about.label}
          </span>
          <h2>{t.about.title}</h2>
        </div>
      </div>
      <div className="about" data-st>
        <div className="a-col">
          <figure className="tile td a-photo rv">
            <img
              src="/photo/avatar.jpg"
              alt="Александр Курчаков"
              width="320"
              height="320"
            />
            <figcaption>{t.about.photoCaption}</figcaption>
          </figure>
        </div>

        <div className="tile td a-txt rv">
          <span className="lab">
            <b>/</b>
            {ENSP}
            {t.about.workLabel}
          </span>
          <p>
            {t.about.bio}
            <em>{t.about.bioEm}</em>
          </p>
          <div className="a-links">
            <a download="Alexander-Kurchakov-CV.pdf" href="/resume.pdf">
              {t.about.resume}
            </a>
            <a href="mailto:alexanderkurachakov@gmail.com">{t.about.write}</a>
          </div>
          <span className="lab">{t.about.tz}</span>
        </div>

        <div className="tile td a-exp rv">
          <span className="lab">{t.about.expLabel}</span>
          <ol className="xp">
            {EXPERIENCE.map((x) => (
              <li key={x.years.ru}>
                <span className="xy">{x.years[lang]}</span>
                <div>
                  <div className="xr">{x.role[lang]}</div>
                  <p className="xd">{x.desc[lang]}</p>
                </div>
              </li>
            ))}
          </ol>
          <span className="lab">{t.about.education}</span>
        </div>

        <div className="a-f" data-st>
          <div className="af rv">
            <span className="lab">{t.about.factExp}</span>
            <div>
              <div className="num">6+</div>
              <p className="cap">{t.about.factExpCap}</p>
            </div>
          </div>
          <div className="af rv">
            <span className="lab">{t.about.factDone}</span>
            <div>
              <div className="num b">150+</div>
              <p className="cap">{t.about.factDoneCap}</p>
            </div>
          </div>
          <div className="af rv">
            <span className="lab">{t.about.factLangs}</span>
            <div>
              <div className="num" style={{ fontSize: "clamp(20px,2.2vw,34px)" }}>
                RU/KZ/EN
              </div>
              <p className="cap">{t.about.factLangsCap}</p>
            </div>
          </div>
        </div>

        <div className="tile tl a-stack rv">
          <span className="lab">{t.about.toolsLabel}</span>
          <div className="sg sg-key">
            <span className="sg-t">{t.about.keyStack}</span>
            <ul>
              {KEY_STACK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="stack">
            {STACK.map((group) => (
              <div className="sg" key={group.title.ru}>
                <span className="sg-t">{group.title[lang]}</span>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <span className="lab">{t.about.oneStack}</span>
        </div>
      </div>
    </section>
  );
}
