// Футер (#contact): ссылки, орнамент, копирайт. Названия соцсетей не переводятся.
import { useLang } from "~/lib/i18n";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer id="contact">
      <div className="cathedral" aria-hidden="true" />
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
          {t.footer.copy}
          <span className="mono">{t.footer.motif}</span>
        </div>
      </div>
    </footer>
  );
}
