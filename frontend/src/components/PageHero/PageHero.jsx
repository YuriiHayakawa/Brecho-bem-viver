import './PageHero.css';

export default function PageHero({ title, subtitle }) {
  return (
    <div className="page-hero">
      <div className="page-hero-diagonal" />
      <div className="page-hero-inner">
        <div className="page-hero-bars">
          <span /><span /><span /><span />
        </div>
        <div>
          <h1 className="page-hero-title">{title}</h1>
          {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
