// Футер (#contact): ссылки, орнамент, копирайт.
export function SiteFooter() {
  return (
    <footer id="contact">
      <div className="fwrap">
        <div className="links">
          <a href="mailto:alexanderkurachakov@gmail.com">email</a>
          <a href="https://github.com/Alexanderadon">github</a>
          <a href="https://www.behance.net/alexanderkurchakov">behance</a>
          <a href="https://www.instagram.com/alexanderkurchakov">instagram</a>
          <a href="https://t.me/AlexanderJob">telegram</a>
        </div>
        <div className="f-orn" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="copy">
          © 2026 Александр Курчаков · Алматы
          <span className="mono">шеберлік · 匠心 · мастерство</span>
        </div>
      </div>
    </footer>
  );
}
