import { LogoMark } from '../Logo/Logo';
import './PageHero.css';

export default function PageHero({ title, subtitle, eyebrow, right, children }) {
  return (
    <div className="page-hero">
      <div className="page-hero-diagonal" />
      <div className="page-hero-inner">
        {children ?? (
          <>
            <div className="page-hero-left">
              <div className="page-hero-mark-wrap">
                <LogoMark size={30} tone="light" className="page-hero-mark" />
              </div>
              <div>
                {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
                <h1 className="page-hero-title">{title}</h1>
                {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
              </div>
            </div>
            {right && <div className="page-hero-right">{right}</div>}
          </>
        )}
      </div>
    </div>
  );
}
