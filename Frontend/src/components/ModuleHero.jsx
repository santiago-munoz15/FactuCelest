export default function ModuleHero({ eyebrow, title, description, stats = [], toolbar, className = "" }) {
  return <section className={`module-hero ${className}`}>
    <div className="module-hero-top">
      <div className="module-hero-copy">
        <span className="module-hero-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {stats.length > 0 && <div className="module-hero-stats">{stats.map((stat) => <article key={stat.label}>
        <span>{stat.label}</span><strong>{stat.value}</strong>
      </article>)}</div>}
    </div>
    {toolbar && <div className="module-hero-toolbar">{toolbar}</div>}
  </section>;
}
