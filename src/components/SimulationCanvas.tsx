"use client";

import { useEffect, useRef, useState } from "react";
import { World } from "@/physics/World";
import { SimulationControls } from "./SimulationControls";
import { Particle } from "@/physics/Particle";
import { ParticleInspector, type ParticleSnapshot } from "./ParticleInspector";

const FIXED_TIMESTEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const GRID_SPACING_PIXELS = 50;

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
    accumulatedForce: { ...particle.accumulatedForce },
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

  for (let x = 0; x <= width; x += GRID_SPACING_PIXELS) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
  }

  for (let y = 0; y <= height; y += GRID_SPACING_PIXELS) {
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
  }

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
    context.arc(particle.position.x, particle.position.y, 5, 0, 2 * Math.PI);
    context.fillStyle = "blue";
    context.fill();
  }
}

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [world] = useState(() => {
    const initialWorld = new World();
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
      <canvas ref={canvasRef} width={800} height={500}>
        Your browser does not support the canvas element.
      </canvas>
      <SimulationControls
        isRunning={isRunning}
        onStart={() => setIsRunning(true)}
        onStop={() => setIsRunning(false)}
        reset={() => {
          world.reset();
          setParticleSnapshot(createParticleSnapshot(world.particles[0]));
        }}
      />
      <ParticleInspector particle={particleSnapshot} />
    </section>
  );
}
