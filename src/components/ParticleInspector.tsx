import type { Vector2 } from "@/physics/Vector2";

export type ParticleSnapshot = {
  id: number;
  mass: number;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  accumulatedForce: Vector2;
};

type ParticleInspectorProps = {
  particle: ParticleSnapshot | null;
};

function formatVector(vector: Vector2): string {
  return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)})`;
}

export function ParticleInspector({ particle }: ParticleInspectorProps) {
  if (particle === null) {
    return (
      <section aria-label="Particle inspector">
        <h2>Particle inspector</h2>
        <p>No particle is being inspected.</p>
      </section>
    );
  }

  return (
    <section aria-label="Particle inspector">
      <h2>Particle inspector</h2>
      <dl>
        <dt>ID</dt>
        <dd>{particle.id}</dd>
        <dt>Mass</dt>
        <dd>{particle.mass}</dd>
        <dt>Position</dt>
        <dd>{formatVector(particle.position)}</dd>
        <dt>Velocity</dt>
        <dd>{formatVector(particle.velocity)}</dd>
        <dt>Acceleration</dt>
        <dd>{formatVector(particle.acceleration)}</dd>
        <dt>Net force</dt>
        <dd>{formatVector(particle.accumulatedForce)}</dd>
      </dl>
    </section>
  );
}
