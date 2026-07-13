// Разметка сайта — портирована 1:1 из утверждённого макета bento-v2 (media вынесены в /public).
// Инъекция через dangerouslySetInnerHTML в app/routes/home.tsx; интерактивность — app/site-script.ts.
export const SITE_MARKUP = `<div class="amb" aria-hidden="true"><i></i><i></i><i></i></div>

<header>
  <div class="hwrap">
    <a class="seal" href="#top" aria-label="АК — на главную">АК</a>
    <span class="hname">курчаков · портфолио</span>
    <nav aria-label="Разделы">
      <a href="#works" data-goto="all" class="mg">Работы</a>
      <a href="#works" data-goto="games" class="mg">Игры</a>
      <a href="#works" data-goto="video" class="mg">Видео</a>
      <a href="#about" class="mg keep">Обо мне</a>
    </nav>
    <div class="langs" role="group" aria-label="Язык">
      <button aria-pressed="false">KZ</button>
      <button aria-pressed="true">RU</button>
      <button aria-pressed="false">EN</button>
    </div>
  </div>
</header>

<main id="top">

  
  <section id="hero" aria-label="Главная">
    <div class="bento" data-st>
      <div class="tile td t-name rv">
        <div class="hero-top">
          <span class="lab"><b>/00</b>&ensp;портфолио — 2026</span>
          <span class="lab">Алматы, Казахстан</span>
        </div>
        <h1 id="nm">АЛЕКСАНДР</h1>
      </div>

      <div class="tile td t-now rv">
        <span class="lab"><b>●</b>&ensp;сейчас в работе</span>
        <div class="now-pv">
          <svg viewBox="0 0 360 218" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="360" height="218" fill="#131418"/>
            <rect x="18" y="16" width="324" height="186" rx="10" fill="#0D0E11" stroke="#26282E" stroke-width="2"/>
            <path d="M18 28c0-7 5-12 12-12h300c7 0 12 5 12 12v14H18Z" fill="#1D1F24"/>
            <circle cx="34" cy="29" r="4" fill="#FF5A2C"/><circle cx="48" cy="29" r="4" fill="#3D6FE0"/><circle cx="62" cy="29" r="4" fill="#3A3D45"/>
            <rect x="34" y="56" width="86" height="130" rx="8" fill="#181A1F"/>
            <rect x="42" y="66" width="70" height="8" rx="4" fill="#33353A"/>
            <rect x="42" y="82" width="70" height="26" rx="6" fill="#22252B"/><rect x="48" y="91" width="42" height="8" rx="4" fill="#FF5A2C"/>
            <rect x="42" y="114" width="70" height="26" rx="6" fill="#22252B"/><rect x="48" y="123" width="34" height="8" rx="4" fill="#3D6FE0"/>
            <rect x="130" y="56" width="86" height="130" rx="8" fill="#181A1F"/>
            <rect x="138" y="66" width="70" height="8" rx="4" fill="#33353A"/>
            <rect x="138" y="82" width="70" height="26" rx="6" fill="#22252B"/><rect x="144" y="91" width="52" height="8" rx="4" fill="#4A4D55"/>
            <rect x="226" y="56" width="86" height="130" rx="8" fill="#181A1F"/>
            <rect x="234" y="66" width="70" height="8" rx="4" fill="#33353A"/>
            <rect x="234" y="82" width="70" height="26" rx="6" fill="#22252B"/><rect x="240" y="91" width="46" height="8" rx="4" fill="#4A4D55"/>
            <circle cx="300" cy="170" r="17" fill="#FF5A2C"/>
            <path d="M293 170h14m-7-7v14" stroke="#131418" stroke-width="3.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="now-name">KIDO — SaaS-платформа детских курсов</div>
        <span class="now-line">fix(booking): validation i18n · сегодня</span>
        <div class="now-bar" role="img" aria-label="Готовность MVP примерно 72 процента"><i></i></div>
        <span class="lab">MVP · React Router 7 · Supabase</span>
      </div>

      <div class="tile tl t-role rv">
        <span class="lab">/ роль</span>
        <p class="role">разработчик <em>&amp; дизайнер</em></p>
        <p class="sub">frontend из Алматы · React, Next.js, Web3 — плюс айдентика, игры и видео</p>
      </div>

      <div class="tile td t-loc rv">
        <span class="lab"><b>◆</b>&ensp;база</span>
        <svg class="mnt" viewBox="0 0 240 90" aria-hidden="true">
          <polyline points="0,84 46,34 78,62 112,22 148,58 186,30 240,78" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round" opacity=".7"/>
          <polyline points="0,90 56,52 96,74 138,44 176,70 214,50 240,88" fill="none" stroke="var(--tile2)" stroke-width="4" stroke-linejoin="round"/>
        </svg>
        <div>
          <div class="loc-big">Алматы</div>
          <span class="lab">43.238°N · 76.889°E</span>
        </div>
      </div>

      <div class="tile td t-cont rv">
        <span class="lab"><b>/</b>&ensp;контакты</span>
        <ul>
          <li><a href="mailto:alexanderkurachakov@gmail.com" class="mg"><i></i>alexanderkurachakov@gmail.com</a></li>
          <li><a href="https://github.com/Alexanderadon" class="mg"><i></i>github.com/Alexanderadon</a></li>
          <li><a href="https://www.behance.net/alexanderkurchakov" class="mg"><i></i>behance.net/alexanderkurchakov</a></li>
        </ul>
      </div>

      <div class="tile td t-fact rv">
        <span class="lab">выпущено</span>
        <div>
          <div class="num">30+</div>
          <p class="cap">проектов — от лендингов до игровых прототипов</p>
        </div>
      </div>

      <div class="tile td t-seal rv">
        <span class="lab">печать</span>
        <div class="seal-big" aria-hidden="true">АК</div>
        <div>
          <span class="lab">шеберлік · 匠心</span>
          <div class="orn" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
  </section>

  
  <div class="mq-tile rv">
    <div class="mq" aria-hidden="true">
      <div class="mq-track">
        <span>сайты <b>·</b> игры <b>·</b> айдентика <b>·</b> видео <b>·</b> шеберлік <b>·</b> 匠心 <b>·</b> мастерство <b>·</b>&nbsp;</span>
        <span>сайты <b>·</b> игры <b>·</b> айдентика <b>·</b> видео <b>·</b> шеберлік <b>·</b> 匠心 <b>·</b> мастерство <b>·</b>&nbsp;</span>
      </div>
    </div>
  </div>

  
  <section id="works" aria-label="Работы">
    <div class="shead">
      <div class="h2wrap">
        <span class="lab"><b>/01</b>&ensp;избранное 2021–2026</span>
        <h2>Работы</h2>
      </div>
      <div class="ctrls">
        <div class="pills" role="group" aria-label="Фильтр работ">
          <div class="ind" aria-hidden="true"></div>
          <button class="pill" data-cat="all" aria-pressed="true">Все</button>
          <button class="pill" data-cat="sites" aria-pressed="false">Сайты</button>
          <button class="pill" data-cat="design" aria-pressed="false">Дизайн</button>
          <button class="pill" data-cat="games" aria-pressed="false">Игры</button>
          <button class="pill" data-cat="video" aria-pressed="false">Видео</button>
          <button class="pill" data-cat="logo" aria-pressed="false">Лого</button>
        </div>
        <div class="vmode" role="group" aria-label="Вид списка работ" id="vmode">
          <div class="vind" aria-hidden="true"></div>
          <button data-view="grid" aria-pressed="true">сетка</button>
          <button data-view="list" aria-pressed="false">список</button>
        </div>
      </div>
    </div>

    
    <div class="wview" id="worksGrid">
    <div class="works" data-st>
      
      <article class="work w2 rv" data-cat="sites" tabindex="0">
        <div class="pv">
          <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="640" height="400" fill="#EFEDE8"/>
            <g class="pl1">
              <rect x="56" y="42" width="528" height="340" rx="18" fill="#FBFAF7" stroke="#1C1B19" stroke-width="3"/>
              <path d="M56 60c0-10 8-18 18-18h492c10 0 18 8 18 18v28H56Z" fill="#1C1B19"/>
              <circle cx="84" cy="65" r="6" fill="#FF5A2C"/><circle cx="104" cy="65" r="6" fill="#3D6FE0"/><circle cx="124" cy="65" r="6" fill="#EFEDE8" opacity=".45"/>
              <rect x="150" y="54" width="230" height="22" rx="11" fill="#33353A"/>
              <rect x="164" y="61" width="120" height="8" rx="4" fill="#6C6E75"/>
            </g>
            <g class="pl2">
              <rect x="84" y="112" width="128" height="28" rx="14" fill="#1C1B19"/><rect x="97" y="122" width="70" height="8" rx="4" fill="#EFEDE8"/>
              <rect x="222" y="112" width="96" height="28" rx="14" fill="#E2DDD2"/><rect x="234" y="122" width="56" height="8" rx="4" fill="#8A867C"/>
              <rect x="328" y="112" width="96" height="28" rx="14" fill="#E2DDD2"/><rect x="340" y="122" width="56" height="8" rx="4" fill="#8A867C"/>
              <rect x="84" y="162" width="150" height="190" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <rect x="84" y="162" width="150" height="76" rx="14" fill="#FF5A2C"/><rect x="84" y="222" width="150" height="16" fill="#FF5A2C"/>
              <circle cx="130" cy="200" r="17" fill="#FFD9CC"/><path d="M118 209l12-22 12 22Z" fill="#1C1B19"/>
              <rect x="98" y="252" width="104" height="10" rx="5" fill="#1C1B19"/>
              <rect x="98" y="272" width="122" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="98" y="288" width="86" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="98" y="314" width="72" height="24" rx="12" fill="#3D6FE0"/><rect x="110" y="322" width="48" height="8" rx="4" fill="#EFEDE8"/>
              <rect x="250" y="162" width="150" height="190" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <rect x="250" y="162" width="150" height="76" rx="14" fill="#3D6FE0"/><rect x="250" y="222" width="150" height="16" fill="#3D6FE0"/>
              <circle cx="310" cy="196" r="14" fill="#BFD0F5"/><circle cx="336" cy="212" r="9" fill="#BFD0F5"/><circle cx="288" cy="214" r="7" fill="#BFD0F5"/>
              <rect x="264" y="252" width="96" height="10" rx="5" fill="#1C1B19"/>
              <rect x="264" y="272" width="118" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="264" y="288" width="80" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="264" y="314" width="72" height="24" rx="12" fill="#1C1B19"/><rect x="276" y="322" width="48" height="8" rx="4" fill="#EFEDE8"/>
              <rect x="416" y="162" width="150" height="190" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <rect x="416" y="162" width="150" height="76" rx="14" fill="#1C1B19"/><rect x="416" y="222" width="150" height="16" fill="#1C1B19"/>
              <path d="M462 214l14-26 14 26h14l8-14 10 14" stroke="#FF8A5C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="430" y="252" width="100" height="10" rx="5" fill="#1C1B19"/>
              <rect x="430" y="272" width="120" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="430" y="288" width="84" height="8" rx="4" fill="#B9B4A8"/>
              <rect x="430" y="314" width="72" height="24" rx="12" fill="#FF5A2C"/><rect x="442" y="322" width="48" height="8" rx="4" fill="#1C1B19"/>
            </g>
            <g class="pl3">
              <circle cx="574" cy="132" r="34" fill="#FF5A2C"/>
              <text x="574" y="141" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="24" fill="#1C1B19">K</text>
              <circle cx="60" cy="368" r="16" fill="#3D6FE0"/><path d="M60 360v10m0 0-5-5m5 5 5-5" stroke="#EFEDE8" stroke-width="3" stroke-linecap="round" fill="none"/>
            </g>
          </svg>
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/01</span><h3>KIDO — SaaS-каталог детских курсов</h3></div>
          <span class="tag"><span class="dot b"></span>Сайты · React Router 7 · Supabase · Stripe · 2026</span>
        </div>
      </article>

      
      <article class="work vid rv" data-cat="video" tabindex="0">
        <div class="pv">
          <video src="/video/neuro.mp4" poster="/img/works/neuro-poster.jpg" muted loop playsinline preload="none" aria-label="Обложка reel «Нейрошлем из будущего» — концепт нейрошлема и мобильного приложения" style="width:100%;height:100%;object-fit:cover;display:block"></video>
          <span class="tc mono">reel</span>
          <span class="snd mono" aria-hidden="true">&#9654; смотреть</span>
          <a class="arr" href="https://www.instagram.com/reel/C9edRfvOm2O/" target="_blank" rel="noopener" aria-label="Открыть reel «Нейрошлем из будущего» в Instagram">&#8599;</a>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/02</span><h3>Нейрошлем из будущего — концепт</h3></div>
          <span class="tag"><span class="dot f"></span>Видео · «Креативный взгляд» · Instagram · 2024</span>
        </div>
      </article>

      
      <article class="work vid rv" data-cat="design" tabindex="0">
        <div class="pv">
          <video data-skip="1.2" src="/video/trendova.mp4" poster="/img/works/trendova-poster.jpg" muted loop playsinline preload="none" aria-label="Trendova — главная страница интернет-магазина одежды" style="width:100%;height:100%;object-fit:cover;display:block"></video>
          <span class="tc mono">reel</span>
          <span class="snd mono" aria-hidden="true">&#9654; смотреть</span>
          <a class="arr" href="https://www.instagram.com/reel/C9urgKFSMFV/" target="_blank" rel="noopener" aria-label="Открыть showcase Trendova в Instagram">&#8599;</a>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/03</span><h3>Trendova — магазин одежды</h3></div>
          <span class="tag"><span class="dot f"></span>Дизайн · UI/UX · e-commerce · 2024</span>
        </div>
      </article>

      
      <article class="work rv" data-cat="logo" tabindex="0">
        <div class="pv">
          <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="640" height="400" fill="#1A1C1F"/>
            <g stroke="#26282E" stroke-width="1"><path d="M160 0v400M320 0v400M480 0v400M0 133h640M0 266h640"/></g>
            <g class="pl2">
              <path d="M320 66l86 50v100l-86 50-86-50V116Z" fill="none" stroke="#FF5A2C" stroke-width="7" stroke-linejoin="round"/>
              <path d="M320 112l46 27v54l-46 27-46-27v-54Z" fill="#FF5A2C"/>
              <path d="M348 222l40 40" stroke="#FF5A2C" stroke-width="9" stroke-linecap="round"/>
              <path d="M320 139l23 14v27l-23 14-23-14v-27Z" fill="#1A1C1F"/>
            </g>
            <g class="pl1">
              <text x="320" y="310" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-weight="700" font-size="34" letter-spacing="10" fill="#EFEDE8">LOGOFOLIO</text>
              <rect x="238" y="330" width="164" height="6" rx="3" fill="#3D6FE0"/>
            </g>
            <g class="pl3">
              <rect x="470" y="308" width="130" height="76" rx="10" fill="#F5F4F0" transform="rotate(-6 535 346)"/>
              <rect x="484" y="330" width="56" height="7" rx="3.5" fill="#1C1B19" transform="rotate(-6 512 333)"/>
              <rect x="484" y="346" width="80" height="5" rx="2.5" fill="#8A867C" transform="rotate(-6 524 348)"/>
              <rect x="42" y="42" width="96" height="58" rx="10" fill="#3D6FE0" transform="rotate(5 90 71)"/>
              <path d="M66 76l14-18 14 18" stroke="#EFEDE8" stroke-width="4" fill="none" transform="rotate(5 90 71)"/>
            </g>
          </svg>
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/04</span><h3>Логотипы и фирстили — фриланс</h3></div>
          <span class="tag"><span class="dot b"></span>Лого · 2019–2021 · подборка скоро</span>
        </div>
      </article>

      
      <article class="work w2 rv" data-cat="sites">
        <a class="wlink" href="https://resto-miniapp.vercel.app" target="_blank" rel="noopener" aria-label="Открыть живое демо «Апорт»"></a>
        <div class="pv">
          <img src="/img/works/aport.jpg" alt="Апорт — интерфейс приложения: шапка, категории и карточки блюд с ценами" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/05</span><h3>Апорт — Telegram Mini App для ресторанов</h3></div>
          <span class="tag"><span class="dot b"></span>Сайты · Next.js 16 · Stripe · 143 теста · 2026</span>
        </div>
      </article>

      
      <article class="work rv" data-cat="design">
        <a class="wlink" href="https://www.behance.net/gallery/172883541/POLOGO-Streaming-Service-Website" target="_blank" rel="noopener" aria-label="Открыть проект POLOGO на Behance"></a>
        <div class="pv">
          <img src="/img/works/pologo.jpg" alt="POLOGO — дизайн сайта стримингового сервиса, обложка проекта на Behance" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/06</span><h3>POLOGO — сайт стримингового сервиса</h3></div>
          <span class="tag"><span class="dot f"></span>Дизайн · Figma · Photoshop · Behance · 2023</span>
        </div>
      </article>

      
      <article class="work rv" data-cat="games">
        <a class="wlink" href="https://github.com/Alexanderadon/Alexanderadon.github.io" target="_blank" rel="noopener" aria-label="Открыть репозиторий мини-игр на Canvas на GitHub"></a>
        <div class="pv">
          <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="640" height="400" fill="#15171B"/>
            <g stroke="#1E2126" stroke-width="1"><path d="M80 0v400M160 0v400M240 0v400M320 0v400M400 0v400M480 0v400M560 0v400M0 80h640M0 160h640M0 240h640M0 320h640"/></g>
            <g class="pl1">
              <rect x="122" y="122" width="36" height="36" rx="8" fill="#FF5A2C"/>
              <rect x="162" y="122" width="36" height="36" rx="8" fill="#FF5A2C" opacity=".85"/>
              <rect x="202" y="122" width="36" height="36" rx="8" fill="#FF5A2C" opacity=".7"/>
              <rect x="202" y="162" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".6"/>
              <rect x="202" y="202" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".45"/>
              <rect x="242" y="202" width="36" height="36" rx="8" fill="#FF8A5C" opacity=".3"/>
              <circle cx="140" cy="134" r="4" fill="#15171B"/><circle cx="152" cy="134" r="4" fill="#15171B"/>
              <circle cx="102" cy="140" r="13" fill="#3D6FE0"/>
              <path d="M102 122q4-8 10-8" stroke="#3A7D44" stroke-width="4" fill="none" stroke-linecap="round"/>
            </g>
            <g class="pl2">
              <circle cx="472" cy="150" r="58" fill="none" stroke="#3D6FE0" stroke-width="3" opacity=".7"/>
              <circle cx="472" cy="150" r="34" fill="none" stroke="#3D6FE0" stroke-width="3" opacity=".85"/>
              <circle cx="472" cy="150" r="10" fill="#FF5A2C"/>
              <path d="M472 78v28m0 88v28m-72-72h28m88 0h28" stroke="#EFEDE8" stroke-width="3" stroke-linecap="round"/>
              <circle cx="404" cy="256" r="7" fill="#FF8A5C"/><circle cx="540" cy="236" r="5" fill="#FF8A5C" opacity=".7"/>
            </g>
            <g class="pl3">
              <text x="122" y="316" font-family="ui-monospace,Consolas,monospace" font-size="20" fill="#EFEDE8" letter-spacing="3">SCORE 042</text>
              <text x="400" y="336" font-family="ui-monospace,Consolas,monospace" font-size="16" fill="#6C6E75" letter-spacing="2">&lt;canvas&gt;</text>
              <path d="M560 60h14m-7-7v14" stroke="#FF5A2C" stroke-width="4" stroke-linecap="round"/>
              <path d="M66 350h14m-7-7v14" stroke="#3D6FE0" stroke-width="4" stroke-linecap="round"/>
            </g>
          </svg>
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/07</span><h3>Мини-игры на Canvas — Snake, RedKiller, aim</h3></div>
          <span class="tag"><span class="dot f"></span>Игры · JavaScript · Canvas · 2021–2023</span>
        </div>
      </article>

      
      <article class="work rv" data-cat="sites">
        <a class="wlink" href="https://github.com/Alexanderadon/react-shop" target="_blank" rel="noopener" aria-label="Открыть репозиторий Sneakers на GitHub"></a>
        <div class="pv">
          <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="640" height="400" fill="#F5F4F0"/>
            <g class="pl1">
              <rect x="48" y="36" width="544" height="40" rx="12" fill="#1C1B19"/>
              <circle cx="76" cy="56" r="9" fill="#FF5A2C"/>
              <rect x="96" y="51" width="60" height="10" rx="5" fill="#EFEDE8"/>
              <rect x="420" y="51" width="40" height="10" rx="5" fill="#6C6E75"/><rect x="470" y="51" width="40" height="10" rx="5" fill="#6C6E75"/>
              <rect x="522" y="46" width="56" height="20" rx="10" fill="#FF5A2C"/>
            </g>
            <g class="pl2">
              <rect x="48" y="106" width="300" height="34" rx="8" fill="#1C1B19"/>
              <rect x="48" y="150" width="224" height="34" rx="17" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <circle cx="72" cy="167" r="8" fill="none" stroke="#8A867C" stroke-width="3"/>
              <path d="M78 173l6 6" stroke="#8A867C" stroke-width="3" stroke-linecap="round"/>
              <rect x="92" y="162" width="120" height="10" rx="5" fill="#B9B4A8"/>
              <rect x="380" y="96" width="212" height="144" rx="14" fill="#1C1B19"/>
              <path d="M408 196q0-22 22-26l30-6q10-2 18-10l8-8q6-6 14-4l52 12q18 4 18 22v10a10 10 0 0 1-10 10H418a10 10 0 0 1-10-10Z" fill="#FF5A2C"/>
              <rect x="408" y="200" width="162" height="10" rx="5" fill="#EFEDE8"/>
              <circle cx="424" cy="124" r="10" fill="#3D6FE0"/>
            </g>
            <g class="pl3">
              <rect x="48" y="278" width="168" height="86" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <path d="M64 322q0-12 12-14l16-3q6-1 10-6 4-4 10-3l28 7q10 2 10 12v3a6 6 0 0 1-6 6H70a6 6 0 0 1-6-6Z" fill="#FF8A5C"/>
              <rect x="64" y="338" width="70" height="8" rx="4" fill="#B9B4A8"/><rect x="150" y="338" width="46" height="8" rx="4" fill="#1C1B19"/>
              <rect x="236" y="278" width="168" height="86" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <path d="M252 322q0-12 12-14l16-3q6-1 10-6 4-4 10-3l28 7q10 2 10 12v3a6 6 0 0 1-6 6H258a6 6 0 0 1-6-6Z" fill="#3D6FE0"/>
              <rect x="252" y="338" width="70" height="8" rx="4" fill="#B9B4A8"/><rect x="338" y="338" width="46" height="8" rx="4" fill="#1C1B19"/>
              <rect x="424" y="278" width="168" height="86" rx="14" fill="#FFFFFF" stroke="#DDD8CC" stroke-width="2"/>
              <path d="M440 322q0-12 12-14l16-3q6-1 10-6 4-4 10-3l28 7q10 2 10 12v3a6 6 0 0 1-6 6H446a6 6 0 0 1-6-6Z" fill="#1C1B19"/>
              <rect x="440" y="338" width="70" height="8" rx="4" fill="#B9B4A8"/><rect x="526" y="338" width="46" height="8" rx="4" fill="#FF5A2C"/>
            </g>
          </svg>
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/08</span><h3>Sneakers — SPA-магазин на React</h3></div>
          <span class="tag"><span class="dot b"></span>Сайты · React 18 · Router 6 · MockAPI · 2024</span>
        </div>
      </article>

      
      <article class="work rv" data-cat="games" tabindex="0">
        <div class="pv">
          <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="640" height="400" fill="#15171B"/>
            <g stroke="#1E2126" stroke-width="1"><path d="M80 0v400M160 0v400M240 0v400M320 0v400M400 0v400M480 0v400M560 0v400M0 80h640M0 160h640M0 240h640M0 320h640"/></g>
            <g class="pl1">
              <rect x="90" y="52" width="70" height="26" rx="8" fill="#26282E"/>
              <path d="M104 60l6 10 6-10m8 0v10m8-10 6 10 6-10" stroke="#FF5A2C" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M478 74a18 15 0 0 1 36 0 15 13 0 0 1 24 8 12 12 0 0 1-8 22h-64a14 14 0 0 1-6-27 18 15 0 0 1 18-3Z" fill="#22252B"/>
              <path d="M120 130a15 12 0 0 1 30 0 12 11 0 0 1 20 6 10 10 0 0 1-7 18h-52a12 12 0 0 1-5-22 15 12 0 0 1 14-2Z" fill="#22252B"/>
            </g>
            <g class="pl2">
              <rect x="60" y="300" width="190" height="26" rx="8" fill="#3D6FE0"/>
              <rect x="290" y="240" width="130" height="26" rx="8" fill="#3D6FE0"/>
              <rect x="460" y="180" width="130" height="26" rx="8" fill="#3D6FE0"/>
              <rect x="60" y="326" width="190" height="46" fill="#2A3B66"/>
              <rect x="290" y="266" width="130" height="20" fill="#2A3B66"/>
              <rect x="460" y="206" width="130" height="18" fill="#2A3B66"/>
              <path d="M430 300l10-20 10 20Zm26 0 10-20 10 20Z" fill="#FF5A2C"/>
              <circle cx="332" cy="216" r="9" fill="#FF8A5C"/><circle cx="360" cy="216" r="9" fill="#FF8A5C"/><circle cx="388" cy="216" r="9" fill="#FF8A5C"/>
              <rect x="548" y="122" width="5" height="58" fill="#EFEDE8"/>
              <path d="M553 122l30 10-30 10Z" fill="#FF5A2C"/>
            </g>
            <g class="pl3">
              <rect x="120" y="252" width="44" height="44" rx="9" fill="#F5F4F0"/>
              <circle cx="134" cy="268" r="4.5" fill="#1C1B19"/><circle cx="152" cy="268" r="4.5" fill="#1C1B19"/>
              <path d="M136 284q8 6 14 0" stroke="#1C1B19" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <path d="M116 296q-14-8-10-24" stroke="#FF5A2C" stroke-width="4" fill="none" stroke-linecap="round"/>
              <path d="M60 60h14m-7-7v14" stroke="#FF5A2C" stroke-width="4" stroke-linecap="round"/>
              <path d="M596 336h14m-7-7v14" stroke="#3D6FE0" stroke-width="4" stroke-linecap="round"/>
            </g>
          </svg>
          <span class="arr" aria-hidden="true">&#8599;</span>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/09</span><h3>Muckliker — прототип игры на Godot</h3></div>
          <span class="tag"><span class="dot f"></span>Игры · Godot · GDScript · в разработке · 2026</span>
        </div>
      </article>

      
      <article class="work vid rv" data-cat="video" tabindex="0">
        <div class="pv">
          <video src="/video/qazsoft.mp4" poster="/img/works/qazsoft-poster.jpg" muted loop playsinline preload="none" aria-label="Промо-ролик «Кто такие QazSoft?»" style="width:100%;height:100%;object-fit:cover;display:block"></video>
          <span class="tc mono">reel</span>
          <span class="snd mono" aria-hidden="true">&#9654; смотреть</span>
          <a class="arr" href="https://www.instagram.com/reel/C9J0kqQOM6I/" target="_blank" rel="noopener" aria-label="Открыть reel «Кто такие QazSoft?» в Instagram">&#8599;</a>
        </div>
        <div class="wm">
          <div class="row"><span class="wi">/10</span><h3>«Кто такие QazSoft?» — промо-ролик</h3></div>
          <span class="tag"><span class="dot f"></span>Видео · моушн · Instagram · 2024</span>
        </div>
      </article>
    </div>
    </div>

    
    <div class="wview index" id="worksList" hidden>
      <article class="irow" data-cat="sites" data-i="0" tabindex="0">
        <span class="ridx">/01</span>
        <h3 class="rttl">KIDO<small>SaaS-каталог детских курсов · React Router 7 · Supabase · Stripe</small></h3>
        <span class="rcat">сайты</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="video" data-i="1" tabindex="0">
        <span class="ridx">/02</span>
        <h3 class="rttl">Нейрошлем из будущего<small>концепт-видео · «Креативный взгляд» · Instagram · 2024</small></h3>
        <span class="rcat">видео</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="design" data-i="2" tabindex="0">
        <span class="ridx">/03</span>
        <h3 class="rttl">Trendova<small>магазин одежды · UI/UX · e-commerce · 2024</small></h3>
        <span class="rcat">дизайн</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="logo" data-i="3" tabindex="0">
        <span class="ridx">/04</span>
        <h3 class="rttl">Логотипы и фирстили<small>фриланс 2019–2021 · подборка скоро</small></h3>
        <span class="rcat">лого</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="sites" data-i="4" tabindex="0">
        <span class="ridx">/05</span>
        <h3 class="rttl">Апорт<small>Telegram Mini App для ресторанов · Next.js 16 · Stripe · 2026</small></h3>
        <span class="rcat">сайты</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="design" data-i="5" tabindex="0">
        <span class="ridx">/06</span>
        <h3 class="rttl">POLOGO<small>сайт стримингового сервиса · Figma · Behance · 2023</small></h3>
        <span class="rcat">дизайн</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="games" data-i="6" tabindex="0">
        <span class="ridx">/07</span>
        <h3 class="rttl">Мини-игры на Canvas<small>Snake · RedKiller · aim-тренажёр · JavaScript</small></h3>
        <span class="rcat">игры</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="sites" data-i="7" tabindex="0">
        <span class="ridx">/08</span>
        <h3 class="rttl">Sneakers<small>SPA-магазин · React 18 · Router 6 · MockAPI · 2024</small></h3>
        <span class="rcat">сайты</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="games" data-i="8" tabindex="0">
        <span class="ridx">/09</span>
        <h3 class="rttl">Muckliker<small>прототип игры · Godot · GDScript · 2026</small></h3>
        <span class="rcat">игры</span>
        <div class="row-pre"></div>
      </article>
      <article class="irow" data-cat="video" data-i="9" tabindex="0">
        <span class="ridx">/10</span>
        <h3 class="rttl">Кто такие QazSoft?<small>промо-ролик · моушн · Instagram · 2024</small></h3>
        <span class="rcat">видео</span>
        <div class="row-pre"></div>
      </article>
    </div>
  </section>

  
  <section id="about" aria-label="Обо мне">
    <div class="shead">
      <div class="h2wrap">
        <span class="lab"><b>/02</b>&ensp;коротко</span>
        <h2>Обо мне</h2>
      </div>
    </div>
    <div class="about" data-st>
      <div class="a-col">
        <figure class="tile td a-photo rv">
          <img src="/photo/avatar.jpg" alt="Александр Курчаков" width="320" height="320">
          <figcaption>Александр Курчаков · 22 года · Алматы</figcaption>
        </figure>
      </div>

      <div class="tile td a-txt rv">
        <span class="lab"><b>/</b>&ensp;о работе</span>
        <p>В разработке с 2019: начинал на фрилансе с сайтов, лого и фирстилей, делал сайты федерации QAZAQSTAN RUGBY, вырос до middle React-разработчика в QazSoft — SPA на React/Next, микросервисы, 3D на Three.js. Сейчас делаю коммерческие продукты: iiko-интеграции для HoReCa, платежи Stripe, Web3 — TON Connect и WalletConnect. Дизайн-бэкграунд никуда не делся — <em>Figma и код в одних руках.</em></p>
        <div class="a-links">
          <a download="Alexander-Kurchakov-CV.pdf" href="/resume.pdf">резюме (PDF)</a>
          <a href="mailto:alexanderkurachakov@gmail.com">написать мне</a>
        </div>
        <span class="lab">Алматы · UTC+5</span>
      </div>

      <div class="tile td a-exp rv">
        <span class="lab">/ опыт</span>
        <ol class="xp">
          <li>
            <span class="xy">2024 — н.в.</span>
            <div><div class="xr">Frontend Developer</div>
            <p class="xd">iiko API для HoReCa, Stripe-платежи, Web3 — TON Connect и WalletConnect, n8n-автоматизации</p></div>
          </li>
          <li>
            <span class="xy">2022 — 2024</span>
            <div><div class="xr">Middle React Developer · QazSoft</div>
            <p class="xd">SPA на React/Next/TS (FSD), Node.js-микросервисы, Three.js/WebGL, AI-интеграции (−40% времени на рутину), менторство джунов</p></div>
          </li>
          <li>
            <span class="xy">2021 — 2022</span>
            <div><div class="xr">Web Developer · QAZAQSTAN RUGBY</div>
            <p class="xd">сайты федерации, ~10 000 пользователей, Figma → WordPress, SEO</p></div>
          </li>
          <li>
            <span class="xy">2019 — 2021</span>
            <div><div class="xr">Фриланс — дизайн и разработка</div>
            <p class="xd">10+ проектов: сайты, лендинги, лого, фирстили</p></div>
          </li>
        </ol>
        <span class="lab">Образование: IT-колледж + университет (КЗ) · Языки: RU родной · EN B1</span>
      </div>

      <div class="a-f" data-st>
        <div class="af rv"><span class="lab">опыт</span><div><div class="num">6+</div><p class="cap">лет в разработке и дизайне — с 2019</p></div></div>
        <div class="af rv"><span class="lab">сделано</span><div><div class="num b">30+</div><p class="cap">проектов — от лендингов до Web3</p></div></div>
        <div class="af rv"><span class="lab">языки</span><div><div class="num" style="font-size:clamp(20px,2.2vw,34px)">RU/KZ/EN</div><p class="cap">рабочие языки</p></div></div>
      </div>

      <div class="tile tl a-stack rv">
        <span class="lab">/ инструменты</span>
        <div class="sg sg-key"><span class="sg-t">ключевой стек</span>
          <ul><li>React</li><li>Next.js</li><li>TypeScript</li><li>Node.js</li><li>Feature-Sliced Design</li></ul></div>
        <div class="stack">
          <div class="sg"><span class="sg-t">frontend</span>
            <ul><li>React</li><li>Next.js</li><li>Vue.js</li><li>Nuxt</li><li>TypeScript</li><li>JavaScript (ES6+)</li><li>Redux Toolkit</li><li>Zustand</li><li>TanStack Query</li><li>Zod</li><li>React Native</li><li>Expo</li><li>Three.js</li><li>Canvas</li><li>Tailwind CSS</li><li>Material UI</li><li>Framer Motion</li><li>i18next</li><li>Feature-Sliced Design</li><li>Responsive Design</li><li>TON Connect SDK</li><li>WalletConnect</li><li>web3.js</li><li>jQuery</li></ul></div>
          <div class="sg"><span class="sg-t">тестирование</span>
            <ul><li>Jest</li><li>Vitest</li><li>React Testing Library</li></ul></div>
          <div class="sg"><span class="sg-t">вёрстка и стили</span>
            <ul><li>HTML5</li><li>CSS3</li><li>SCSS</li><li>Sass</li><li>Less</li><li>BEM</li><li>Bootstrap</li></ul></div>
          <div class="sg"><span class="sg-t">backend &amp; api</span>
            <ul><li>Node.js</li><li>Express.js</li><li>REST API</li><li>WebSocket</li><li>Microservices</li><li>Prisma</li><li>Telegram Bot API</li><li>iiko API</li><li>PHP</li><li>C#</li></ul></div>
          <div class="sg"><span class="sg-t">платёжные системы</span>
            <ul><li>Stripe</li></ul></div>
          <div class="sg"><span class="sg-t">базы данных и BaaS</span>
            <ul><li>Supabase</li><li>PostgreSQL</li><li>MongoDB</li><li>Redis</li><li>MySQL / MariaDB</li><li>GraphQL</li></ul></div>
          <div class="sg"><span class="sg-t">сборка и пакеты</span>
            <ul><li>Vite</li><li>Webpack</li><li>Gulp</li><li>Turborepo</li><li>pnpm</li><li>NPM</li><li>Yarn</li></ul></div>
          <div class="sg"><span class="sg-t">инструменты</span>
            <ul><li>Docker</li><li>GitHub Actions</li><li>GitLab CI</li><li>Vercel</li><li>n8n</li><li>Git</li><li>GitHub</li><li>GitLab</li><li>ESLint</li><li>Prettier</li><li>Postman</li><li>Ngrok</li><li>Obsidian</li></ul></div>
          <div class="sg"><span class="sg-t">AI-инструменты</span>
            <ul><li>Claude (Sonnet/Opus)</li><li>ChatGPT</li><li>GitHub Copilot</li><li>Cursor</li><li>Codex</li><li>Gemini</li><li>GLM</li><li>Higgsfield</li></ul></div>
          <div class="sg"><span class="sg-t">CMS</span>
            <ul><li>WordPress</li><li>Carbon Fields</li><li>OctoberCMS</li></ul></div>
          <div class="sg"><span class="sg-t">дизайн</span>
            <ul><li>Figma</li><li>FigJam</li><li>Photoshop</li><li>UI/UX</li><li>UML</li></ul></div>
          <div class="sg"><span class="sg-t">процессы</span>
            <ul><li>Scrumban</li><li>Jira</li><li>Notion</li><li>Bitrix24</li></ul></div>
        </div>
        <span class="lab">один стек — от идеи до релиза</span>
      </div>
    </div>
  </section>
</main>

<footer id="contact">
  <div class="fwrap">
    <div class="links">
      <a href="mailto:alexanderkurachakov@gmail.com">email</a><a href="https://github.com/Alexanderadon">github</a><a href="https://www.behance.net/alexanderkurchakov">behance</a><a href="https://www.instagram.com/alexanderkurchakov">instagram</a><a href="https://t.me/AlexanderJob">telegram</a>
    </div>
    <div class="f-orn" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="copy">
      © 2026 Александр Курчаков · Алматы
      <span class="mono">шеберлік · 匠心 · мастерство</span>
    </div>
  </div>
</footer>

<div class="mascot" id="mascot" aria-hidden="true">
  <div class="m-bubble" id="mBubble"></div>
  <button class="m-stage" id="mStage" tabindex="-1" aria-hidden="true">
    <div class="m-fig" data-m="fire">
<svg width="507" height="543" viewBox="0 0 507 543" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_184_2293)">
<path d="M446.735 538H78.5104L85.9282 526.293C94.4083 512.909 93.5461 495.637 83.7754 483.164C80.3098 478.741 75.893 475.154 70.8522 472.669L39.3621 457.151C32.3366 453.688 25.9367 449.08 20.4249 443.516L15.6598 438.705C5.62785 428.576 0 414.897 0 400.641C0 391.918 2.10998 383.324 6.14996 375.592L17.4761 353.916C18.1338 352.658 19.9978 352.876 20.3471 354.252L24.4282 370.332C27.1814 381.18 34.3756 390.367 44.2471 395.64L46.7416 396.973C56.6059 402.242 68.4182 402.379 78.4019 397.339C86.6074 393.197 92.8101 385.939 95.6225 377.188L96.5762 374.22C98.8654 367.097 99.2008 359.491 97.5472 352.194L94.0682 336.842C92.1822 328.52 89.2044 320.483 85.2121 312.942C80.7684 304.548 75.1139 296.853 68.4301 290.105L64.0513 285.684C54.6864 276.229 47.9537 264.492 44.5197 251.635C40.0384 234.856 41.4074 217.052 48.401 201.155L55.0296 186.088L55.0297 186.088C56.432 182.901 57.1332 181.307 57.8854 179.746C61.1961 172.877 65.2816 166.409 70.0623 160.469C71.1485 159.119 72.2864 157.801 74.5621 155.166L74.5624 155.165L80.2997 148.521L80.3001 148.52C83.706 144.576 85.409 142.604 87.1871 140.747C96.1434 131.393 106.831 123.868 118.657 118.589C121.005 117.541 123.436 116.603 128.298 114.726L128.298 114.726L128.298 114.726C129.557 114.24 130.186 113.997 130.467 113.972C132.013 113.835 133.119 115.436 132.445 116.834C132.322 117.088 131.872 117.591 130.973 118.596L130.973 118.596L115.847 135.509C105.522 147.054 98.4978 161.168 95.5127 176.366L92.6831 190.773C91.7279 195.637 92.0223 200.664 93.5389 205.382L94.068 207.029C97.6464 218.163 108.004 225.714 119.699 225.714C123.169 225.714 126.606 225.043 129.822 223.738L132.158 222.79C147.188 216.691 157.021 202.09 157.021 185.87V169.162C157.021 158.673 159.802 148.372 165.082 139.309L165.861 137.971C170.6 129.835 177.049 122.825 184.763 117.426L203.91 104.023C210.862 99.1565 216.415 92.5497 220.013 84.8637C225.356 73.4509 226.044 60.4061 221.931 48.4946L219.074 40.2181C216.068 31.5123 211.376 23.4844 205.265 16.5935L195.785 5.90294C194.524 4.48052 193.893 3.76931 193.782 3.25675C193.573 2.28632 194.107 1.30908 195.037 0.961353C195.528 0.777695 196.467 0.924433 198.345 1.21791L230.972 6.3156C242.338 8.0914 253.146 12.446 262.569 19.0456C282.701 33.1471 294.69 56.182 294.69 80.7619V96.595V121.664C294.69 132.91 301.273 143.114 311.518 147.751C319.09 151.178 327.777 151.146 335.323 147.664L338.341 146.271C346.865 142.338 353.509 135.223 356.851 126.45L357.05 125.928C360.657 116.459 360.254 105.929 355.934 96.7634L347.376 78.6082C346.664 77.0975 348.342 75.58 349.774 76.4401L387.181 98.9135C400.276 106.78 410.105 119.092 414.876 133.604C419.054 146.309 419.124 160.008 415.077 172.755L409.125 191.503C408.035 194.938 407.48 198.521 407.48 202.126V207.493C407.48 218.512 414.147 228.435 424.349 232.6L425.574 233.1C431.998 235.722 439.238 235.459 445.455 232.377C453.689 228.296 458.899 219.899 458.899 210.709V193.487C458.899 192.43 460.295 192.049 460.832 192.96L494.336 249.779C502.627 263.84 507 279.864 507 296.187C507 314.508 501.492 332.405 491.192 347.556L487.469 353.032C486.67 354.207 486.271 354.795 485.864 355.375C482.196 360.609 478.035 365.479 473.437 369.919C472.928 370.411 472.41 370.898 471.374 371.87L442.507 398.967C437.994 403.203 434.323 408.254 431.687 413.853L425.838 426.274C422.98 432.342 423.126 439.398 426.231 445.343L426.663 446.171C431.713 455.84 443.457 459.851 453.366 455.29C462.088 451.276 466.848 441.738 464.812 432.354L462.633 422.314C462.498 421.692 463.229 421.254 463.714 421.666L467.368 424.773C475.863 431.997 481.763 441.8 484.169 452.688C485.734 459.769 485.774 467.102 484.287 474.2L483.527 477.824C481.507 487.466 477.426 496.557 471.563 504.474L446.735 538Z" fill="url(#paint0_linear_184_2293)"/>
</g>
<g filter="url(#filter1_i_184_2293)">
<path d="M405 28.5C405 34.8513 399.851 40 393.5 40C387.149 40 382 34.8513 382 28.5C382 22.1487 387.149 17 393.5 17C399.851 17 405 22.1487 405 28.5Z" fill="#D9D9D9"/>
<path d="M405 28.5C405 34.8513 399.851 40 393.5 40C387.149 40 382 34.8513 382 28.5C382 22.1487 387.149 17 393.5 17C399.851 17 405 22.1487 405 28.5Z" fill="url(#paint1_linear_184_2293)"/>
</g>
<g filter="url(#filter2_i_184_2293)">
<circle cx="459" cy="159" r="7" fill="#D9D9D9"/>
<circle cx="459" cy="159" r="7" fill="url(#paint2_linear_184_2293)"/>
</g>
<g filter="url(#filter3_i_184_2293)">
<circle cx="161" cy="58" r="8" fill="#D9D9D9"/>
<circle cx="161" cy="58" r="8" fill="url(#paint3_linear_184_2293)"/>
</g>
<g filter="url(#filter4_i_184_2293)">
<circle cx="21.5" cy="270.5" r="11.5" fill="#D9D9D9"/>
<circle cx="21.5" cy="270.5" r="11.5" fill="url(#paint4_linear_184_2293)"/>
</g>
<path d="M276.658 454.262C276.658 459.864 270.989 464.405 265.387 464.405C259.785 464.405 254.117 459.864 254.117 454.262C254.117 448.66 259.785 444.119 265.387 444.119C270.989 444.119 276.658 448.66 276.658 454.262Z" fill="#3291C5"/>
<path d="M276.658 490.327C276.658 495.929 270.989 500.47 265.387 500.47C259.785 500.47 254.117 495.929 254.117 490.327C254.117 484.725 259.785 480.184 265.387 480.184C270.989 480.184 276.658 484.725 276.658 490.327Z" fill="#3291C5"/>
<g filter="url(#filter5_i_184_2293)">
<path d="M349.741 537.662H181.056C179.79 537.662 178.843 536.501 179.096 535.261L267.64 102.07L351.704 535.281C351.943 536.515 350.998 537.662 349.741 537.662Z" fill="#F9B280"/>
</g>
<path d="M349.741 537.662H181.056C179.79 537.662 178.843 536.501 179.096 535.261L267.64 102.07L351.704 535.281C351.943 536.515 350.998 537.662 349.741 537.662Z" stroke="url(#paint5_linear_184_2293)" stroke-width="10"/>
<g filter="url(#filter6_i_184_2293)">
<path d="M319 367L352 537.5H181.404C180.154 537.5 179.21 536.365 179.437 535.136L207.5 383.5L267 448.5L319 367Z" fill="url(#paint6_linear_184_2293)"/>
</g>
<path d="M267 448.5L352 537.5H181.404C180.154 537.5 179.21 536.365 179.437 535.136L207.5 383.5L267 448.5L319 367L352 537.5" stroke="url(#paint7_linear_184_2293)" stroke-width="10"/>
<g filter="url(#filter7_i_184_2293)">
<ellipse cx="409.082" cy="302.117" rx="56.9143" ry="52.9698" fill="#F3AA77"/>
</g>
<path d="M409.082 254.147C438.098 254.147 460.997 275.956 460.997 302.117C460.997 328.278 438.098 350.086 409.082 350.086C380.066 350.086 357.168 328.277 357.168 302.117C357.168 275.956 380.066 254.147 409.082 254.147Z" stroke="url(#paint8_linear_184_2293)" stroke-width="10"/>
<g filter="url(#filter8_i_184_2293)">
<ellipse cx="105.914" cy="302.117" rx="56.9143" ry="52.9698" fill="#F3AA77"/>
</g>
<path d="M105.914 254.147C134.93 254.147 157.829 275.956 157.829 302.117C157.829 328.278 134.93 350.086 105.914 350.086C76.8984 350.086 54 328.277 54 302.117C54 275.956 76.8984 254.147 105.914 254.147Z" stroke="url(#paint9_linear_184_2293)" stroke-width="10"/>
<mask id="path-15-inside-1_184_2293" fill="white">
<path d="M433.312 260.417C433.312 350.67 355.102 423.835 258.625 423.835C162.148 423.835 83.9375 350.67 83.9375 260.417C83.9375 170.164 162.148 97 258.625 97C355.102 97 433.312 170.164 433.312 260.417Z"/>
</mask>
<g filter="url(#filter9_i_184_2293)">
<path d="M433.312 260.417C433.312 350.67 355.102 423.835 258.625 423.835C162.148 423.835 83.9375 350.67 83.9375 260.417C83.9375 170.164 162.148 97 258.625 97C355.102 97 433.312 170.164 433.312 260.417Z" fill="url(#paint10_radial_184_2293)"/>
</g>
<g clip-path="url(#paint11_angular_184_2293_clip_path)" data-figma-skip-parse="true" mask="url(#path-15-inside-1_184_2293)"><g transform="matrix(-0.00100001 0.071 -0.0758966 -0.00106897 266.5 347)"><foreignObject x="-3696.31" y="-3696.31" width="7392.63" height="7392.63"><div xmlns="http://www.w3.org/1999/xhtml" style="background:conic-gradient(from 90deg,rgba(25, 25, 25, 1) 0deg,rgba(25, 25, 25, 1) 39.3995deg,rgba(121, 20, 13, 1) 59.4795deg,rgba(25, 25, 25, 1) 125.108deg,rgba(121, 20, 13, 1) 140.598deg,rgba(25, 25, 25, 1) 181.773deg,rgba(121, 20, 13, 1) 215.045deg,rgba(25, 25, 25, 1) 237.615deg,rgba(121, 20, 13, 1) 292.539deg,rgba(25, 25, 25, 1) 337.542deg,rgba(25, 25, 25, 1) 354.418deg,rgba(25, 25, 25, 1) 360deg);height:100%;width:100%;opacity:1"></div></foreignObject></g></g><path d="M433.312 260.417H423.312C423.312 344.53 350.218 413.835 258.625 413.835V423.835V433.835C359.986 433.835 443.312 356.811 443.312 260.417H433.312ZM258.625 423.835V413.835C167.032 413.835 93.9375 344.53 93.9375 260.417H83.9375H73.9375C73.9375 356.811 157.264 433.835 258.625 433.835V423.835ZM83.9375 260.417H93.9375C93.9375 176.305 167.032 107 258.625 107V97V87C157.264 87 73.9375 164.024 73.9375 260.417H83.9375ZM258.625 97V107C350.218 107 423.312 176.305 423.312 260.417H433.312H443.312C443.312 164.024 359.986 87 258.625 87V97Z" data-figma-gradient-fill="{&#34;type&#34;:&#34;GRADIENT_ANGULAR&#34;,&#34;stops&#34;:[{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.0},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.10944300889968872},{&#34;color&#34;:{&#34;r&#34;:0.47588947415351868,&#34;g&#34;:0.079302757978439331,&#34;b&#34;:0.052108258008956909,&#34;a&#34;:1.0},&#34;position&#34;:0.16522093117237091},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.34752315282821655},{&#34;color&#34;:{&#34;r&#34;:0.47450980544090271,&#34;g&#34;:0.078431375324726105,&#34;b&#34;:0.050980392843484879,&#34;a&#34;:1.0},&#34;position&#34;:0.39055016636848450},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.50492596626281738},{&#34;color&#34;:{&#34;r&#34;:0.47450980544090271,&#34;g&#34;:0.078431375324726105,&#34;b&#34;:0.050980392843484879,&#34;a&#34;:1.0},&#34;position&#34;:0.59734767675399780},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.66004127264022827},{&#34;color&#34;:{&#34;r&#34;:0.47450980544090271,&#34;g&#34;:0.078431375324726105,&#34;b&#34;:0.050980392843484879,&#34;a&#34;:1.0},&#34;position&#34;:0.81260877847671509},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.93761599063873291},{&#34;color&#34;:{&#34;r&#34;:0.10088717192411423,&#34;g&#34;:0.10088717192411423,&#34;b&#34;:0.10088717192411423,&#34;a&#34;:1.0},&#34;position&#34;:0.98449373245239258}],&#34;stopsVar&#34;:[],&#34;transform&#34;:{&#34;m00&#34;:-2.0000214576721191,&#34;m01&#34;:-151.79313659667969,&#34;m02&#34;:343.39657592773438,&#34;m10&#34;:142.0,&#34;m11&#34;:-2.1379492282867432,&#34;m12&#34;:277.06893920898438},&#34;opacity&#34;:1.0,&#34;blendMode&#34;:&#34;NORMAL&#34;,&#34;visible&#34;:true}" mask="url(#path-15-inside-1_184_2293)"/>
<path d="M404.562 259.18L289.294 298.909C289.176 298.949 289.157 299.108 289.262 299.176L299.406 305.679C307.065 310.588 315.508 314.148 324.369 316.205L330.09 317.533C338.276 319.434 346.791 319.417 354.969 317.483C366.985 314.643 377.682 307.81 385.31 298.101L387.016 295.931C390.406 291.615 393.213 286.872 395.364 281.823L404.868 259.509C404.951 259.313 404.763 259.111 404.562 259.18Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M111.523 259.18L226.792 298.909C226.91 298.949 226.929 299.108 226.824 299.176L216.678 305.679C209.02 310.588 200.578 314.148 191.717 316.205L185.996 317.533C177.809 319.434 169.295 319.417 161.116 317.483C149.1 314.643 138.403 307.81 130.775 298.101L129.069 295.931C125.679 291.615 122.872 286.872 120.721 281.823L111.217 259.509C111.134 259.313 111.322 259.111 111.523 259.18Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M271.515 390.504L221.499 382.501L237.661 376.055C249.445 371.355 262.017 368.941 274.704 368.941L344 368.939C324.365 386.76 297.698 394.694 271.515 390.504Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<defs>
<filter id="filter0_i_184_2293" x="0" y="0.880371" width="507" height="539.12" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter1_i_184_2293" x="382" y="17" width="23" height="25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter2_i_184_2293" x="452" y="152" width="14" height="16" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter3_i_184_2293" x="153" y="50" width="16" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter4_i_184_2293" x="10" y="259" width="23" height="25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter5_i_184_2293" x="174.053" y="101.068" width="182.689" height="443.593" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter6_i_184_2293" x="174.402" y="353.743" width="183.658" height="190.756" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter7_i_184_2293" x="352.168" y="249.147" width="113.828" height="107.939" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter8_i_184_2293" x="49" y="249.147" width="113.828" height="107.939" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<filter id="filter9_i_184_2293" x="83.9375" y="97" width="349.375" height="328.834" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2293"/>
</filter>
<clipPath id="paint11_angular_184_2293_clip_path"><path d="M433.312 260.417H423.312C423.312 344.53 350.218 413.835 258.625 413.835V423.835V433.835C359.986 433.835 443.312 356.811 443.312 260.417H433.312ZM258.625 423.835V413.835C167.032 413.835 93.9375 344.53 93.9375 260.417H83.9375H73.9375C73.9375 356.811 157.264 433.835 258.625 433.835V423.835ZM83.9375 260.417H93.9375C93.9375 176.305 167.032 107 258.625 107V97V87C157.264 87 73.9375 164.024 73.9375 260.417H83.9375ZM258.625 97V107C350.218 107 423.312 176.305 423.312 260.417H433.312H443.312C443.312 164.024 359.986 87 258.625 87V97Z"/></clipPath><linearGradient id="paint0_linear_184_2293" x1="253.5" y1="-7" x2="253.5" y2="538" gradientUnits="userSpaceOnUse">
<stop stop-color="#D81919"/>
<stop offset="1" stop-color="#ED7B41"/>
</linearGradient>
<linearGradient id="paint1_linear_184_2293" x1="376.5" y1="16.7007" x2="376.5" y2="40" gradientUnits="userSpaceOnUse">
<stop stop-color="#D81919"/>
<stop offset="1" stop-color="#ED7B41"/>
</linearGradient>
<linearGradient id="paint2_linear_184_2293" x1="459" y1="151.818" x2="459" y2="166" gradientUnits="userSpaceOnUse">
<stop stop-color="#D81919"/>
<stop offset="1" stop-color="#ED7B41"/>
</linearGradient>
<linearGradient id="paint3_linear_184_2293" x1="161" y1="49.7918" x2="161" y2="66" gradientUnits="userSpaceOnUse">
<stop stop-color="#D81919"/>
<stop offset="1" stop-color="#ED7B41"/>
</linearGradient>
<linearGradient id="paint4_linear_184_2293" x1="21.5" y1="258.701" x2="21.5" y2="282" gradientUnits="userSpaceOnUse">
<stop stop-color="#D81919"/>
<stop offset="1" stop-color="#ED7B41"/>
</linearGradient>
<linearGradient id="paint5_linear_184_2293" x1="265.386" y1="102.07" x2="265.386" y2="537.662" gradientUnits="userSpaceOnUse">
<stop stop-color="#1A1A1A"/>
<stop offset="1" stop-color="#1A1A1A" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint6_linear_184_2293" x1="265.5" y1="364.781" x2="265.5" y2="537.5" gradientUnits="userSpaceOnUse">
<stop stop-color="#1F34F1"/>
<stop offset="1" stop-color="#6D8EE4"/>
</linearGradient>
<linearGradient id="paint7_linear_184_2293" x1="265.5" y1="367" x2="262.5" y2="577.5" gradientUnits="userSpaceOnUse">
<stop stop-color="#1A1A1A"/>
<stop offset="1" stop-color="#1A1A1A" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint8_linear_184_2293" x1="403" y1="301.999" x2="498" y2="301.999" gradientUnits="userSpaceOnUse">
<stop stop-color="#1A1A1A"/>
<stop offset="1" stop-color="#A31B12"/>
</linearGradient>
<linearGradient id="paint9_linear_184_2293" x1="-15" y1="301.999" x2="119" y2="301.999" gradientUnits="userSpaceOnUse">
<stop stop-color="#A31B12"/>
<stop offset="1" stop-color="#1A1A1A"/>
</linearGradient>
<radialGradient id="paint10_radial_184_2293" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(259 154.5) rotate(90.0798) scale(269.335 287.91)">
<stop stop-color="#FDC59D"/>
<stop offset="0.151112" stop-color="#FFBB8B"/>
<stop offset="0.416752" stop-color="#F3AA77"/>
<stop offset="1" stop-color="#F3AA77"/>
</radialGradient>
</defs>
</svg>
    </div>
    <div class="m-fig" data-m="dark">
<svg width="441" height="568" viewBox="0 0 441 568" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M322.901 562.975H154.216C152.95 562.975 152.003 561.814 152.256 560.574L240.8 127.383L324.864 560.594C325.104 561.828 324.158 562.975 322.901 562.975Z" fill="#4DB4ED" stroke="#1A1A1A" stroke-width="10"/>
<path d="M249.816 479.575C249.816 485.177 244.147 489.718 238.546 489.718C232.944 489.718 227.275 485.177 227.275 479.575C227.275 473.973 232.944 469.432 238.546 469.432C244.147 469.432 249.816 473.973 249.816 479.575Z" fill="#3291C5"/>
<path d="M249.816 515.64C249.816 521.242 244.147 525.783 238.546 525.783C232.944 525.783 227.275 521.242 227.275 515.64C227.275 510.038 232.944 505.497 238.546 505.497C244.147 505.497 249.816 510.038 249.816 515.64Z" fill="#3291C5"/>
<g filter="url(#filter0_i_184_2141)">
<path d="M322.901 562.975H154.216C152.95 562.975 152.003 561.814 152.256 560.574L240.8 127.383L324.864 560.594C325.104 561.828 324.158 562.975 322.901 562.975Z" fill="#28282D"/>
</g>
<path d="M322.901 562.975H154.216C152.95 562.975 152.003 561.814 152.256 560.574L240.8 127.383L324.864 560.594C325.104 561.828 324.158 562.975 322.901 562.975Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M249.816 479.575C249.816 485.177 244.147 489.718 238.546 489.718C232.944 489.718 227.275 485.177 227.275 479.575C227.275 473.973 232.944 469.432 238.546 469.432C244.147 469.432 249.816 473.973 249.816 479.575Z" fill="#3F3E43"/>
<path d="M249.816 515.64C249.816 521.242 244.147 525.783 238.546 525.783C232.944 525.783 227.275 521.242 227.275 515.64C227.275 510.038 232.944 505.497 238.546 505.497C244.147 505.497 249.816 510.038 249.816 515.64Z" fill="#3F3E43"/>
<g filter="url(#filter1_i_184_2141)">
<ellipse cx="382.242" cy="327.43" rx="56.9143" ry="52.9698" fill="#F3AA77"/>
</g>
<path d="M382.242 279.46C411.258 279.46 434.157 301.269 434.157 327.43C434.157 353.59 411.258 375.399 382.242 375.399C353.227 375.399 330.328 353.59 330.328 327.43C330.328 301.269 353.227 279.46 382.242 279.46Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter2_i_184_2141)">
<ellipse cx="79.0745" cy="327.43" rx="56.9143" ry="52.9698" fill="#F3AA77"/>
</g>
<path d="M79.0742 279.46C108.09 279.46 130.989 301.269 130.989 327.43C130.989 353.59 108.09 375.399 79.0742 375.399C50.0586 375.399 27.1602 353.59 27.1602 327.43C27.1602 301.269 50.0586 279.46 79.0742 279.46Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M39.6276 213.491L5.25498 211.347C4.25597 215.676 6.26722 220.14 10.1718 222.26L23.2872 229.38L49.2086 241.213L60.3849 244.542C108.091 258.749 156.864 269.092 206.231 275.472L217.618 276.585C249.148 279.667 280.921 279.294 312.37 275.472L336.555 269.894C358.921 264.736 379.799 254.495 397.568 239.966L403.941 234.755C409.792 229.971 414.993 224.443 419.411 218.31L427.308 207.349C432.812 199.71 435.774 190.533 435.774 181.118V178.821C435.774 173.877 434.707 168.992 432.646 164.498C430.089 158.923 426.086 154.134 421.053 150.628L417.846 148.395C411.15 143.731 403.389 140.824 395.276 139.943L387.823 139.134C381.451 138.441 375.017 138.537 368.668 139.418L365.553 139.851C358.675 140.805 351.911 142.45 345.362 144.76L333.47 148.954L277.843 171.318L211.346 195.599L175.54 205.823C151.735 210.921 127.459 213.491 103.115 213.491H84.106H39.6276Z" fill="#28282D" stroke="#1A1A1A" stroke-width="10"/>
<path d="M82.1099 195.946L74.6187 193.755C74.1108 193.606 73.7238 194.213 74.0725 194.611C80.3604 201.784 88.4714 207.123 97.5465 210.062L107.606 213.32L117.25 217.29C144.907 228.677 173.991 236.229 203.694 239.734L210.579 240.349C229.61 242.048 248.763 241.842 267.754 239.734L283.389 236.441C296.222 233.738 308.314 228.273 318.822 220.426L323.401 217.008C326.679 214.559 329.623 211.693 332.157 208.48L337.307 201.953C340.497 197.909 342.232 192.909 342.232 187.758V186.695C342.232 183.823 341.56 180.99 340.271 178.423C338.776 175.446 336.503 172.93 333.692 171.142L331.15 169.525C327.272 167.059 322.87 165.537 318.297 165.084L313.211 164.579C309.417 164.203 305.591 164.255 301.808 164.734L299.883 164.978C295.709 165.507 291.593 166.423 287.589 167.713L280.488 170L246.915 182.327L206.782 195.71L185.171 201.345C170.798 204.156 156.187 205.571 141.541 205.571H129.988L124.532 204.86C110.182 202.989 95.9991 200.009 82.1099 195.946Z" fill="#241F21"/>
<g filter="url(#filter3_i_184_2141)">
<ellipse cx="231.785" cy="285.73" rx="174.688" ry="163.417" fill="#F3AA77"/>
</g>
<path d="M231.785 127.313C325.82 127.313 401.472 198.548 401.473 285.73C401.473 372.913 325.82 444.148 231.785 444.148C137.75 444.148 62.0977 372.913 62.0977 285.73C62.0979 198.548 137.75 127.313 231.785 127.313Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M307.601 238.865L214.193 292.241C212.31 293.316 210.259 291.018 211.529 289.26C216.938 281.771 224.714 270.72 227.84 264.88C231.03 258.923 234.283 250.466 236.353 244.723C237.037 242.826 234.855 241.282 233.267 242.524C188.818 277.281 131.967 292.092 76.2095 283.44L65.5499 281.786C64.4381 275.856 64.7171 269.749 66.3651 263.945L71.8126 244.76C75.1328 233.068 80.1571 221.927 86.7237 211.699L95.5124 198.009C102.546 187.052 111.182 177.212 121.133 168.816C135.016 157.103 151.194 148.421 168.629 143.33L180.169 139.96C197.212 134.983 214.876 132.456 232.631 132.456H238.631C257.962 132.456 277.175 135.838 295.347 142.428C311.093 148.138 325.909 156.209 339.241 166.348L340.84 167.565C352.97 176.79 363.649 187.781 372.521 200.172L378.905 209.087C387.416 220.974 393.275 234.55 396.086 248.898L397.706 257.168C400.838 273.16 398.776 289.735 391.821 304.472L374.482 298.897C352.532 291.839 333.695 277.413 321.16 258.061L308.936 239.189C308.648 238.744 308.061 238.602 307.601 238.865Z" fill="url(#paint0_linear_184_2141)" stroke="#1A1A1A" stroke-width="10"/>
<path d="M378.488 290.239H256.685C256.63 290.239 256.588 290.288 256.596 290.342L259.889 311.595C261.726 323.455 268.565 333.957 278.669 340.434C282.697 343.016 287.137 344.888 291.797 345.97L303.866 348.772C312.053 350.672 320.567 350.655 328.746 348.722C340.762 345.882 351.459 339.049 359.087 329.34L360.792 327.17C364.183 322.854 366.99 318.111 369.141 313.061L378.715 290.582C378.784 290.42 378.665 290.239 378.488 290.239Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M85.6487 290.239H211.926C211.996 290.239 212.047 290.305 212.029 290.373L206.026 312.804C203.023 324.027 195.936 333.723 186.155 339.993C181.672 342.867 176.73 344.951 171.543 346.155L160.27 348.772C152.084 350.672 143.569 350.655 135.391 348.722C123.375 345.882 112.678 339.049 105.049 329.34L103.344 327.17C99.9534 322.854 97.1465 318.111 94.9959 313.061L85.4215 290.582C85.3522 290.42 85.4717 290.239 85.6487 290.239Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M240.245 424.968L220.182 424.932C199.964 424.895 181.706 412.833 173.74 394.25L238.783 394.251L301.659 394.252C291.977 411.793 273.948 423.114 253.943 424.214L240.245 424.968Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M12.6574 200.731L96.2642 169.956L100.101 125.194L103.938 107.928L120.143 50.0516C124.166 35.6842 132.439 22.8689 143.877 13.2882C146.966 10.2113 151.148 8.48367 155.508 8.48367H162.619C164.771 8.48367 166.917 8.68972 169.029 9.099L177.196 10.6816C185.982 12.384 195.071 11.5478 203.398 8.27074C210.567 5.44977 218.318 4.4306 225.972 5.30258L258.833 9.04618L277.808 11.2782C288.883 12.5808 299.205 17.5446 307.137 25.3819C312.29 30.4742 316.277 36.6247 318.821 43.4085L323.058 54.7083C325.328 60.7602 327.033 67.0087 328.153 73.3742L341.105 146.982L314.959 156.527L263.163 176.35L222.877 191.058L180.033 205.126L172.281 206.982C117.522 220.093 60.6228 221.58 5.25391 211.346C5.25391 206.606 8.20929 202.369 12.6574 200.731Z" fill="url(#paint1_linear_184_2141)"/>
<path d="M341.105 146.982L271.796 148.534L208.17 150.772L203.439 151.026C167.08 152.981 131.093 159.337 96.2642 169.956L12.6574 200.731C8.20929 202.369 5.25391 206.606 5.25391 211.346C60.6228 221.58 117.522 220.093 172.281 206.982L180.033 205.126L222.877 191.058L263.163 176.35L314.959 156.527L355.245 141.819L341.105 146.982ZM96.2642 169.956L100.101 125.194L103.938 107.928L120.143 50.0516C124.166 35.6842 132.439 22.8689 143.877 13.2882C146.966 10.2113 151.148 8.48367 155.508 8.48367H162.619C164.771 8.48367 166.917 8.68972 169.029 9.099L177.196 10.6816C185.982 12.384 195.071 11.5478 203.398 8.27074C210.567 5.44977 218.318 4.4306 225.972 5.30258L258.833 9.04618L277.808 11.2782C288.883 12.5808 299.205 17.5446 307.137 25.3819C312.29 30.4742 316.277 36.6247 318.821 43.4085L323.058 54.7083C325.328 60.7602 327.033 67.0087 328.153 73.3742L341.105 146.982" stroke="#1A1A1A" stroke-width="10"/>
<path d="M250.381 149.362L175.434 152.743L135.425 159.505L96.543 169.648L100.066 127.476L122.559 123.029C138.237 119.93 154.18 118.369 170.161 118.369C191.616 118.369 212.933 115.134 234.212 112.392C256.213 109.558 284.954 108.626 304.477 118.369C314.667 123.454 327.041 134.262 334.483 141.234C337.04 143.63 335.368 147.776 331.865 147.841L250.381 149.362Z" fill="#212121"/>
<path d="M250.381 149.362L175.434 152.743L135.425 159.505L96.543 169.648L100.066 127.476L122.559 123.029C138.237 119.93 154.18 118.369 170.161 118.369C191.616 118.369 212.933 115.134 234.212 112.392C256.213 109.558 284.954 108.626 304.477 118.369C314.667 123.454 327.041 134.262 334.483 141.234C337.04 143.63 335.368 147.776 331.865 147.841L250.381 149.362Z" fill="#3F3E43"/>
<path d="M250.381 149.362L175.434 152.743L135.425 159.505L96.543 169.648L100.066 127.476L122.559 123.029C138.237 119.93 154.18 118.369 170.161 118.369C191.616 118.369 212.933 115.134 234.212 112.392C256.213 109.558 284.954 108.626 304.477 118.369C314.667 123.454 327.041 134.262 334.483 141.234C337.04 143.63 335.368 147.776 331.865 147.841L250.381 149.362Z" stroke="#1A1A1A" stroke-width="10"/>
<defs>
<filter id="filter0_i_184_2141" x="147.213" y="126.381" width="182.689" height="443.593" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2141"/>
</filter>
<filter id="filter1_i_184_2141" x="325.328" y="274.46" width="113.828" height="107.939" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2141"/>
</filter>
<filter id="filter2_i_184_2141" x="22.1602" y="274.46" width="113.828" height="107.939" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2141"/>
</filter>
<filter id="filter3_i_184_2141" x="57.0977" y="122.313" width="349.375" height="328.834" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2141"/>
</filter>
<linearGradient id="paint0_linear_184_2141" x1="107.813" y1="167.957" x2="403.091" y2="325.176" gradientUnits="userSpaceOnUse">
<stop stop-color="#242328"/>
<stop stop-color="#242328"/>
<stop offset="0.468839" stop-color="#333237"/>
<stop offset="1" stop-color="#242328"/>
</linearGradient>
<linearGradient id="paint1_linear_184_2141" x1="103.868" y1="23.1339" x2="409.289" y2="232.195" gradientUnits="userSpaceOnUse">
<stop stop-color="#222226"/>
<stop offset="0.411544" stop-color="#222226"/>
<stop offset="1" stop-color="#37373D"/>
</linearGradient>
</defs>
</svg>
    </div>
    <div class="m-fig" data-m="wide">
<svg width="904" height="770" viewBox="0 0 904 770" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M800.977 764.877H653.25C651.99 764.877 651.044 763.725 651.288 762.489L729.083 368.848L802.943 762.508C803.173 763.739 802.229 764.877 800.977 764.877Z" fill="#4DB4ED" stroke="#1A1A1A" stroke-width="10"/>
<path d="M737.01 689.053C737.01 694.146 732.027 698.275 727.102 698.275C722.178 698.275 717.195 694.146 717.195 689.053C717.195 683.96 722.178 679.831 727.102 679.831C732.027 679.831 737.01 683.96 737.01 689.053Z" fill="#3291C5"/>
<path d="M737.01 721.846C737.01 726.939 732.027 731.068 727.102 731.068C722.178 731.068 717.195 726.939 717.195 721.846C717.195 716.753 722.178 712.624 727.102 712.624C732.027 712.624 737.01 716.753 737.01 721.846Z" fill="#3291C5"/>
<path d="M836.761 669.561L842.915 700.337C842.967 700.596 842.769 700.838 842.505 700.838C818.331 700.838 795.336 690.389 779.436 672.18L774.853 666.931L767.433 660.285C758.651 652.419 757.405 639.118 764.574 629.758C768.844 624.184 775.465 620.915 782.486 620.915H786.861C793.489 620.915 799.947 623.011 805.312 626.902L812.952 632.444C825.275 641.381 833.776 654.635 836.761 669.561Z" fill="url(#paint0_linear_184_2190)" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter0_i_184_2190)">
<path d="M800.977 764.877H653.25C651.99 764.877 651.044 763.725 651.288 762.489L729.083 368.848L802.943 762.508C803.173 763.739 802.229 764.877 800.977 764.877Z" fill="#28282D"/>
</g>
<path d="M800.977 764.877H653.25C651.99 764.877 651.044 763.725 651.288 762.489L729.083 368.848L802.943 762.508C803.173 763.739 802.229 764.877 800.977 764.877Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M737.01 689.053C737.01 694.146 732.027 698.275 727.102 698.275C722.178 698.275 717.195 694.146 717.195 689.053C717.195 683.96 722.178 679.831 727.102 679.831C732.027 679.831 737.01 683.96 737.01 689.053Z" fill="#3F3E43"/>
<path d="M737.01 721.846C737.01 726.939 732.027 731.068 727.102 731.068C722.178 731.068 717.195 726.939 717.195 721.846C717.195 716.753 722.178 712.624 727.102 712.624C732.027 712.624 737.01 716.753 737.01 721.846Z" fill="#3F3E43"/>
<g filter="url(#filter1_i_184_2190)">
<ellipse cx="853.418" cy="550.727" rx="50.0313" ry="48.1587" fill="#F3AA77"/>
</g>
<path d="M853.418 507.568C878.47 507.568 898.449 527.07 898.449 550.728C898.449 574.385 878.469 593.886 853.418 593.886C828.367 593.886 808.387 574.385 808.387 550.728C808.387 527.07 828.366 507.568 853.418 507.568Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter2_i_184_2190)">
<ellipse cx="586.914" cy="550.727" rx="50.0313" ry="48.1587" fill="#F3AA77"/>
</g>
<path d="M586.914 507.568C611.966 507.568 631.945 527.07 631.945 550.728C631.945 574.385 611.965 593.886 586.914 593.886C561.863 593.886 541.883 574.385 541.883 550.728C541.883 527.07 561.863 507.568 586.914 507.568Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter3_i_184_2190)">
<path d="M874.716 512.808C874.716 594.863 805.965 661.382 721.155 661.382C636.346 661.382 567.594 594.863 567.594 512.808C567.594 430.752 636.346 364.233 721.155 364.233C805.965 364.233 874.716 430.752 874.716 512.808Z" fill="#F3AA77"/>
</g>
<path d="M721.155 369.233C803.36 369.233 869.717 433.668 869.717 512.807C869.717 591.947 803.36 656.382 721.155 656.382C638.95 656.382 572.594 591.947 572.594 512.807C572.594 433.668 638.95 369.233 721.155 369.233Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M781.614 369.881L758.455 418.481C746.502 443.563 721.193 459.539 693.409 459.539L666.612 365.675C660.38 343.847 668.301 320.439 686.508 306.881C691.08 303.476 696.157 300.808 701.555 298.974L704.097 298.11C719.598 292.843 736.454 293.17 751.738 299.034L753.616 299.755C757.059 301.076 760.35 302.763 763.432 304.788C784.903 318.896 792.667 346.688 781.614 369.881Z" fill="url(#paint1_linear_184_2190)"/>
<path d="M693.408 459.539H693.409M693.409 459.539L666.612 365.675C660.38 343.847 668.301 320.439 686.508 306.881C691.08 303.476 696.157 300.808 701.555 298.974L704.097 298.11C719.598 292.843 736.454 293.17 751.738 299.034L753.616 299.755C757.059 301.076 760.35 302.763 763.432 304.788C784.903 318.896 792.667 346.688 781.614 369.881L758.455 418.481C746.502 443.563 721.193 459.539 693.409 459.539ZM763.83 394.821H682.51L691.614 358.319C694.29 347.587 702.109 338.819 712.445 334.881C719.947 332.022 728.271 331.935 735.82 334.668C746.986 338.709 755.178 348.36 757.352 360.034L763.83 394.821Z" stroke="#1A1A1A" stroke-width="10" stroke-linecap="square"/>
<path d="M850.105 439.231L850.56 440.018C858.079 453.001 863.573 467.057 866.851 481.698L869.357 492.888L870.826 503.524V516.06L867.52 541.512C839.972 527.143 817.269 504.975 802.247 477.777L798.216 470.481C798.105 470.279 797.837 470.228 797.657 470.372C768.23 493.931 734.799 512.644 699.291 525.3L692.629 527.674C690.979 528.263 689.476 526.5 690.318 524.963L706.643 495.167L714.229 476.533C714.652 475.494 713.033 474.766 712.04 475.288C671.615 496.549 630.661 514.948 586.377 526.131L573.605 529.356V501.106L574.763 490.862C575.752 482.11 577.715 473.495 580.615 465.178C583.087 458.089 586.228 451.25 589.996 444.756L595.351 435.526L597.313 432.836C606.483 420.264 617.479 409.133 629.939 399.811C638.266 393.582 647.194 388.199 656.59 383.744L666.9 378.855L672.715 376.823C689.741 370.876 707.646 367.838 725.681 367.838C743.565 367.838 761.584 371.208 778.25 377.694C791.292 382.77 803.601 389.768 814.617 398.4C828.94 409.624 840.986 423.483 850.105 439.231Z" fill="url(#paint2_linear_184_2190)" stroke="#1A1A1A" stroke-width="10"/>
<path d="M793.758 522.924H840.187C840.542 522.924 840.786 523.282 840.656 523.613C823.899 566.149 763.689 566.123 746.863 523.614C746.732 523.283 746.976 522.924 747.332 522.924H793.758Z" fill="white" stroke="#1A1A1A" stroke-width="10" stroke-linecap="round"/>
<path d="M648.286 522.924H694.714C695.069 522.924 695.313 523.282 695.183 523.613C678.427 566.149 618.216 566.123 601.39 523.614C601.259 523.283 601.503 522.924 601.859 522.924H648.286Z" fill="white" stroke="#1A1A1A" stroke-width="10" stroke-linecap="round"/>
<path d="M684.243 615.498C681.665 614.509 678.818 615.814 677.886 618.413C676.953 621.012 678.287 623.92 680.866 624.909L682.554 620.204L684.243 615.498ZM773.459 602.733C772.824 600.017 770.147 598.301 767.48 598.899C764.812 599.498 763.164 602.184 763.798 604.9L768.628 603.816L773.459 602.733ZM771.982 623.22C773.661 625.446 776.78 625.901 778.948 624.235C781.116 622.57 781.513 619.414 779.834 617.188L775.908 620.204L771.982 623.22ZM756.224 619.682L758.174 624.344L772.857 618.233L770.907 613.57L768.957 608.908L754.274 615.019L756.224 619.682ZM682.554 620.204L680.866 624.909L681.757 625.251L683.446 620.545L685.134 615.84L684.243 615.498L682.554 620.204ZM770.907 613.57L775.737 612.487L773.459 602.733L768.628 603.816L763.798 604.9L766.077 614.654L770.907 613.57ZM770.907 613.57L766.981 616.586L771.982 623.22L775.908 620.204L779.834 617.188L774.833 610.555L770.907 613.57ZM756.224 619.682L754.274 615.019C732.306 624.163 707.597 624.456 685.134 615.84L683.446 620.545L681.757 625.251C706.584 634.774 733.894 634.45 758.174 624.344L756.224 619.682Z" fill="#1A1A1A"/>
<path d="M509.296 764.681H369.489C368.228 764.681 367.282 763.53 367.527 762.294L441.259 389.209L511.261 762.313C511.492 763.543 510.548 764.681 509.296 764.681Z" fill="#4DB4ED" stroke="#1A1A1A" stroke-width="10"/>
<path d="M448.778 692.792C448.778 697.62 444.054 701.535 439.385 701.535C434.716 701.535 429.992 697.62 429.992 692.792C429.992 687.963 434.716 684.048 439.385 684.048C444.054 684.048 448.778 687.963 448.778 692.792Z" fill="#3291C5"/>
<path d="M448.778 723.88C448.778 728.709 444.054 732.623 439.385 732.623C434.716 732.623 429.992 728.709 429.992 723.88C429.992 719.051 434.716 715.137 439.385 715.137C444.054 715.137 448.778 719.051 448.778 723.88Z" fill="#3291C5"/>
<g filter="url(#filter4_i_184_2190)">
<path d="M509.296 764.681H369.489C368.228 764.681 367.282 763.53 367.527 762.294L441.259 389.209L511.261 762.313C511.492 763.543 510.548 764.681 509.296 764.681Z" fill="#28282D"/>
</g>
<path d="M509.296 764.681H369.489C368.228 764.681 367.282 763.53 367.527 762.294L441.259 389.209L511.261 762.313C511.492 763.543 510.548 764.681 509.296 764.681Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M448.778 692.792C448.778 697.62 444.054 701.535 439.385 701.535C434.716 701.535 429.992 697.62 429.992 692.792C429.992 687.963 434.716 684.048 439.385 684.048C444.054 684.048 448.778 687.963 448.778 692.792Z" fill="#3F3E43"/>
<path d="M448.778 723.88C448.778 728.709 444.054 732.623 439.385 732.623C434.716 732.623 429.992 728.709 429.992 723.88C429.992 719.051 434.716 715.137 439.385 715.137C444.054 715.137 448.778 719.051 448.778 723.88Z" fill="#3F3E43"/>
<g filter="url(#filter5_i_184_2190)">
<ellipse cx="559.145" cy="561.649" rx="47.4343" ry="45.6589" fill="#F3AA77"/>
</g>
<path d="M559.146 520.99C582.763 520.99 601.579 539.372 601.579 561.649C601.579 583.926 582.763 602.308 559.146 602.309C535.528 602.309 516.711 583.927 516.711 561.649C516.711 539.372 535.528 520.99 559.146 520.99Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter6_i_184_2190)">
<ellipse cx="306.473" cy="561.649" rx="47.4343" ry="45.6589" fill="#F3AA77"/>
</g>
<path d="M306.474 520.99C330.091 520.99 348.907 539.372 348.907 561.649C348.907 583.926 330.091 602.308 306.474 602.309C282.856 602.309 264.039 583.927 264.039 561.649C264.039 539.372 282.856 520.99 306.474 520.99Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M273.599 463.434L244.952 461.587C244.116 465.335 245.836 469.188 249.184 471.069L259.981 477.13C274.365 483.922 289.214 489.681 304.417 494.363L313.459 497.148C338.201 504.769 363.533 510.322 389.193 513.752L412.452 516.861L421.935 517.819C448.213 520.476 474.707 520.155 500.912 516.861L520.49 512.191C539.501 507.656 557.181 498.719 572.104 486.099L577.035 481.93C582.041 477.696 586.475 472.827 590.222 467.447L596.616 458.268C601.267 451.592 603.761 443.65 603.761 435.513V433.427C603.761 429.243 602.885 425.107 601.189 421.283C599.035 416.424 595.626 412.226 591.314 409.12L588.958 407.423C583.291 403.34 576.667 400.786 569.726 400.006L563.843 399.345C558.503 398.745 553.108 398.828 547.789 399.591L545.218 399.961C539.499 400.782 533.88 402.193 528.452 404.173L518.498 407.805L472.136 427.082L416.715 448.012L386.873 456.825C367.037 461.218 346.782 463.434 326.466 463.434H310.669H273.599Z" fill="#28282D" stroke="#1A1A1A" stroke-width="10"/>
<path d="M308.77 448.241L302.751 446.421C302.327 446.292 301.997 446.796 302.283 447.134C307.537 453.332 314.387 457.974 322.092 460.554L330.254 463.288L338.45 466.778C361.389 476.546 385.589 483.036 410.338 486.057L416.072 486.587C431.933 488.051 447.903 487.874 463.727 486.057L476.449 483.286C487.343 480.913 497.572 476.146 506.396 469.331L509.988 466.558C512.798 464.388 515.312 461.858 517.466 459.035L521.637 453.567C524.337 450.027 525.8 445.697 525.8 441.245V440.261C525.8 437.834 525.249 435.439 524.189 433.255C522.928 430.658 520.989 428.449 518.576 426.862L516.643 425.591C513.362 423.432 509.608 422.095 505.701 421.694L501.637 421.277C498.459 420.951 495.254 420.996 492.087 421.412L490.495 421.62C487.023 422.075 483.603 422.862 480.281 423.968L474.34 425.948L446.359 436.573L412.911 448.109L394.9 452.966C382.923 455.389 370.734 456.609 358.514 456.609H348.908L344.644 456.034C332.497 454.397 320.501 451.791 308.77 448.241Z" fill="#241F21"/>
<g filter="url(#filter7_i_184_2190)">
<ellipse cx="433.747" cy="525.705" rx="145.59" ry="140.863" fill="#F3AA77"/>
</g>
<path d="M433.747 389.842C511.55 389.842 574.337 450.824 574.337 525.705C574.337 600.585 511.55 661.568 433.747 661.568C355.944 661.568 293.156 600.585 293.156 525.705C293.156 450.824 355.944 389.842 433.747 389.842Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M496.784 485.399L420.377 530.556C418.512 531.658 416.423 529.392 417.659 527.613C422.105 521.219 428.007 512.479 430.464 507.732C433.154 502.535 435.899 495.131 437.621 490.179C438.167 488.61 436.349 487.36 435.057 488.405C398.059 518.327 350.086 531.112 303.104 523.572L295.206 522.304C294.278 517.189 294.511 511.93 295.888 506.916L300.397 490.492C303.184 480.342 307.417 470.647 312.968 461.705L320.382 449.761C326.109 440.534 333.18 432.214 341.362 425.074C353.039 414.884 366.751 407.297 381.586 402.816L390.554 400.107C404.872 395.783 419.748 393.585 434.705 393.585H439.204C455.474 393.585 471.613 396.512 486.847 402.226C499.902 407.122 512.124 414.002 523.083 422.622L524.291 423.572C534.633 431.707 543.7 441.345 551.19 452.163L553.533 455.547C562.499 468.497 568.646 483.185 571.576 498.66C574.528 514.247 574.151 530.281 570.47 545.712L567.131 559.706L539.269 538.806C529.436 531.43 521.047 522.305 514.523 511.888L498.141 485.729C497.853 485.269 497.251 485.123 496.784 485.399Z" fill="url(#paint3_linear_184_2190)" stroke="#1A1A1A" stroke-width="10"/>
<path d="M556.006 529.594H454.505C454.457 529.594 454.42 529.637 454.428 529.684L457.251 548.53C458.734 558.43 464.343 567.239 472.687 572.771C476.133 575.056 479.954 576.719 483.974 577.684L493.7 580.019C500.598 581.675 507.792 581.66 514.683 579.976C524.61 577.549 533.401 571.784 539.583 563.647L541.361 561.305C544.126 557.666 546.407 553.684 548.147 549.459L556.205 529.892C556.263 529.75 556.159 529.594 556.006 529.594Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M311.971 529.594H417.201C417.261 529.594 417.306 529.651 417.29 529.71L412.165 549.519C409.739 558.894 403.932 567.042 395.86 572.393C392.037 574.928 387.799 576.773 383.339 577.843L374.278 580.019C367.379 581.675 360.185 581.66 353.294 579.976C343.367 577.549 334.576 571.784 328.395 563.647L326.616 561.305C323.851 557.666 321.571 553.684 319.83 549.459L311.772 529.892C311.714 529.75 311.818 529.594 311.971 529.594Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M440.803 645.721L424.653 645.69C407.519 645.658 391.99 635.201 385.375 619.242L439.585 619.244L491.988 619.244C483.92 634.361 468.617 644.138 451.501 645.112L440.803 645.721Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<path d="M251.293 452.379L320.789 425.922L323.986 387.338L327.184 372.455L340.778 322.244C344.075 310.062 350.932 299.141 360.471 290.877C363.04 288.23 366.572 286.736 370.262 286.736H376.07C377.877 286.736 379.679 286.915 381.45 287.27L388.199 288.622C395.538 290.093 403.148 289.373 410.081 286.551C416.047 284.123 422.532 283.244 428.929 283.998L456.279 287.221L471.661 289.092C481.16 290.248 489.982 294.604 496.675 301.443C500.881 305.741 504.117 310.889 506.166 316.542L509.836 326.663C511.708 331.825 513.113 337.145 514.034 342.559L524.847 406.119L503.056 414.346L459.888 431.434L426.312 444.111L390.605 456.238L384.093 457.85C338.523 469.135 291.049 470.414 244.938 461.599C244.938 457.505 247.466 453.836 251.293 452.379Z" fill="url(#paint4_linear_184_2190)"/>
<path d="M524.847 406.119L467.082 407.456L414.054 409.386L410.242 409.598C379.86 411.287 349.809 416.771 320.789 425.922L251.293 452.379C247.466 453.836 244.938 457.505 244.938 461.599C291.049 470.414 338.523 469.135 384.093 457.85L390.605 456.238L426.312 444.111L459.888 431.434L503.056 414.346L536.632 401.669L524.847 406.119ZM320.789 425.922L323.986 387.338L327.184 372.455L340.778 322.244C344.075 310.062 350.932 299.141 360.471 290.877C363.04 288.23 366.572 286.736 370.262 286.736H376.07C377.877 286.736 379.679 286.915 381.45 287.27L388.199 288.622C395.538 290.093 403.148 289.373 410.081 286.551C416.047 284.123 422.532 283.244 428.929 283.998L456.278 287.221L471.661 289.092C481.16 290.248 489.982 294.604 496.675 301.443C500.881 305.741 504.117 310.889 506.166 316.542L509.836 326.663C511.708 331.825 513.113 337.145 514.034 342.559L524.847 406.119" stroke="#1A1A1A" stroke-width="10"/>
<path d="M449.233 408.167L386.77 411.081L353.425 416.91L321.02 425.653L323.956 389.302L342.722 385.465C355.773 382.796 369.06 381.452 382.381 381.452C400.253 381.452 418.003 378.669 435.719 376.305C454.06 373.858 478.036 373.048 494.319 381.452C502.43 385.638 512.201 394.324 518.467 400.332C520.971 402.734 519.292 406.815 515.823 406.882L449.233 408.167Z" fill="#212121"/>
<path d="M449.233 408.167L386.77 411.081L353.425 416.91L321.02 425.653L323.956 389.302L342.722 385.465C355.773 382.796 369.06 381.452 382.381 381.452C400.253 381.452 418.003 378.669 435.719 376.305C454.06 373.858 478.036 373.048 494.319 381.452C502.43 385.638 512.201 394.324 518.467 400.332C520.971 402.734 519.292 406.815 515.823 406.882L449.233 408.167Z" fill="#3F3E43"/>
<path d="M449.233 408.167L386.77 411.081L353.425 416.91L321.02 425.653L323.956 389.302L342.722 385.465C355.773 382.796 369.06 381.452 382.381 381.452C400.253 381.452 418.003 378.669 435.719 376.305C454.06 373.858 478.036 373.048 494.319 381.452C502.43 385.638 512.201 394.324 518.467 400.332C520.971 402.734 519.292 406.815 515.823 406.882L449.233 408.167Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M663.709 764.417H505.159C500.749 764.417 497.437 760.387 498.292 756.059L583.581 324.501L665.674 762.048C665.905 763.279 664.961 764.417 663.709 764.417Z" fill="#EFEDF9" stroke="#1A1A1A" stroke-width="10"/>
<path d="M589.998 731.729V695.786C589.998 687.225 591.598 678.748 594.714 670.775C602.234 651.536 618.009 636.7 637.672 630.372L638.822 630.001L663.762 761.95C663.995 763.182 663.05 764.322 661.797 764.322H589.998V731.729Z" fill="#28282D"/>
<path d="M589.998 731.729V695.786C589.998 687.225 591.598 678.748 594.714 670.775C602.234 651.536 618.009 636.7 637.672 630.372L638.822 630.001L663.762 761.95C663.995 763.182 663.05 764.322 661.797 764.322H589.998V731.729Z" fill="#707070" fill-opacity="0.15"/>
<path d="M589.998 731.729V695.786C589.998 687.225 591.598 678.748 594.714 670.775C602.234 651.536 618.009 636.7 637.672 630.372L638.822 630.001L663.762 761.95C663.995 763.182 663.05 764.322 661.797 764.322H589.998V731.729Z" stroke="#1B1B1B" stroke-width="10"/>
<path d="M570.645 731.823V695.88C570.645 687.319 569.045 678.842 565.928 670.868C558.408 651.63 542.634 636.793 522.971 630.465L521.821 630.095L496.88 762.044C496.648 763.276 497.592 764.415 498.846 764.415H570.645V731.823Z" fill="#28282D"/>
<path d="M570.645 731.823V695.88C570.645 687.319 569.045 678.842 565.928 670.868C558.408 651.63 542.634 636.793 522.971 630.465L521.821 630.095L496.88 762.044C496.648 763.276 497.592 764.415 498.846 764.415H570.645V731.823Z" fill="#707070" fill-opacity="0.15"/>
<path d="M570.645 731.823V695.88C570.645 687.319 569.045 678.842 565.928 670.868C558.408 651.63 542.634 636.793 522.971 630.465L521.821 630.095L496.88 762.044C496.648 763.276 497.592 764.415 498.846 764.415H570.645V731.823Z" stroke="#1B1B1B" stroke-width="10"/>
<path d="M663.709 764.416H505.159C500.749 764.416 497.437 760.386 498.292 756.059L583.581 324.5L665.674 762.047C665.905 763.278 664.961 764.416 663.709 764.416Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter8_i_184_2190)">
<ellipse cx="721.708" cy="526.531" rx="55.5756" ry="53.4956" fill="#F3AA77"/>
</g>
<path d="M721.708 478.035C749.821 478.035 772.284 499.925 772.284 526.53C772.284 553.136 749.822 575.026 721.708 575.026C693.595 575.026 671.133 553.135 671.133 526.53C671.133 499.925 693.595 478.035 721.708 478.035Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter9_i_184_2190)">
<ellipse cx="425.669" cy="526.531" rx="55.5756" ry="53.4956" fill="#F3AA77"/>
</g>
<path d="M425.669 478.035C453.782 478.035 476.245 499.925 476.245 526.53C476.245 553.136 453.783 575.026 425.669 575.026C397.556 575.026 375.094 553.135 375.094 526.53C375.094 499.925 397.556 478.035 425.669 478.035Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M507.938 395.928L497.685 391.548C497.297 391.382 496.924 391.811 497.141 392.173C501.568 399.549 508.081 405.449 515.859 409.128L520.497 411.322L529.081 416.484C546.895 427.197 566.546 434.505 587.031 438.036L591.751 438.651C604.923 440.369 618.274 440.161 631.387 438.036L638.582 435.822C649.792 432.374 659.881 425.999 667.807 417.353L668.835 416.233C671.825 412.972 674.401 409.353 676.504 405.46L679.084 400.683C681.626 395.977 682.957 390.713 682.957 385.365V383.595C682.957 381.201 682.551 378.799 681.773 376.535C680.628 373.206 678.668 370.177 676.09 367.781C672.906 364.823 668.896 362.904 664.594 362.281L663.16 362.073C660.345 361.665 657.482 361.721 654.684 362.239L653.512 362.456C650.708 362.975 647.983 363.852 645.404 365.066L640.204 367.512L616.958 379.978L589.169 393.513L574.205 399.212L572.595 399.672C563.736 402.202 554.568 403.486 545.355 403.486H544.865C538.965 403.486 533.078 402.931 527.283 401.827C520.641 400.562 514.155 398.585 507.938 395.928Z" fill="#241F21"/>
<g filter="url(#filter10_i_184_2190)">
<ellipse cx="574.786" cy="484.419" rx="170.579" ry="165.04" fill="#F3AA77"/>
</g>
<path d="M574.786 324.38C666.389 324.38 740.364 396.186 740.364 484.419C740.364 572.652 666.389 644.459 574.786 644.459C483.183 644.459 409.207 572.652 409.207 484.419C409.207 396.186 483.183 324.38 574.786 324.38Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M648.839 437.08L557.706 490.94C555.841 492.042 553.757 489.777 554.998 488.001C560.28 480.437 567.881 469.266 570.936 463.364C574.088 457.276 577.305 448.601 579.322 442.798C579.961 440.96 577.831 439.496 576.318 440.719C532.97 475.777 476.763 490.757 421.717 481.923L412.463 480.437C411.377 474.444 411.65 468.282 413.263 462.408L418.546 443.165C421.81 431.273 426.771 419.914 433.274 409.437L441.96 395.443C448.67 384.633 456.955 374.884 466.541 366.519C480.222 354.58 496.288 345.691 513.67 340.441L524.176 337.267C540.952 332.2 558.381 329.625 575.906 329.625H581.176C600.239 329.625 619.147 333.055 636.997 339.749C652.293 345.486 666.612 353.546 679.452 363.646L680.867 364.759C692.984 374.291 703.607 385.582 712.383 398.258C724.697 416.044 733.14 436.217 737.166 457.473L741.515 480.437L738.86 480.712C703.434 484.376 669.009 467.572 650.106 437.388C649.837 436.959 649.275 436.822 648.839 437.08Z" fill="#242328" stroke="#1A1A1A" stroke-width="10"/>
<path d="M721.944 488.706H602.904L606.135 510.274C607.929 522.252 614.607 532.858 624.473 539.399C628.406 542.007 632.742 543.898 637.293 544.99L649.078 547.82C649.078 547.82 665.386 549.722 673.372 547.77C685.105 544.901 695.551 538 702.999 528.195L704.665 526.003C707.976 521.645 710.717 516.854 712.817 511.755L722.166 489.053C722.234 488.888 722.117 488.706 721.944 488.706Z" fill="url(#paint5_linear_184_2190)"/>
<path d="M432.102 488.974H555.409C555.477 488.974 555.527 489.041 555.51 489.109L549.648 511.763C546.715 523.097 539.796 532.89 530.245 539.222C525.867 542.124 521.041 544.229 515.976 545.445L504.969 548.088C496.975 550.007 488.66 549.99 480.674 548.038C468.941 545.17 458.496 538.269 451.047 528.463L449.381 526.271C446.07 521.913 443.33 517.122 441.23 512.023L431.88 489.321C431.813 489.157 431.929 488.974 432.102 488.974Z" fill="url(#paint6_linear_184_2190)"/>
<path d="M553.591 488.706L580.934 489.321L602.904 488.706H721.944C722.117 488.706 722.234 488.888 722.166 489.053L712.817 511.755C710.717 516.854 707.976 521.645 704.665 526.003L702.999 528.195C695.551 538 685.105 544.901 673.372 547.77C665.386 549.722 649.078 547.82 649.078 547.82L637.293 544.99C632.742 543.898 628.406 542.007 624.473 539.399C614.607 532.858 607.929 522.252 606.135 510.274L602.904 488.706M722.166 489.053L746.447 480.626M431.88 489.321L441.23 512.023C443.33 517.122 446.07 521.913 449.381 526.271L451.047 528.463C458.496 538.269 468.941 545.17 480.674 548.038C488.66 549.99 496.975 550.007 504.969 548.088L515.976 545.445C521.041 544.229 525.867 542.124 530.245 539.222C539.796 532.89 546.715 523.097 549.648 511.763L555.51 489.109C555.527 489.041 555.477 488.974 555.409 488.974H432.102C431.929 488.974 431.813 489.157 431.88 489.321ZM431.88 489.321L404.68 478.606" stroke="#1C1C1C" stroke-width="10"/>
<path d="M607.966 618.996L596.933 621.068C578.722 624.489 560.468 615.104 552.604 598.278L603.762 588.551L653.214 579.147C647.343 598.106 632.121 612.671 612.925 617.697L607.966 618.996Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter11_d_184_2190)">
<path d="M437.386 438.627L416.248 438.482C413.381 438.555 411.248 435.765 411.976 432.897L416.152 416.447C421.546 395.2 431.459 375.466 445.167 358.687C465.903 333.305 494.316 315.906 525.805 309.305L537.811 306.789C562.842 301.542 588.672 301.931 613.545 307.929L620.378 309.577C647.313 316.073 672.094 329.861 692.178 349.528C715.216 372.088 731.053 401.378 737.574 433.489L737.81 434.647C738.226 436.699 736.713 438.627 734.686 438.627H711.362H574.374H437.386Z" fill="url(#paint7_linear_184_2190)"/>
<path d="M437.386 438.627L416.248 438.482C413.381 438.555 411.248 435.765 411.976 432.897L416.152 416.447C421.546 395.2 431.459 375.466 445.167 358.687C465.903 333.305 494.316 315.906 525.805 309.305L537.811 306.789C562.842 301.542 588.672 301.931 613.545 307.929L620.378 309.577C647.313 316.073 672.094 329.861 692.178 349.528C715.216 372.088 731.053 401.378 737.574 433.489L737.81 434.647C738.226 436.699 736.713 438.627 734.686 438.627H711.362H574.374H437.386Z" fill="#707070" fill-opacity="0.15"/>
<path d="M447.153 479.377L437.386 438.627H574.374H711.362L703.506 476.508C700.728 489.902 690.996 500.598 678.238 504.279C672.893 505.821 667.274 506.051 661.829 504.95L618.653 496.226C591.75 490.789 564.105 490.566 537.124 495.568L485.555 505.129C475.182 507.052 464.845 501.398 457.244 494.083C452.697 489.706 448.363 484.428 447.153 479.377Z" fill="url(#paint8_linear_184_2190)"/>
<path d="M447.153 479.377L437.386 438.627H574.374H711.362L703.506 476.508C700.728 489.902 690.996 500.598 678.238 504.279C672.893 505.821 667.274 506.051 661.829 504.95L618.653 496.226C591.75 490.789 564.105 490.566 537.124 495.568L485.555 505.129C475.182 507.052 464.845 501.398 457.244 494.083C452.697 489.706 448.363 484.428 447.153 479.377Z" fill="#707070" fill-opacity="0.15"/>
<path d="M437.386 438.627L416.248 438.482C413.381 438.555 411.248 435.765 411.976 432.897L416.152 416.447C421.546 395.2 431.459 375.466 445.167 358.687C465.903 333.305 494.316 315.906 525.805 309.305L537.811 306.789C562.842 301.542 588.672 301.931 613.545 307.929L620.378 309.577C647.313 316.073 672.094 329.861 692.178 349.528C715.216 372.088 731.053 401.378 737.574 433.489L737.81 434.647C738.226 436.699 736.713 438.627 734.686 438.627H711.362M437.386 438.627L447.153 479.377C448.363 484.428 452.697 489.706 457.244 494.083C464.845 501.398 475.182 507.052 485.555 505.129L537.124 495.568C564.105 490.566 591.75 490.789 618.653 496.226L661.829 504.95C667.274 506.051 672.893 505.821 678.238 504.279C690.996 500.598 700.728 489.902 703.506 476.508L711.362 438.627M437.386 438.627H574.374H711.362" stroke="#1A1A1A" stroke-width="10"/>
</g>
<g filter="url(#filter12_f_184_2190)">
<path d="M100.759 26.744L21.2836 57.1877H16.3777L10 83.5722L21.2836 72.4095L100.759 43.488L186.122 57.1877L231.747 34.3549L314.166 83.0648L340.658 92.7053L334.771 57.1877C326.921 49.5768 310.045 32.8328 305.335 26.744C300.626 20.6553 262.163 13.0444 243.521 10L186.122 34.3549L100.759 26.744Z" fill="#CBCBCB" fill-opacity="0.03"/>
</g>
<defs>
<filter id="filter0_i_184_2190" x="646.248" y="367.879" width="161.73" height="403.998" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter1_i_184_2190" x="803.387" y="502.568" width="100.062" height="98.3174" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter2_i_184_2190" x="536.883" y="502.568" width="100.062" height="98.3174" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter3_i_184_2190" x="567.594" y="364.233" width="307.123" height="299.149" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter4_i_184_2190" x="362.486" y="388.24" width="153.812" height="383.441" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter5_i_184_2190" x="511.711" y="515.99" width="94.8691" height="93.3179" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter6_i_184_2190" x="259.039" y="515.99" width="94.8691" height="93.3179" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter7_i_184_2190" x="288.156" y="384.842" width="291.182" height="283.726" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter8_i_184_2190" x="666.133" y="473.035" width="111.15" height="108.991" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter9_i_184_2190" x="370.094" y="473.035" width="111.15" height="108.991" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter10_i_184_2190" x="404.207" y="319.38" width="341.158" height="332.079" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2190"/>
</filter>
<filter id="filter11_d_184_2190" x="401.836" y="298.123" width="346.041" height="257.512" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="40"/>
<feGaussianBlur stdDeviation="2.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_184_2190"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_184_2190" result="shape"/>
</filter>
<filter id="filter12_f_184_2190" x="0" y="0" width="350.658" height="102.705" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_184_2190"/>
</filter>
<linearGradient id="paint0_linear_184_2190" x1="821.615" y1="636.749" x2="737.874" y2="660.636" gradientUnits="userSpaceOnUse">
<stop stop-color="#815438"/>
<stop offset="0.47253" stop-color="#623518"/>
<stop offset="1" stop-color="#623518"/>
</linearGradient>
<linearGradient id="paint1_linear_184_2190" x1="672.17" y1="323.961" x2="829.832" y2="362.614" gradientUnits="userSpaceOnUse">
<stop stop-color="#623518"/>
<stop stop-color="#623518"/>
<stop offset="0.468839" stop-color="#815438"/>
<stop offset="1" stop-color="#623518"/>
</linearGradient>
<linearGradient id="paint2_linear_184_2190" x1="612.244" y1="405.813" x2="875.601" y2="541.392" gradientUnits="userSpaceOnUse">
<stop stop-color="#623518"/>
<stop stop-color="#623518"/>
<stop offset="0.468839" stop-color="#815438"/>
<stop offset="1" stop-color="#623518"/>
</linearGradient>
<linearGradient id="paint3_linear_184_2190" x1="330.429" y1="424.186" x2="580.117" y2="552.727" gradientUnits="userSpaceOnUse">
<stop stop-color="#242328"/>
<stop stop-color="#242328"/>
<stop offset="0.468839" stop-color="#333237"/>
<stop offset="1" stop-color="#242328"/>
</linearGradient>
<linearGradient id="paint4_linear_184_2190" x1="327.126" y1="299.364" x2="587.077" y2="471.408" gradientUnits="userSpaceOnUse">
<stop stop-color="#222226"/>
<stop offset="0.411544" stop-color="#222226"/>
<stop offset="1" stop-color="#37373D"/>
</linearGradient>
<linearGradient id="paint5_linear_184_2190" x1="404.68" y1="478.606" x2="747.306" y2="544.862" gradientUnits="userSpaceOnUse">
<stop offset="0.118343" stop-color="#181818"/>
<stop offset="0.295437" stop-color="#464646"/>
<stop offset="0.410027" stop-color="#181818"/>
<stop offset="0.58712" stop-color="#181818"/>
<stop offset="0.753797" stop-color="#464646"/>
<stop offset="0.884013" stop-color="#181818"/>
</linearGradient>
<linearGradient id="paint6_linear_184_2190" x1="404.68" y1="478.606" x2="747.306" y2="544.862" gradientUnits="userSpaceOnUse">
<stop offset="0.118343" stop-color="#181818"/>
<stop offset="0.295437" stop-color="#464646"/>
<stop offset="0.410027" stop-color="#181818"/>
<stop offset="0.58712" stop-color="#181818"/>
<stop offset="0.753797" stop-color="#464646"/>
<stop offset="0.884013" stop-color="#181818"/>
</linearGradient>
<linearGradient id="paint7_linear_184_2190" x1="574.855" y1="303.123" x2="574.855" y2="505.672" gradientUnits="userSpaceOnUse">
<stop stop-color="#28282D"/>
<stop offset="0.514199" stop-color="#32323A"/>
<stop offset="1" stop-color="#28282D"/>
</linearGradient>
<linearGradient id="paint8_linear_184_2190" x1="574.855" y1="303.123" x2="574.855" y2="505.672" gradientUnits="userSpaceOnUse">
<stop stop-color="#28282D"/>
<stop offset="0.514199" stop-color="#32323A"/>
<stop offset="1" stop-color="#28282D"/>
</linearGradient>
</defs>
</svg>
    </div>
    <div class="m-fig" data-m="buddy">
<svg width="464" height="518" viewBox="0 0 464 518" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M334.588 512.744H146.524C145.259 512.744 144.311 511.583 144.565 510.343L243.05 28.5156L336.552 510.363C336.791 511.597 335.846 512.744 334.588 512.744Z" fill="#4DB4ED" stroke="#1A1A1A" stroke-width="10"/>
<path d="M253.075 420.034C253.075 426.262 246.774 431.31 240.546 431.31C234.319 431.31 228.018 426.262 228.018 420.034C228.018 413.807 234.319 408.759 240.546 408.759C246.774 408.759 253.075 413.807 253.075 420.034Z" fill="#3291C5"/>
<path d="M253.075 460.123C253.075 466.351 246.774 471.399 240.546 471.399C234.319 471.399 228.018 466.351 228.018 460.123C228.018 453.896 234.319 448.848 240.546 448.848C246.774 448.848 253.075 453.896 253.075 460.123Z" fill="#3291C5"/>
<g filter="url(#filter0_i_184_2166)">
<path d="M334.588 512.744H146.524C145.259 512.744 144.311 511.583 144.565 510.343L243.05 28.5156L336.552 510.363C336.791 511.597 335.846 512.744 334.588 512.744Z" fill="#EFEDF9"/>
</g>
<path d="M334.588 512.744H146.524C145.259 512.744 144.311 511.583 144.565 510.343L243.05 28.5156L336.552 510.363C336.791 511.597 335.846 512.744 334.588 512.744Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M251.68 476.866V437.72C251.68 428.028 253.547 418.434 257.179 409.449C265.66 388.472 283.107 372.408 304.712 365.685L307.263 364.892L336.166 512.742H251.68V476.866Z" fill="#E4A367"/>
<path d="M251.68 476.866V437.72C251.68 428.028 253.547 418.434 257.179 409.449C265.66 388.472 283.107 372.408 304.712 365.685L307.263 364.892L336.166 512.742H251.68V476.866Z" fill="#707070" fill-opacity="0.15"/>
<path d="M251.68 476.866V437.72C251.68 428.028 253.547 418.434 257.179 409.449C265.66 388.472 283.107 372.408 304.712 365.685L307.263 364.892L336.166 512.742H251.68V476.866Z" stroke="#1B1B1B" stroke-width="10"/>
<path d="M228.334 476.866V437.72C228.334 428.028 226.467 418.434 222.834 409.449C214.354 388.472 196.907 372.408 175.302 365.685L172.751 364.892L143.848 512.742H228.334V476.866Z" fill="#E4A367"/>
<path d="M228.334 476.866V437.72C228.334 428.028 226.467 418.434 222.834 409.449C214.354 388.472 196.907 372.408 175.302 365.685L172.751 364.892L143.848 512.742H228.334V476.866Z" fill="#707070" fill-opacity="0.15"/>
<path d="M228.334 476.866V437.72C228.334 428.028 226.467 418.434 222.834 409.449C214.354 388.472 196.907 372.408 175.302 365.685L172.751 364.892L143.848 512.742H228.334V476.866Z" stroke="#1B1B1B" stroke-width="10"/>
<path d="M334.588 512.744H146.524C145.259 512.744 144.311 511.583 144.565 510.343L243.05 28.5156L336.552 510.363C336.791 511.597 335.846 512.744 334.588 512.744Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter1_i_184_2166)">
<ellipse cx="400.287" cy="250.901" rx="63.2692" ry="58.8842" fill="#F3AA77"/>
</g>
<path d="M400.287 197.017C432.812 197.017 458.555 221.473 458.556 250.9C458.556 280.328 432.812 304.785 400.287 304.785C367.762 304.785 342.018 280.328 342.018 250.9C342.018 221.473 367.762 197.017 400.287 197.017Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter2_i_184_2166)">
<ellipse cx="63.2692" cy="250.901" rx="63.2692" ry="58.8842" fill="#F3AA77"/>
</g>
<path d="M63.2695 197.017C95.7947 197.017 121.538 221.473 121.538 250.9C121.538 280.328 95.7948 304.785 63.2695 304.785C30.7441 304.785 5 280.328 5 250.9C5.00022 221.473 30.7442 197.017 63.2695 197.017Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M156.862 107.108L145.241 102.307C144.805 102.128 144.395 102.611 144.643 103.012C149.68 111.126 157 117.574 165.685 121.546L171.227 124.08L180.759 129.622C201.207 141.511 223.64 149.596 246.971 153.484L252.35 154.163C267.347 156.053 282.534 155.825 297.467 153.484L306.105 150.915C318.581 147.204 329.863 140.28 338.819 130.835L340.204 129.375C343.538 125.859 346.421 121.94 348.784 117.709L351.806 112.3C354.671 107.17 356.176 101.392 356.176 95.516V93.6193C356.176 90.9454 355.718 88.2913 354.822 85.772C353.515 82.0953 351.309 78.8036 348.406 76.1959L348.272 76.0756C344.7 72.8665 340.251 70.7963 335.495 70.13L333.6 69.8645C330.419 69.4189 327.188 69.4802 324.026 70.0462L322.671 70.2888C319.468 70.8621 316.349 71.8338 313.387 73.1811L307.505 75.8569L281.04 89.5789L249.404 104.477L232.37 110.75L230.578 111.245C220.462 114.039 210.015 115.455 199.521 115.455H198.929C192.237 115.455 185.559 114.845 178.978 113.633C171.398 112.238 163.985 110.051 156.862 107.108Z" fill="#241F21"/>
<g filter="url(#filter3_i_184_2166)">
<ellipse cx="233.03" cy="204.544" rx="194.192" ry="181.664" fill="#F3AA77"/>
</g>
<path d="M233.03 27.8799C337.838 27.8799 422.223 107.284 422.223 204.544C422.223 301.804 337.838 381.208 233.03 381.208C128.223 381.208 43.838 301.804 43.8379 204.544C43.8379 107.284 128.223 27.8799 233.03 27.8799Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M317.402 152.395L212.542 212.314C210.66 213.39 208.607 211.099 209.879 209.343C215.902 201.026 225.045 188.091 228.644 181.368C232.189 174.745 235.806 165.344 238.107 158.96C238.868 156.851 236.442 155.135 234.676 156.515C185.265 195.153 122.065 211.617 60.0825 201.999L48.2328 200.16C46.9968 193.569 47.307 186.78 49.139 180.328L55.1947 159.001C58.8857 146.003 64.471 133.619 71.7708 122.248L81.5408 107.029C89.3598 94.8494 98.9603 83.9106 110.022 74.577C125.455 61.5558 143.439 51.9053 162.822 46.245L175.65 42.4988C194.596 36.9659 214.233 34.1572 233.97 34.1572H240.64C262.129 34.1572 283.487 37.9167 303.689 45.2425C321.192 51.59 337.663 60.5625 352.483 71.8339L354.261 73.1862C367.745 83.4418 379.616 95.6601 389.479 109.434C403.618 129.179 413.35 151.73 418.018 175.562L422.836 200.16L414.641 200.98C377.362 204.708 341.127 187.286 320.759 155.841L318.737 152.719C318.449 152.274 317.862 152.132 317.402 152.395Z" fill="#242328" stroke="#1A1A1A" stroke-width="10"/>
<path d="M400.544 209.262H265.024L268.702 233.003C270.745 246.188 278.347 257.862 289.58 265.062C294.057 267.932 298.993 270.014 304.174 271.216L317.59 274.331C317.59 274.331 336.156 276.425 345.248 274.276C358.605 271.118 370.496 263.522 378.977 252.729L380.872 250.316C384.642 245.519 387.762 240.246 390.153 234.633L400.796 209.644C400.873 209.463 400.74 209.262 400.544 209.262Z" fill="url(#paint0_linear_184_2166)"/>
<path d="M70.5782 209.557H210.955C211.033 209.557 211.089 209.631 211.069 209.706L204.396 234.642C201.058 247.118 193.18 257.897 182.307 264.867C177.323 268.062 171.829 270.379 166.063 271.717L153.532 274.626C144.431 276.739 134.966 276.72 125.874 274.571C112.516 271.414 100.625 263.817 92.1452 253.025L90.2493 250.612C86.48 245.814 83.3597 240.541 80.969 234.928L70.3256 209.939C70.2485 209.758 70.3814 209.557 70.5782 209.557Z" fill="url(#paint1_linear_184_2166)"/>
<path d="M208.885 209.262L240.013 209.939L265.024 209.262H400.544C400.74 209.262 400.873 209.463 400.796 209.644L390.153 234.633C387.762 240.246 384.642 245.519 380.872 250.316L378.977 252.729C370.496 263.522 358.605 271.118 345.248 274.276C336.156 276.425 317.59 274.331 317.59 274.331L304.174 271.216C298.993 270.014 294.057 267.932 289.58 265.062C278.347 257.862 270.745 246.188 268.702 233.003L265.024 209.262M400.796 209.644L428.439 200.369M70.3256 209.939L80.969 234.928C83.3597 240.541 86.48 245.814 90.2493 250.612L92.1452 253.025C100.625 263.817 112.516 271.414 125.874 274.571C134.966 276.72 144.431 276.739 153.532 274.626L166.063 271.717C171.829 270.379 177.323 268.062 182.307 264.867C193.18 257.897 201.058 247.118 204.396 234.642L211.069 209.706C211.089 209.631 211.033 209.557 210.955 209.557H70.5782C70.3814 209.557 70.2485 209.758 70.3256 209.939ZM70.3256 209.939L39.3594 198.146" stroke="#1C1C1C" stroke-width="10"/>
<path d="M270.799 352.678L257.403 355.111C237.068 358.804 216.767 348.481 207.773 329.873L266.012 319.166L322.311 308.815C315.629 329.679 298.664 345.624 277.426 351L270.799 352.678Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter4_d_184_2166)">
<path d="M76.6108 154.154L52.5464 153.995C49.2832 154.074 46.8541 151.004 47.6831 147.847L52.4375 129.739C58.5783 106.352 69.8635 84.631 85.4695 66.1613C109.076 38.2229 141.422 19.0706 177.27 11.8055L190.938 9.03534C219.435 3.26014 248.84 3.68837 277.156 10.2909L284.935 12.1047C315.599 19.2548 343.81 34.4322 366.675 56.0803C392.902 80.9119 410.931 113.152 418.355 148.498L418.623 149.773C419.098 152.031 417.374 154.154 415.067 154.154H388.515H232.563H76.6108Z" fill="url(#paint2_linear_184_2166)"/>
<path d="M76.6108 154.154L52.5464 153.995C49.2832 154.074 46.8541 151.004 47.6831 147.847L52.4375 129.739C58.5783 106.352 69.8635 84.631 85.4695 66.1613C109.076 38.2229 141.422 19.0706 177.27 11.8055L190.938 9.03534C219.435 3.26014 248.84 3.68837 277.156 10.2909L284.935 12.1047C315.599 19.2548 343.81 34.4322 366.675 56.0803C392.902 80.9119 410.931 113.152 418.355 148.498L418.623 149.773C419.098 152.031 417.374 154.154 415.067 154.154H388.515H232.563H76.6108Z" fill="#707070" fill-opacity="0.15"/>
<path d="M87.7295 199.009L76.6108 154.154H232.563H388.515L379.571 195.85C376.408 210.594 365.329 222.367 350.804 226.419C344.72 228.116 338.323 228.369 332.124 227.158L282.971 217.554C252.344 211.57 220.873 211.325 190.156 216.831L131.448 227.354C119.625 229.474 107.822 223.246 99.0514 215.04C93.9359 210.254 89.0927 204.508 87.7295 199.009Z" fill="url(#paint3_linear_184_2166)"/>
<path d="M87.7295 199.009L76.6108 154.154H232.563H388.515L379.571 195.85C376.408 210.594 365.329 222.367 350.804 226.419C344.72 228.116 338.323 228.369 332.124 227.158L282.971 217.554C252.344 211.57 220.873 211.325 190.156 216.831L131.448 227.354C119.625 229.474 107.822 223.246 99.0514 215.04C93.9359 210.254 89.0927 204.508 87.7295 199.009Z" fill="#707070" fill-opacity="0.15"/>
<path d="M76.6108 154.154L52.5464 153.995C49.2832 154.074 46.8541 151.004 47.6831 147.847L52.4375 129.739C58.5783 106.352 69.8635 84.631 85.4695 66.1613C109.076 38.2229 141.422 19.0706 177.27 11.8055L190.938 9.03534C219.435 3.26014 248.84 3.68837 277.156 10.2909L284.935 12.1047C315.599 19.2548 343.81 34.4322 366.675 56.0803C392.902 80.9119 410.931 113.152 418.355 148.498L418.623 149.773C419.098 152.031 417.374 154.154 415.067 154.154H388.515M76.6108 154.154L87.7295 199.009C89.0927 204.508 93.9359 210.254 99.0514 215.04C107.822 223.246 119.625 229.474 131.448 227.354L190.156 216.831C220.873 211.325 252.344 211.57 282.971 217.554L332.124 227.158C338.323 228.369 344.72 228.116 350.804 226.419C365.329 222.367 376.408 210.594 379.571 195.85L388.515 154.154M76.6108 154.154H232.563H388.515" stroke="#1A1A1A" stroke-width="10"/>
</g>
<defs>
<filter id="filter0_i_184_2166" x="139.521" y="27.5142" width="202.068" height="492.23" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2166"/>
</filter>
<filter id="filter1_i_184_2166" x="337.018" y="192.017" width="126.539" height="119.769" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2166"/>
</filter>
<filter id="filter2_i_184_2166" x="0" y="192.017" width="126.539" height="119.769" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2166"/>
</filter>
<filter id="filter3_i_184_2166" x="38.8379" y="22.8799" width="388.385" height="365.328" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2166"/>
</filter>
<filter id="filter4_d_184_2166" x="37.5176" y="0" width="391.186" height="277.911" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="40"/>
<feGaussianBlur stdDeviation="2.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_184_2166"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_184_2166" result="shape"/>
</filter>
<linearGradient id="paint0_linear_184_2166" x1="39.3594" y1="198.146" x2="428.439" y2="275.961" gradientUnits="userSpaceOnUse">
<stop offset="0.118343" stop-color="#181818"/>
<stop offset="0.295437" stop-color="#464646"/>
<stop offset="0.410027" stop-color="#181818"/>
<stop offset="0.58712" stop-color="#181818"/>
<stop offset="0.753797" stop-color="#464646"/>
<stop offset="0.884013" stop-color="#181818"/>
</linearGradient>
<linearGradient id="paint1_linear_184_2166" x1="39.3594" y1="198.146" x2="428.439" y2="275.961" gradientUnits="userSpaceOnUse">
<stop offset="0.118343" stop-color="#181818"/>
<stop offset="0.295437" stop-color="#464646"/>
<stop offset="0.410027" stop-color="#181818"/>
<stop offset="0.58712" stop-color="#181818"/>
<stop offset="0.753797" stop-color="#464646"/>
<stop offset="0.884013" stop-color="#181818"/>
</linearGradient>
<linearGradient id="paint2_linear_184_2166" x1="233.111" y1="5" x2="233.111" y2="227.952" gradientUnits="userSpaceOnUse">
<stop stop-color="#E4A367"/>
<stop offset="0.581912" stop-color="#E4A367"/>
<stop offset="1" stop-color="#E4A367"/>
</linearGradient>
<linearGradient id="paint3_linear_184_2166" x1="233.111" y1="5" x2="233.111" y2="227.952" gradientUnits="userSpaceOnUse">
<stop stop-color="#E4A367"/>
<stop offset="0.581912" stop-color="#E4A367"/>
<stop offset="1" stop-color="#E4A367"/>
</linearGradient>
</defs>
</svg>
    </div>
    <div class="m-fig" data-m="tall">
<svg width="507" height="648" viewBox="0 0 507 648" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<path d="M335.825 509.289H147.048C145.782 509.289 144.835 508.129 145.088 506.889L243.939 23.2705L337.789 506.908C338.028 508.143 337.083 509.289 335.825 509.289Z" fill="#4DB4ED" stroke="#1A1A1A" stroke-width="10"/>
<path d="M254.003 416.23C254.003 422.48 247.679 427.547 241.428 427.547C235.178 427.547 228.854 422.48 228.854 416.23C228.854 409.98 235.178 404.913 241.428 404.913C247.679 404.913 254.003 409.98 254.003 416.23Z" fill="#3291C5"/>
<path d="M254.003 456.475C254.003 462.725 247.679 467.792 241.428 467.792C235.178 467.792 228.854 462.725 228.854 456.475C228.854 450.224 235.178 445.157 241.428 445.157C247.679 445.157 254.003 450.224 254.003 456.475Z" fill="#3291C5"/>
<g filter="url(#filter0_i_184_2262)">
<path d="M335.825 509.289H147.048C145.782 509.289 144.835 508.129 145.088 506.889L243.939 23.2705L337.789 506.908C338.028 508.143 337.083 509.289 335.825 509.289Z" fill="#8AC7FF"/>
<path d="M335.825 509.289H147.048C145.782 509.289 144.835 508.129 145.088 506.889L243.939 23.2705L337.789 506.908C338.028 508.143 337.083 509.289 335.825 509.289Z" fill="#707070" fill-opacity="0.05"/>
</g>
<path d="M335.825 509.289H147.048C145.782 509.289 144.835 508.129 145.088 506.889L243.939 23.2705L337.789 506.908C338.028 508.143 337.083 509.289 335.825 509.289Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M254.003 416.23C254.003 422.48 247.679 427.547 241.428 427.547C235.178 427.547 228.854 422.48 228.854 416.23C228.854 409.98 235.178 404.913 241.428 404.913C247.679 404.913 254.003 409.98 254.003 416.23Z" fill="#389ACF"/>
<path d="M254.003 456.475C254.003 462.725 247.679 467.792 241.428 467.792C235.178 467.792 228.854 462.725 228.854 456.475C228.854 450.224 235.178 445.157 241.428 445.157C247.679 445.157 254.003 450.224 254.003 456.475Z" fill="#389ACF"/>
<g filter="url(#filter1_i_184_2262)">
<ellipse cx="401.767" cy="246.478" rx="63.5031" ry="59.1019" fill="#F3AA77"/>
</g>
<path d="M401.767 192.376C434.421 192.376 460.269 216.931 460.27 246.478C460.27 276.026 434.421 300.581 401.767 300.581C369.112 300.58 343.264 276.025 343.264 246.478C343.264 216.931 369.112 192.377 401.767 192.376Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter2_i_184_2262)">
<ellipse cx="63.5031" cy="246.478" rx="63.5031" ry="59.1019" fill="#F3AA77"/>
</g>
<path d="M63.5029 192.376C96.1575 192.376 122.006 216.931 122.006 246.478C122.006 276.026 96.1576 300.581 63.5029 300.581C30.8483 300.58 5 276.025 5 246.478C5.00018 216.931 30.8485 192.377 63.5029 192.376Z" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter3_i_184_2262)">
<ellipse cx="233.887" cy="199.949" rx="194.91" ry="182.336" fill="#F3AA77"/>
</g>
<path d="M233.887 22.6133C339.091 22.6133 423.798 102.318 423.798 199.949C423.798 297.58 339.091 377.284 233.887 377.284C128.683 377.284 43.9768 297.58 43.9766 199.949C43.9766 102.318 128.683 22.6134 233.887 22.6133Z" stroke="#1A1A1A" stroke-width="10"/>
<path d="M318.579 147.606L213.298 207.767C211.416 208.842 209.363 206.551 210.635 204.795C216.68 196.448 225.873 183.443 229.49 176.688C233.048 170.041 236.679 160.605 238.988 154.197C239.751 152.08 237.317 150.358 235.544 151.744C185.95 190.524 122.517 207.049 60.3052 197.396L48.4116 195.55C47.1711 188.934 47.4824 182.12 49.3212 175.644L55.3993 154.239C59.1039 141.192 64.7098 128.762 72.0367 117.349L81.8427 102.074C89.6907 89.8497 99.3266 78.8704 110.429 69.5024C125.919 56.433 143.97 46.7468 163.424 41.0655L176.3 37.3055C195.316 31.7522 215.025 28.9331 234.835 28.9331H241.53C263.098 28.9331 284.536 32.7065 304.812 40.0594C322.38 46.4303 338.912 55.436 353.787 66.749L355.571 68.1063C369.105 78.3998 381.02 90.6634 390.92 104.488L396.094 111.715C406.875 126.77 414.296 143.966 417.856 162.139L422.016 183.376C423.579 191.356 423.05 199.605 420.48 207.32L404.756 206.15C373.561 203.829 345.25 187.045 328.244 160.791L319.914 147.931C319.626 147.485 319.04 147.343 318.579 147.606Z" fill="url(#paint0_linear_184_2262)" stroke="#1A1A1A" stroke-width="10"/>
<foreignObject x="-29.4375" y="104.983" width="527.291" height="266.886"><div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(50px);clip-path:url(#bgblur_0_184_2262_clip_path);height:100%;width:100%"></div></foreignObject><g data-figma-bg-blur-radius="100">
<path d="M397.578 204.983H261.674C261.613 204.983 261.566 205.038 261.575 205.098L265.249 228.811C267.299 242.045 274.93 253.762 286.204 260.989C290.698 263.87 295.652 265.959 300.852 267.166L314.318 270.292C323.452 272.413 332.952 272.394 342.077 270.237C355.485 267.068 367.42 259.444 375.931 248.611L377.834 246.189C381.617 241.374 384.749 236.081 387.149 230.448L397.831 205.366C397.909 205.185 397.775 204.983 397.578 204.983Z" fill="white"/>
<path d="M70.8389 204.983H211.735C211.813 204.983 211.87 205.057 211.849 205.133L205.152 230.16C201.801 242.682 193.894 253.501 182.981 260.497C177.979 263.703 172.464 266.029 166.676 267.373L154.099 270.292C144.965 272.413 135.465 272.394 126.339 270.237C112.932 267.068 100.997 259.444 92.4857 248.611L90.5827 246.189C86.7996 241.374 83.6677 236.081 81.2682 230.448L70.5855 205.366C70.508 205.185 70.6414 204.983 70.8389 204.983Z" fill="white"/>
</g>
<foreignObject x="19.1367" y="168.38" width="427.93" height="128.488"><div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(10px);clip-path:url(#bgblur_1_184_2262_clip_path);height:100%;width:100%"></div></foreignObject><g data-figma-bg-blur-radius="20">
<path d="M397.579 204.982H261.675C261.614 204.982 261.567 205.037 261.576 205.097L265.25 228.811C267.3 242.044 274.931 253.762 286.205 260.989C290.699 263.869 295.653 265.958 300.853 267.166L314.319 270.292C323.453 272.412 332.953 272.393 342.079 270.236C355.486 267.067 367.421 259.443 375.932 248.61L377.835 246.188C381.618 241.373 384.75 236.081 387.15 230.447L397.832 205.366C397.91 205.184 397.776 204.982 397.579 204.982Z" fill="url(#paint1_linear_184_2262)" fill-opacity="0.8"/>
<path d="M70.84 204.982H211.736C211.814 204.982 211.871 205.056 211.85 205.132L205.153 230.16C201.802 242.682 193.895 253.501 182.982 260.496C177.98 263.703 172.465 266.028 166.677 267.372L154.1 270.292C144.966 272.412 135.466 272.393 126.34 270.236C112.933 267.067 100.998 259.443 92.4867 248.61L90.5838 246.188C86.8006 241.373 83.6688 236.081 81.2693 230.447L70.5865 205.366C70.5091 205.184 70.6425 204.982 70.84 204.982Z" fill="url(#paint2_linear_184_2262)" fill-opacity="0.8"/>
<path d="M261.576 205.097L265.25 228.811C267.3 242.044 274.931 253.762 286.205 260.989C290.699 263.869 295.653 265.958 300.853 267.166L314.319 270.292C323.453 272.412 332.953 272.393 342.079 270.236C355.486 267.067 367.421 259.443 375.932 248.61L377.835 246.188C381.618 241.373 384.75 236.081 387.15 230.447L397.832 205.366C397.91 205.184 397.776 204.982 397.579 204.982H261.675C261.614 204.982 261.567 205.037 261.576 205.097ZM397.579 204.982L425.068 192.991M261.576 205.097L211.736 204.982M70.5865 205.366L81.2693 230.447C83.6688 236.081 86.8006 241.373 90.5838 246.188L92.4867 248.61C100.998 259.443 112.933 267.067 126.34 270.236C135.466 272.393 144.966 272.412 154.1 270.292L166.677 267.372C172.465 266.028 177.98 263.703 182.982 260.496C193.895 253.501 201.802 242.682 205.153 230.16L211.85 205.132C211.871 205.056 211.814 204.982 211.736 204.982H70.84C70.6425 204.982 70.5091 205.184 70.5865 205.366ZM70.5865 205.366L41.0703 192.991" stroke="#1A1A1A" stroke-width="10"/>
</g>
<path d="M243.5 353.999L217.933 354.513C199.18 354.89 183.775 339.791 183.775 321.035L241.703 321.035L294.493 321.036C294.493 338.557 280.564 352.904 263.05 353.422L243.5 353.999Z" fill="white" stroke="#1A1A1A" stroke-width="10"/>
<g filter="url(#filter6_f_184_2262)">
<path d="M105 63.5L482.5 180L386 323L172.886 623.982L34 386.5L105 63.5Z" fill="url(#paint3_linear_184_2262)" fill-opacity="0.7"/>
</g>
<g filter="url(#filter7_f_184_2262)">
<path d="M41.3055 499.174C41.3331 496.959 43.1598 495.19 45.3747 495.234L243.384 499.166C245.306 499.204 246.838 500.786 246.814 502.708L246.765 506.653C246.744 508.34 245.36 509.69 243.673 509.669L44.7824 507.198C42.8074 507.174 41.2263 505.553 41.2508 503.578L41.3055 499.174Z" fill="black" fill-opacity="0.6"/>
</g>
<g filter="url(#filter8_ii_184_2262)">
<path d="M33.2665 392.731C32.9274 386.986 37.4946 382.141 43.2491 382.141L233.144 382.142C238.495 382.142 242.897 386.353 243.134 391.699L245.507 445.254L246.703 503.836C246.761 506.671 244.452 508.987 241.616 508.937L44.5478 505.479C41.935 505.433 39.7982 503.383 39.6442 500.775L33.2665 392.731Z" fill="#E8E8E8" fill-opacity="0.8"/>
<path d="M33.2665 392.731C32.9274 386.986 37.4946 382.141 43.2491 382.141L233.144 382.142C238.495 382.142 242.897 386.353 243.134 391.699L245.507 445.254L246.703 503.836C246.761 506.671 244.452 508.987 241.616 508.937L44.5478 505.479C41.935 505.433 39.7982 503.383 39.6442 500.775L33.2665 392.731Z" fill="url(#paint4_linear_184_2262)"/>
<path d="M33.3547 400.583C32.9857 394.67 32.8012 391.714 33.8379 389.439C34.749 387.44 36.2932 385.797 38.2318 384.763C40.4377 383.586 43.3997 383.586 49.3237 383.586L226.035 383.587C231.341 383.587 233.995 383.587 236.069 384.598C237.894 385.487 239.405 386.912 240.402 388.681C241.534 390.691 241.691 393.34 242.006 398.637L248.001 499.412C248.178 502.394 248.267 503.885 247.739 505.026C247.275 506.029 246.492 506.85 245.512 507.361C244.397 507.942 242.903 507.923 239.916 507.886L47.3188 505.494C44.7024 505.461 43.3941 505.445 42.3721 504.937C41.4723 504.49 40.728 503.782 40.2365 502.905C39.6782 501.91 39.5967 500.604 39.4337 497.992L33.3547 400.583Z" fill="url(#paint5_linear_184_2262)"/>
<path d="M165.905 459.304L165.911 458.796C165.917 458.276 165.69 457.782 165.292 457.448L165.204 457.375C165.004 457.207 164.759 457.101 164.5 457.07C163.34 456.931 162.167 456.944 161.01 457.108L158.768 457.426L154.139 458.673L148.867 460.373C145.05 461.141 141.162 461.505 137.268 461.456L135.887 461.439L135.733 461.423C131.923 461.028 128.152 460.318 124.458 459.302L122.989 458.703C121.122 457.943 119.325 457.023 117.616 455.954L117.227 455.711C117.036 455.592 117.123 455.297 117.348 455.299L119.331 455.784L123.142 456.369L127.037 456.648L130.866 456.507C131.441 456.486 132.01 456.384 132.556 456.204C132.619 456.183 132.607 456.089 132.541 456.085L131.739 456.031C130.633 455.956 129.545 455.705 128.518 455.286L128.364 455.223C128.082 455.108 127.841 454.912 127.671 454.66C127.644 454.62 127.661 454.565 127.705 454.547L128.994 454.004C129.346 453.856 129.306 453.345 128.935 453.254L127.974 453.018C126.537 452.665 125.132 452.197 123.771 451.618L123.527 451.514C122.207 450.952 120.938 450.275 119.736 449.491L118.817 448.89C118.487 448.675 118.239 448.354 118.115 447.98C118.097 447.923 118.139 447.865 118.199 447.865L120.848 447.898C121.33 447.904 121.808 447.821 122.259 447.654C122.295 447.64 122.293 447.589 122.256 447.579L120.024 447C119.116 446.764 118.26 446.358 117.504 445.803C116.853 445.325 116.284 444.744 115.82 444.083L115.543 443.688L114.888 442.753C114.679 442.455 114.569 442.099 114.573 441.735C114.574 441.673 114.638 441.632 114.695 441.657L116.553 442.473L118.349 443.089C119.311 443.419 120.319 443.594 121.335 443.606C121.446 443.608 121.47 443.451 121.363 443.419L121.048 443.326C120.434 443.145 119.84 442.906 119.272 442.612L119.01 442.477C118.439 442.182 117.906 441.815 117.426 441.387C116.862 440.886 116.375 440.304 115.981 439.661L115.545 438.952C114.785 437.712 114.282 436.332 114.067 434.894C114.053 434.795 114.167 434.731 114.243 434.795L115.419 435.774C116.482 436.66 117.635 437.429 118.861 438.069L119.002 438.143C119.182 438.237 119.349 437.998 119.2 437.861C117.765 436.549 116.562 435.004 115.64 433.292L115.118 432.324C114.427 431.04 113.881 429.684 113.491 428.279L112.969 426.397C112.902 426.155 112.974 425.895 113.157 425.722C113.171 425.71 113.192 425.71 113.205 425.723L116.245 428.808L120.653 432.623L121.963 433.476C122.772 434.002 123.62 434.465 124.5 434.86C124.623 434.915 124.762 434.826 124.764 434.692L124.769 434.286L124.574 428.208C124.552 427.523 124.778 426.853 125.212 426.323C125.276 426.245 125.4 426.257 125.447 426.346L126.124 427.626L128.149 431.181L130.331 434.816L130.428 434.951C132.029 437.18 133.807 439.276 135.745 441.219C137.677 443.156 139.724 444.997 142.076 446.392C142.418 446.595 142.754 446.785 143.068 446.946C144.528 447.701 146.945 448.606 146.945 448.606L150.037 449.489L152.1 449.898C153.527 450.12 154.969 450.241 156.413 450.259L161.657 450.324C161.74 450.325 161.813 450.268 161.831 450.187L162.092 449.001C162.118 448.881 162.225 448.796 162.348 448.798C162.673 448.802 162.984 448.927 163.221 449.149L163.714 449.613C165.227 451.034 166.498 452.693 167.478 454.523L167.52 454.602C167.797 455.119 167.938 455.698 167.931 456.285L167.93 456.341C167.925 456.727 167.85 457.11 167.708 457.469C167.473 458.06 167.067 458.567 166.54 458.924L165.947 459.327C165.929 459.339 165.904 459.326 165.905 459.304Z" fill="url(#paint6_linear_184_2262)"/>
<path d="M149.08 443.638L146.489 446.015C146.228 446.255 146.349 446.69 146.697 446.76C149.361 447.3 152.069 447.589 154.787 447.623L155.394 447.631C156.719 447.494 158.031 447.247 159.315 446.892L159.78 446.764L160.362 446.519C161.621 445.989 162.798 445.284 163.859 444.425L164.401 443.987C165.271 443.283 166.02 442.441 166.618 441.495C167.042 440.825 167.387 440.108 167.646 439.359L167.917 438.576L168.06 438.087C168.351 437.092 168.505 436.063 168.518 435.026C168.519 434.915 168.377 434.868 168.312 434.958L167.632 435.887L167.589 435.946C167.031 436.708 166.311 437.337 165.481 437.788C165.42 437.82 165.358 437.748 165.399 437.693L165.436 437.645C165.829 437.127 166.156 436.56 166.407 435.96L166.603 435.49C166.879 434.524 167.052 433.532 167.12 432.529L167.187 431.523C167.205 431.258 167.185 430.991 167.129 430.731C167.103 430.613 166.95 430.579 166.877 430.676L166.659 430.963L165.204 432.641C164.509 433.442 163.708 434.143 162.822 434.726C162.731 434.785 162.616 434.699 162.648 434.595L162.884 433.832C163.215 432.714 163.418 431.562 163.489 430.399L163.583 428.852L163.509 426.915C163.498 426.618 163.093 426.541 162.973 426.813L162.716 427.396C162.07 428.859 161.267 430.248 160.321 431.538C159.598 432.524 158.795 433.448 157.92 434.302L157.385 434.823C157.21 434.994 156.914 434.904 156.864 434.664L156.379 432.37L156.065 431.193C155.949 430.758 155.328 430.767 155.226 431.206L154.677 433.557C154.354 434.944 153.886 436.293 153.28 437.582C152.529 439.182 151.571 440.677 150.433 442.03L149.08 443.638Z" fill="url(#paint7_linear_184_2262)"/>
<path d="M164.074 453.565L164.083 452.789C164.083 452.77 164.108 452.762 164.119 452.778L166.081 455.542C166.095 455.562 166.079 455.59 166.055 455.588L165.462 455.536C165.217 455.515 164.985 455.413 164.803 455.247C164.331 454.816 164.066 454.204 164.074 453.565Z" fill="#41403F"/>
</g>
<g filter="url(#filter9_d_184_2262)">
<path d="M79.9552 150.728L56.3232 150.572C53.1187 150.65 50.7333 147.65 51.5474 144.565L56.2163 126.874C62.2467 104.024 73.3291 82.8017 88.6546 64.7563C111.837 37.4597 143.602 18.7474 178.805 11.6492L192.228 8.94264C220.212 3.30011 249.089 3.7185 276.896 10.1694L284.535 11.9415C314.648 18.9274 342.352 33.7561 364.806 54.9069C390.561 79.168 408.266 110.668 415.558 145.202L415.821 146.447C416.286 148.654 414.594 150.728 412.328 150.728H386.253H233.104H79.9552Z" fill="url(#paint8_linear_184_2262)"/>
<path d="M79.9552 150.728L56.3232 150.572C53.1187 150.65 50.7333 147.65 51.5474 144.565L56.2163 126.874C62.2467 104.024 73.3291 82.8017 88.6546 64.7563C111.837 37.4597 143.602 18.7474 178.805 11.6492L192.228 8.94264C220.212 3.30011 249.089 3.7185 276.896 10.1694L284.535 11.9415C314.648 18.9274 342.352 33.7561 364.806 54.9069C390.561 79.168 408.266 110.668 415.558 145.202L415.821 146.447C416.286 148.654 414.594 150.728 412.328 150.728H386.253H233.104H79.9552Z" fill="#707070" fill-opacity="0.05"/>
<path d="M90.874 194.552L79.9552 150.728H233.104H386.253L377.47 191.466C374.364 205.871 363.484 217.374 349.221 221.332C343.246 222.99 336.964 223.238 330.876 222.054L282.607 212.671C252.53 206.825 221.624 206.585 191.46 211.965L133.806 222.246C122.194 224.317 110.598 218.233 101.968 210.192C96.9534 205.52 92.2105 199.917 90.874 194.552Z" fill="url(#paint9_linear_184_2262)"/>
<path d="M90.874 194.552L79.9552 150.728H233.104H386.253L377.47 191.466C374.364 205.871 363.484 217.374 349.221 221.332C343.246 222.99 336.964 223.238 330.876 222.054L282.607 212.671C252.53 206.825 221.624 206.585 191.46 211.965L133.806 222.246C122.194 224.317 110.598 218.233 101.968 210.192C96.9534 205.52 92.2105 199.917 90.874 194.552Z" fill="#707070" fill-opacity="0.05"/>
<path d="M79.9552 150.728L56.3232 150.572C53.1187 150.65 50.7333 147.65 51.5474 144.565L56.2163 126.874C62.2467 104.024 73.3291 82.8017 88.6546 64.7563C111.837 37.4597 143.602 18.7474 178.805 11.6492L192.228 8.94264C220.212 3.30011 249.089 3.7185 276.896 10.1694L284.535 11.9415C314.648 18.9274 342.352 33.7561 364.806 54.9069C390.561 79.168 408.266 110.668 415.558 145.202L415.821 146.447C416.286 148.654 414.594 150.728 412.328 150.728H386.253M79.9552 150.728L90.874 194.552C92.2105 199.917 96.9534 205.52 101.968 210.192C110.598 218.233 122.194 224.317 133.806 222.246L191.46 211.965C221.624 206.585 252.53 206.825 282.607 212.671L330.876 222.054C336.964 223.238 343.246 222.99 349.221 221.332C363.484 217.374 374.364 205.871 377.47 191.466L386.253 150.728M79.9552 150.728H233.104H386.253" stroke="url(#paint10_linear_184_2262)" stroke-width="10"/>
</g>
<defs>
<filter id="filter0_i_184_2262" x="140.045" y="22.269" width="202.783" height="494.02" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2262"/>
</filter>
<filter id="filter1_i_184_2262" x="338.264" y="187.376" width="127.006" height="120.204" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2262"/>
</filter>
<filter id="filter2_i_184_2262" x="0" y="187.376" width="127.006" height="120.204" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2262"/>
</filter>
<filter id="filter3_i_184_2262" x="38.9766" y="17.6133" width="389.82" height="366.671" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2262"/>
</filter>
<clipPath id="bgblur_0_184_2262_clip_path" transform="translate(29.4375 -104.983)"><path d="M397.578 204.983H261.674C261.613 204.983 261.566 205.038 261.575 205.098L265.249 228.811C267.299 242.045 274.93 253.762 286.204 260.989C290.698 263.87 295.652 265.959 300.852 267.166L314.318 270.292C323.452 272.413 332.952 272.394 342.077 270.237C355.485 267.068 367.42 259.444 375.931 248.611L377.834 246.189C381.617 241.374 384.749 236.081 387.149 230.448L397.831 205.366C397.909 205.185 397.775 204.983 397.578 204.983Z"/>
<path d="M70.8389 204.983H211.735C211.813 204.983 211.87 205.057 211.849 205.133L205.152 230.16C201.801 242.682 193.894 253.501 182.981 260.497C177.979 263.703 172.464 266.029 166.676 267.373L154.099 270.292C144.965 272.413 135.465 272.394 126.339 270.237C112.932 267.068 100.997 259.444 92.4857 248.611L90.5827 246.189C86.7996 241.374 83.6677 236.081 81.2682 230.448L70.5855 205.366C70.508 205.185 70.6414 204.983 70.8389 204.983Z"/>
</clipPath><clipPath id="bgblur_1_184_2262_clip_path" transform="translate(-19.1367 -168.38)"><path d="M397.579 204.982H261.675C261.614 204.982 261.567 205.037 261.576 205.097L265.25 228.811C267.3 242.044 274.931 253.762 286.205 260.989C290.699 263.869 295.653 265.958 300.853 267.166L314.319 270.292C323.453 272.412 332.953 272.393 342.079 270.236C355.486 267.067 367.421 259.443 375.932 248.61L377.835 246.188C381.618 241.373 384.75 236.081 387.15 230.447L397.832 205.366C397.91 205.184 397.776 204.982 397.579 204.982Z"/>
<path d="M70.84 204.982H211.736C211.814 204.982 211.871 205.056 211.85 205.132L205.153 230.16C201.802 242.682 193.895 253.501 182.982 260.496C177.98 263.703 172.465 266.028 166.677 267.372L154.1 270.292C144.966 272.412 135.466 272.393 126.34 270.236C112.933 267.067 100.998 259.443 92.4867 248.61L90.5838 246.188C86.8006 241.373 83.6688 236.081 81.2693 230.447L70.5865 205.366C70.5091 205.184 70.6425 204.982 70.84 204.982Z"/>
</clipPath><filter id="filter6_f_184_2262" x="10" y="39.5" width="496.5" height="608.482" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="12" result="effect1_foregroundBlur_184_2262"/>
</filter>
<filter id="filter7_f_184_2262" x="35.25" y="489.233" width="217.564" height="26.436" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur_184_2262"/>
</filter>
<filter id="filter8_ii_184_2262" x="23.0625" y="358.142" width="225.076" height="150.796" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-30"/>
<feGaussianBlur stdDeviation="12"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_184_2262"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="-10" dy="-7"/>
<feGaussianBlur stdDeviation="7.5"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.26 0"/>
<feBlend mode="normal" in2="effect1_innerShadow_184_2262" result="effect2_innerShadow_184_2262"/>
</filter>
<filter id="filter9_d_184_2262" x="41.3828" y="0" width="384.518" height="272.79" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="40"/>
<feGaussianBlur stdDeviation="2.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_184_2262"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_184_2262" result="shape"/>
</filter>
<linearGradient id="paint0_linear_184_2262" x1="95.5674" y1="68.5439" x2="425.029" y2="243.963" gradientUnits="userSpaceOnUse">
<stop stop-color="#242328"/>
<stop stop-color="#242328"/>
<stop offset="0.468839" stop-color="#333237"/>
<stop offset="1" stop-color="#242328"/>
</linearGradient>
<linearGradient id="paint1_linear_184_2262" x1="233.069" y1="192.991" x2="202" y2="372.499" gradientUnits="userSpaceOnUse">
<stop stop-color="#8AC7FF"/>
<stop offset="0.649624" stop-color="white"/>
<stop offset="1" stop-color="#8AC7FF"/>
</linearGradient>
<linearGradient id="paint2_linear_184_2262" x1="233.069" y1="192.991" x2="202" y2="372.499" gradientUnits="userSpaceOnUse">
<stop stop-color="#8AC7FF"/>
<stop offset="0.649624" stop-color="white"/>
<stop offset="1" stop-color="#8AC7FF"/>
</linearGradient>
<linearGradient id="paint3_linear_184_2262" x1="405.5" y1="126.5" x2="33.9999" y2="494.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0"/>
<stop offset="0.295437" stop-color="white" stop-opacity="0.11"/>
<stop offset="0.609472" stop-color="white" stop-opacity="0.57"/>
<stop offset="1" stop-color="white"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint4_linear_184_2262" x1="40.6351" y1="380.226" x2="250.084" y2="445.389" gradientUnits="userSpaceOnUse">
<stop stop-color="#656565" stop-opacity="0.8"/>
<stop offset="0.526134" stop-color="#666666" stop-opacity="0.8"/>
<stop offset="0.739202" stop-color="#4D4D4C"/>
<stop offset="1" stop-color="#474645"/>
</linearGradient>
<linearGradient id="paint5_linear_184_2262" x1="41.465" y1="381.053" x2="249.27" y2="445.606" gradientUnits="userSpaceOnUse">
<stop stop-color="#525252"/>
<stop offset="0.526134" stop-color="#51504F"/>
<stop offset="0.66525" stop-color="#474746"/>
<stop offset="0.739202" stop-color="#424241"/>
<stop offset="1" stop-color="#252423"/>
</linearGradient>
<linearGradient id="paint6_linear_184_2262" x1="113.061" y1="425.806" x2="168.261" y2="443.948" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="#C1C1C1"/>
</linearGradient>
<linearGradient id="paint7_linear_184_2262" x1="146.239" y1="425.34" x2="168.352" y2="436.962" gradientUnits="userSpaceOnUse">
<stop stop-color="#8AC7FF"/>
<stop offset="1" stop-color="#638FB7"/>
</linearGradient>
<linearGradient id="paint8_linear_184_2262" x1="233.642" y1="5" x2="233.642" y2="222.831" gradientUnits="userSpaceOnUse">
<stop stop-color="#8AC7FF"/>
<stop offset="0.0001" stop-color="#8AC7FF"/>
<stop offset="0.581912" stop-color="#93CBFF"/>
<stop offset="1" stop-color="#8AC7FF"/>
</linearGradient>
<linearGradient id="paint9_linear_184_2262" x1="233.642" y1="5" x2="233.642" y2="222.831" gradientUnits="userSpaceOnUse">
<stop stop-color="#8AC7FF"/>
<stop offset="0.0001" stop-color="#8AC7FF"/>
<stop offset="0.581912" stop-color="#93CBFF"/>
<stop offset="1" stop-color="#8AC7FF"/>
</linearGradient>
<linearGradient id="paint10_linear_184_2262" x1="233.642" y1="5" x2="163.5" y2="379.5" gradientUnits="userSpaceOnUse">
<stop stop-color="#1A1A1A"/>
<stop offset="0.354249" stop-color="#1A1A1A"/>
<stop offset="0.441279" stop-color="#1A1A1A"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
</defs>
</svg>
    </div>
  </button>
</div>

<div class="expl" id="expl">
  <div class="exp-body" id="expBody" hidden>
    <span class="exp-t">эксперимент</span>
    <div class="exp-row" role="group" aria-label="Палитра">
      <span>палитра</span>
      <button data-pal="ugol" aria-pressed="true">уголь</button>
      <button data-pal="graphite" aria-pressed="false">графит</button>
      <button data-pal="midnight" aria-pressed="false">полночь</button>
    </div>
    <div class="exp-row" role="group" aria-label="Шрифтовая пара">
      <span>шрифты</span>
      <button data-fp="brand" aria-pressed="true">фирменная</button>
      <button data-fp="strict" aria-pressed="false">строгая</button>
    </div>
    <div class="exp-row">
      <span>маскот</span>
      <button id="mToggle" aria-pressed="true">вкл</button>
    </div>
  </div>
  <button class="exp-btn" id="expBtn" aria-expanded="false" aria-label="Панель эксперимента">⚙</button>
</div>

<div class="fly" id="fly" aria-hidden="true"><div class="fly-in" id="flyIn"></div></div>`;
