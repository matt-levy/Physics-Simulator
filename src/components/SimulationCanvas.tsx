"use client";

import { useEffect, useRef, useState } from "react";
import { World } from "@/physics/World";
import { SimulationControls } from "./SimulationControls";
import { Particle } from "@/physics/Particle";
import { ParticleInspector, type ParticleSnapshot } from "./ParticleInspector";
import { Vector2 } from "@/physics/Vector2";

const FIXED_TIMESTEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const GRID_SPACING_PIXELS = 50;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

type TimedForce = {
  force: Vector2;
  remainingDuration: number;
};

function sumForces(forces: TimedForce[]): Vector2 {
  return forces.reduce(
    (total, entry) => ({
      x: total.x + entry.force.x,
      y: total.y + entry.force.y,
    }),
    { x: 0, y: 0 },
  );
}

function createParticleSnapshot(
  particle: Particle | undefined,
): ParticleSnapshot | null {
  if (particle === undefined) {
    return null;
  }

  return {
    id: particle.id,
    mass: particle.mass,
    position: { ...particle.position },
    velocity: { ...particle.velocity },
    acceleration: { ...particle.acceleration },
    appliedForce: { ...particle.lastAppliedForce },
  };
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  context.save();
  context.strokeStyle = "#e5e7eb";
  context.lineWidth = 1;
  context.beginPath();

  // Grid lines (vertical)
  for (let x = 0; x <= width; x += GRID_SPACING_PIXELS) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
  }

  // Grid lines (horizontal)
  for (let y = 0; y <= height; y += GRID_SPACING_PIXELS) {
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
  }

  context.stroke();

  // New path for borders
  context.beginPath();
  context.strokeStyle = "#000000";
  context.strokeRect(1, 1, width - 1, height - 1);

  context.stroke();
  context.restore();
}

function drawWorld(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  world: World,
): void {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(context, canvas.width, canvas.height);

  for (const particle of world.particles) {
    context.beginPath();
    // Convert bottom-left-origin world coordinates to top-left-origin canvas coordinates.
    context.arc(
      particle.position.x,
      canvas.height - particle.position.y,
      particle.radius,
      0,
      2 * Math.PI,
    );
    context.fillStyle = "blue";
    context.fill();
  }
}

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [world] = useState(() => {
    const initialWorld = new World(CANVAS_WIDTH, CANVAS_HEIGHT);
    const initialParticle = new Particle(
      1,
      1, // mass
      { x: 400, y: 250 }, // position
      { x: 0, y: 0 }, // velocity
      { x: 0, y: 0 }, // acceleration
      { x: 1000, y: 0 }, // accumulated force
    );
    initialWorld.addParticle(initialParticle);

    return initialWorld;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [particleSnapshot, setParticleSnapshot] =
    useState<ParticleSnapshot | null>(() =>
      createParticleSnapshot(world.particles[0]),
    );
  const timedForcesRef = useRef<TimedForce[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      drawWorld(context, canvas, world);
    }
  }, [world]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let animationFrameId = 0;
    let previousTimestamp: number | null = null;
    let accumulatedTime = 0;

    const frame = (timestamp: number) => {
      if (previousTimestamp !== null) {
        const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
        accumulatedTime += elapsedSeconds;

        let stepsThisFrame = 0;

        while (
          accumulatedTime >= FIXED_TIMESTEP_SECONDS &&
          stepsThisFrame < MAX_STEPS_PER_FRAME
        ) {
          const timedForces = timedForcesRef.current;
          for (const timedForce of timedForces) {
            if (timedForce.remainingDuration > 0) {
              world.particles[0]?.applyForce(timedForce.force);
              timedForce.remainingDuration = Math.max(
                0,
                timedForce.remainingDuration - FIXED_TIMESTEP_SECONDS,
              );
            }
          }
          timedForcesRef.current = timedForces.filter(
            (timedForce) => timedForce.remainingDuration > 0,
          );
          world.update(FIXED_TIMESTEP_SECONDS);
          accumulatedTime -= FIXED_TIMESTEP_SECONDS;
          stepsThisFrame += 1;
        }
      }

      previousTimestamp = timestamp;

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (canvas && context) {
        drawWorld(context, canvas, world);
      }

      // React displays a copy; the World remains the source of truth.
      setParticleSnapshot(createParticleSnapshot(world.particles[0]));

      animationFrameId = requestAnimationFrame(frame);
    };

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, world]);

  return (
    <section aria-label="Simulation canvas">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        Your browser does not support the canvas element.
      </canvas>
      <SimulationControls
        isRunning={isRunning}
        onStart={() => setIsRunning(true)}
        onStop={() => setIsRunning(false)}
        reset={() => {
          timedForcesRef.current = [];
          world.reset();
          const particle = world.particles[0];
          if (particle) {
            particle.lastAppliedForce = { x: 0, y: 0 };
          }
          setParticleSnapshot(createParticleSnapshot(world.particles[0]));
        }}
        onApplyForce={(forceX: number, forceY: number, duration: number) => {
          const timedForce = {
            force: { x: forceX, y: forceY },
            remainingDuration: Math.max(0, duration),
          };
          timedForcesRef.current = [...timedForcesRef.current, timedForce];

          if (!isRunning) {
            const snapshot = createParticleSnapshot(world.particles[0]);
            if (snapshot) {
              snapshot.appliedForce = sumForces(timedForcesRef.current);
            }
            setParticleSnapshot(snapshot);
          }
        }}
      />
      <ParticleInspector particle={particleSnapshot} />
    </section>
  );
}
