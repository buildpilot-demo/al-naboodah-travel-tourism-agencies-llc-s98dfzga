import { useEffect } from "react";
import { siteConfig } from "../site.config";
import { EnquirySection } from "../components/EnquirySection";
import type { PlainSiteConfig } from "../types/site-config";

// Rendered instead of CinematicHome when this business's category has no
// matching image/frame asset collection (see convex/lib/siteConfig3d.ts's
// resolveAssetCollection in the buildpilot-platform repo). A normal,
// text-only single-page site: a plain hero, a text-only highlights list,
// and the same enquiry section — deliberately no images, stock photography,
// or scroll animation, since none of that exists for this business. Only
// rendered by App.tsx when siteConfig.variant === "plain".
export function PlainHome({ config }: { config: PlainSiteConfig }) {
  useEffect(() => {
    document.title = `${siteConfig.businessName} — ${siteConfig.purpose}`;
  }, []);

  const { hero, highlightsSection, purpose } = config;

  return (
    <div id="top">
      <section className="plain-hero" aria-labelledby="hero-heading">
        <div className="plain-hero__inner">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-heading">{hero.heading}</h1>
          <p className="plain-hero__body">{hero.body}</p>
          {(hero.primaryCta || hero.secondaryCta) && (
            <div className="cta-row">
              {hero.primaryCta && <a className="btn" href={hero.primaryCta.href}>{hero.primaryCta.label}</a>}
              {hero.secondaryCta && <a className="btn btn-secondary" href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>}
            </div>
          )}
          <p className="plain-hero__purpose muted">{purpose}</p>
        </div>
      </section>

      <section id={highlightsSection.id} className="plain-highlights" aria-labelledby="highlights-heading">
        <div className="section-head">
          <p className="eyebrow">{highlightsSection.eyebrow}</p>
          <h2 id="highlights-heading">{highlightsSection.heading}</h2>
          <p className="muted">{highlightsSection.body}</p>
        </div>
        <ul className="plain-highlights__list">
          {highlightsSection.items.map((item, index) => (
            <li key={item.name}>
              <span className="plain-highlights__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{item.name}</h3>
              <p className="muted">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <EnquirySection />
    </div>
  );
}
