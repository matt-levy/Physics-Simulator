import { Vector2 } from "./Vector2";

export class Particle {
  // TODO: Add mass plus Vector2 position, velocity, acceleration, and accumulated force.
  constructor(
    public id: number,
    public mass: number,
    public position: Vector2,
    public velocity: Vector2,
    public acceleration: Vector2,
    public accumulatedForce: Vector2,
  ) {
    this.id = id;
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.accumulatedForce = accumulatedForce;
  }

  // TODO: Add applyForce and particle-update behavior.
  applyForce(force: Vector2): void {
    // Accumulate the force applied to the particle
    this.accumulatedForce = {
      x: this.accumulatedForce.x + force.x,
      y: this.accumulatedForce.y + force.y,
    };
  }

  update(dt: number): void {
    // Update acceleration based on accumulated forces and mass
    this.acceleration = {
      x: this.accumulatedForce.x / this.mass,
      y: this.accumulatedForce.y / this.mass,
    };
    this.velocity = {
      x: this.velocity.x + this.acceleration.x * dt,
      y: this.velocity.y + this.acceleration.y * dt,
    };
    this.position = {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
    };

    // Reset accumulated force after update
    this.accumulatedForce = { x: 0, y: 0 };
  }

  // Set methods for position, velocity, acceleration, and accumulated force
  setPosition(position: Vector2): void {
    this.position = position;
  }

  setVelocity(velocity: Vector2): void {
    this.velocity = velocity;
  }

  setAcceleration(acceleration: Vector2): void {
    this.acceleration = acceleration;
  }

  setAccumulatedForce(accumulatedForce: Vector2): void {
    this.accumulatedForce = accumulatedForce;
  }
}

export const defaultParticle = new Particle(
  1,
  1, // mass
  { x: 400, y: 250 }, // position
  { x: 0, y: 0 }, // velocity
  { x: 0, y: 0 }, // acceleration
  { x: 1000, y: 0 }, // accumulated force
);
