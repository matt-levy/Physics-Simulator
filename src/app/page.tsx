import { SimulationCanvas } from "@/components/SimulationCanvas";

export default function Home() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∑
          </span>
          <span>Motion Lab</span>
        </div>
        <span className="topbar-note">An interactive mechanics notebook</span>
      </header>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Classical mechanics · 01</p>
          <h1 id="page-title">
            Make motion
            <br />
            make sense.
          </h1>
          <p className="hero-description">
            Explore how force changes motion. Add particles, apply a push, and
            watch Newton’s second law play out in real time.
          </p>
        </div>
        <div className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          Fixed-step simulation
        </div>
      </section>
      <SimulationCanvas />
      <footer className="page-footer">
        <span>Built for curious minds and good questions.</span>
        <span>F = m · a</span>
      </footer>
    </main>
  );
}
