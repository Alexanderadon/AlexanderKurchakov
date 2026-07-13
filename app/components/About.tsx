// Секция «Обо мне»: фото, текст, таймлайн опыта, факты и плитка стека.
import { ENSP } from "~/lib/chars";
import { EXPERIENCE } from "~/data/experience";
import { KEY_STACK, STACK } from "~/data/stack";

export function About() {
  return (
    <section id="about" aria-label="Обо мне">
      <div className="shead">
        <div className="h2wrap">
          <span className="lab">
            <b>/02</b>
            {ENSP}коротко
          </span>
          <h2>Обо мне</h2>
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
            <figcaption>Александр Курчаков · 22 года · Алматы</figcaption>
          </figure>
        </div>

        <div className="tile td a-txt rv">
          <span className="lab">
            <b>/</b>
            {ENSP}о работе
          </span>
          <p>
            В разработке с 2019: начинал на фрилансе с сайтов, лого и фирстилей,
            делал сайты федерации QAZAQSTAN RUGBY, вырос до middle
            React-разработчика в QazSoft — SPA на React/Next, микросервисы, 3D на
            Three.js. Сейчас делаю коммерческие продукты: iiko-интеграции для
            HoReCa, платежи Stripe, Web3 — TON Connect и WalletConnect.
            Дизайн-бэкграунд никуда не делся — <em>Figma и код в одних руках.</em>
          </p>
          <div className="a-links">
            <a download="Alexander-Kurchakov-CV.pdf" href="/resume.pdf">
              резюме (PDF)
            </a>
            <a href="mailto:alexanderkurachakov@gmail.com">написать мне</a>
          </div>
          <span className="lab">Алматы · UTC+5</span>
        </div>

        <div className="tile td a-exp rv">
          <span className="lab">/ опыт</span>
          <ol className="xp">
            {EXPERIENCE.map((x) => (
              <li key={x.years}>
                <span className="xy">{x.years}</span>
                <div>
                  <div className="xr">{x.role}</div>
                  <p className="xd">{x.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <span className="lab">
            Образование: IT-колледж + университет (КЗ) · Языки: RU родной · EN B1
          </span>
        </div>

        <div className="a-f" data-st>
          <div className="af rv">
            <span className="lab">опыт</span>
            <div>
              <div className="num">6+</div>
              <p className="cap">лет в разработке и дизайне — с 2019</p>
            </div>
          </div>
          <div className="af rv">
            <span className="lab">сделано</span>
            <div>
              <div className="num b">30+</div>
              <p className="cap">проектов — от лендингов до Web3</p>
            </div>
          </div>
          <div className="af rv">
            <span className="lab">языки</span>
            <div>
              <div className="num" style={{ fontSize: "clamp(20px,2.2vw,34px)" }}>
                RU/KZ/EN
              </div>
              <p className="cap">рабочие языки</p>
            </div>
          </div>
        </div>

        <div className="tile tl a-stack rv">
          <span className="lab">/ инструменты</span>
          <div className="sg sg-key">
            <span className="sg-t">ключевой стек</span>
            <ul>
              {KEY_STACK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="stack">
            {STACK.map((group) => (
              <div className="sg" key={group.title}>
                <span className="sg-t">{group.title}</span>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <span className="lab">один стек — от идеи до релиза</span>
        </div>
      </div>
    </section>
  );
}
