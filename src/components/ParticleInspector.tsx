import type { Vector2 } from "@/physics/Vector2";
import { useState, type ReactNode } from "react";

export type ParticleSnapshot = {
  id: number;
  mass: number;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  appliedForce: Vector2;
};

type ParticleInspectorProps = {
  particles: ParticleSnapshot[];
  controls: (particleId: number | null) => ReactNode;
};

function formatVector(vector: Vector2): string {
  return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)})`;
}

export function ParticleInspector({
  particles,
  controls,
}: ParticleInspectorProps) {
  const [selectedParticleId, setSelectedParticleId] = useState<number | null>(
    () => particles[0]?.id ?? null,
  );
  const selectedParticle =
    particles.find((particle) => particle.id === selectedParticleId) ?? null;

  return (
    <section className="particle-inspector" aria-label="Particle inspector">
      <div className="particle-list">
        <h2>Particles</h2>
        {particles.length > 0 ? (
          <ul className="particle-list-items">
            {particles.map((particle) => (
              <li className="particle-list-item" key={particle.id}>
                <button
                  type="button"
                  className={
                    particle.id === selectedParticleId ? "is-selected" : ""
                  }
                  aria-pressed={particle.id === selectedParticleId}
                  onClick={() => setSelectedParticleId(particle.id)}
                >
                  Particle {particle.id}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No particles</p>
        )}
      </div>
      <div className="particle-details">
        <h2>Selected particle</h2>
        {selectedParticle ? (
          <dl>
            <dt>ID</dt>
            <dd>{selectedParticle.id}</dd>
            <dt>Mass</dt>
            <dd>{selectedParticle.mass}</dd>
            <dt>Position</dt>
            <dd>{formatVector(selectedParticle.position)}</dd>
            <dt>Velocity</dt>
            <dd>{formatVector(selectedParticle.velocity)}</dd>
            <dt>Acceleration</dt>
            <dd>{formatVector(selectedParticle.acceleration)}</dd>
            <dt>Applied force</dt>
            <dd>{formatVector(selectedParticle.appliedForce)}</dd>
          </dl>
        ) : (
          <p>No particle is being inspected.</p>
        )}
      </div>
      <div className="particle-controls-panel">
        {controls(selectedParticle?.id ?? null)}
      </div>
    </section>
  );
}
