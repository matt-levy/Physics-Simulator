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
    public radius = 5,
    public lastAppliedForce: Vector2 = { x: 0, y: 0 },
  ) {
    this.id = id;
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.accumulatedForce = accumulatedForce;
    this.radius = radius;
    this.lastAppliedForce = lastAppliedForce;
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
    // Preserve the force used by this step for display and calculate acceleration.
    this.lastAppliedForce = { ...this.accumulatedForce };
    this.acceleration = {
      x: this.lastAppliedForce.x / this.mass,
      y: this.lastAppliedForce.y / this.mass,
    };
    this.velocity = {
      x: this.velocity.x + this.acceleration.x * dt,
      y: this.velocity.y + this.acceleration.y * dt,
    };
    this.position = {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
    };

    // Force is accumulated anew for each physics step; acceleration remains
    // visible until the next update recalculates it.
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
