import type { Particle } from "./Particle";
import { defaultParticle } from "./Particle";

export class World {
  particles: Particle[] = [];

  // TODO: Add particles to the world.
  addParticle(particle: Particle): void {
    this.particles.push(particle);
  }

  // TODO: Advance all particles by a timestep.
  update(dt: number): void {
    for (const particle of this.particles) {
      particle.update(dt);
    }
  }

  reset(): void {
    this.particles.forEach((particle) => {
      particle.setPosition(defaultParticle.position);
      particle.setVelocity(defaultParticle.velocity);
      particle.setAcceleration(defaultParticle.acceleration);
      particle.setAccumulatedForce(defaultParticle.accumulatedForce);
    });
  }
}
