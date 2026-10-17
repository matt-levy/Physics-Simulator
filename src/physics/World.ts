import type { Particle } from "./Particle";

type ParticleInitialState = {
  position: Particle["position"];
  velocity: Particle["velocity"];
  acceleration: Particle["acceleration"];
  accumulatedForce: Particle["accumulatedForce"];
  lastAppliedForce: Particle["lastAppliedForce"];
};

export class World {
  particles: Particle[] = [];
  private initialStates = new Map<number, ParticleInitialState>();

  constructor(
    public width: number = 800,
    public height: number = 500,
  ) {}

  addParticle(particle: Particle): void {
    this.particles.push(particle);
    this.initialStates.set(particle.id, {
      position: { ...particle.position },
      velocity: { ...particle.velocity },
      acceleration: { ...particle.acceleration },
      accumulatedForce: { ...particle.accumulatedForce },
      lastAppliedForce: { ...particle.lastAppliedForce },
    });
  }

  removeParticle(particleId: number): void {
    this.particles = this.particles.filter(
      (particle) => particle.id !== particleId,
    );
    this.initialStates.delete(particleId);
  }

  removeAllParticles(): void {
    this.particles = [];
    this.initialStates.clear();
  }

  update(dt: number): void {
    for (const particle of this.particles) {
      particle.update(dt);
    }
    this.handleCollisions();
  }

  reset(): void {
    this.particles.forEach((particle) => {
      const initialState = this.initialStates.get(particle.id);
      if (!initialState) return;

      particle.setPosition({ ...initialState.position });
      particle.setVelocity({ ...initialState.velocity });
      particle.setAcceleration({ ...initialState.acceleration });
      particle.setAccumulatedForce({ ...initialState.accumulatedForce });
      particle.lastAppliedForce = { ...initialState.lastAppliedForce };
    });
  }

  // General collision entry point for the world's collision scenarios.
  // Add other collision handlers here as the simulation grows.
  handleCollisions(): void {
    this.handleBorderCollisions();
  }

  // World coordinates have a bottom-left origin, with positive y upward.
  private handleBorderCollisions(): void {
    this.particles.forEach((particle) => {
      const { radius } = particle;

      if (particle.position.x - radius < 0) {
        particle.position.x = radius;
        if (particle.velocity.x < 0) particle.velocity.x = -particle.velocity.x;
      }
      if (particle.position.x + radius > this.width) {
        particle.position.x = this.width - radius;
        if (particle.velocity.x > 0) particle.velocity.x = -particle.velocity.x;
      }
      if (particle.position.y - radius < 0) {
        particle.position.y = radius;
        if (particle.velocity.y < 0) particle.velocity.y = -particle.velocity.y;
      }
      if (particle.position.y + radius > this.height) {
        particle.position.y = this.height - radius;
        if (particle.velocity.y > 0) particle.velocity.y = -particle.velocity.y;
      }
    });
  }
}
