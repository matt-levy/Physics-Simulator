"use client";

import { useEffect, useRef, useState } from "react";
import { World } from "@/physics/World";
import { SimulationControls } from "./SimulationControls";
import { Particle } from "@/physics/Particle";
import { ParticleInspector, type ParticleSnapshot } from "./ParticleInspector";

const FIXED_TIMESTEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;

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

      const context = canvasRef.current?.getContext("2d");

      if (context && canvasRef.current) {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
        // TODO: Read particle positions from worldRef.current and draw them here.\\
        const particles = world.particles;
        for (const particle of particles) {
          context.beginPath();
          context.arc(
            particle.position.x,
            particle.position.y,
            5,
            0,
            2 * Math.PI,
          );
          context.fillStyle = "blue";
          context.fill();
        }
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
      />
      <ParticleInspector particle={particleSnapshot} />
    </section>
  );
}
