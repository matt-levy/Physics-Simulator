"use client";

import { useEffect, useRef, useState } from "react";
import { World } from "@/physics/World";
import { SimulationControls } from "./SimulationControls";
import { ParticleControls } from "./ParticleControls";
import { Particle } from "@/physics/Particle";
import { ParticleInspector, type ParticleSnapshot } from "./ParticleInspector";
import { Vector2 } from "@/physics/Vector2";
import {
  useSimulationPersistence,
  type SavedTimedForce,
} from "@/hooks/useSimulationPersistence";

const FIXED_TIMESTEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const GRID_SPACING_PIXELS = 50;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PARTICLE_COLOR = "#166b50";
const SELECTED_PARTICLE_COLOR = "#e9a54a";
const SELECTED_PARTICLE_OUTLINE = "#8a4b12";

function formatForce(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function sumForces(forces: SavedTimedForce[]): Vector2 {
  return forces.reduce(
    (total, entry) => ({
      x: total.x + entry.force.x,
      y: total.y + entry.force.y,
    }),
    { x: 0, y: 0 },
  );
}

function createParticleSnapshot(particle: Particle): ParticleSnapshot {
  return {
    id: particle.id,
    mass: particle.mass,
    position: { ...particle.position },
    velocity: { ...particle.velocity },
    acceleration: { ...particle.acceleration },
    appliedForce: { ...particle.lastAppliedForce },
  };
}

function createParticleSnapshots(particles: Particle[]): ParticleSnapshot[] {
  return particles.map(createParticleSnapshot);
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
  selectedParticleId: number | null,
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
    const isSelected = particle.id === selectedParticleId;
    context.fillStyle = isSelected ? SELECTED_PARTICLE_COLOR : PARTICLE_COLOR;
    context.fill();

    if (isSelected) {
      context.lineWidth = 2;
      context.strokeStyle = SELECTED_PARTICLE_OUTLINE;
      context.stroke();
    }
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
      { x: 0, y: 0 }, // accumulated force
    );
    initialWorld.addParticle(initialParticle);
    return initialWorld;
  });
  const worldRef = useRef(world);

  const [isRunning, setIsRunning] = useState(false);
  const [worldRevision, setWorldRevision] = useState(0);
  const [particleSnapshots, setParticleSnapshots] = useState<
    ParticleSnapshot[]
  >(() => createParticleSnapshots(world.particles));
  const [selectedParticleId, setSelectedParticleId] = useState<number | null>(
    () => world.particles[0]?.id ?? null,
  );
  const timedForcesRef = useRef<SavedTimedForce[]>([]);
  const nextTimedForceIdRef = useRef(1);
  const [activeForces, setActiveForces] = useState<SavedTimedForce[]>([]);
  const { isReady: storageReady, restoredTimedForces } = useSimulationPersistence({
    world,
    isRunning,
    worldRevision,
    timedForcesRef,
  });

  useEffect(() => {
    if (!storageReady) return;

    timedForcesRef.current = restoredTimedForces.map((timedForce) => ({
      ...timedForce,
      force: { ...timedForce.force },
    }));
    setActiveForces(timedForcesRef.current);
    nextTimedForceIdRef.current =
      Math.max(0, ...timedForcesRef.current.map((timedForce) => timedForce.id)) +
      1;
    setParticleSnapshots(createParticleSnapshots(world.particles));
    setSelectedParticleId(world.particles[0]?.id ?? null);
    setWorldRevision((revision) => revision + 1);
  }, [restoredTimedForces, storageReady, world]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      drawWorld(context, canvas, world, selectedParticleId);
    }
  }, [world, worldRevision, selectedParticleId]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let animationFrameId = 0;
    let previousTimestamp: number | null = null;
    let accumulatedTime = 0;

    const resetFrameClock = () => {
      previousTimestamp = null;
      accumulatedTime = 0;
    };

    document.addEventListener("visibilitychange", resetFrameClock);

    const frame = (timestamp: number) => {
      if (document.hidden) {
        resetFrameClock();
        animationFrameId = requestAnimationFrame(frame);
        return;
      }

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
              world.particles
                .find((particle) => particle.id === timedForce.particleId)
                ?.applyForce(timedForce.force);
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
        drawWorld(context, canvas, world, selectedParticleId);
      }

      // React displays a copy; the World remains the source of truth.
      setParticleSnapshots(createParticleSnapshots(world.particles));
      setActiveForces(
        timedForcesRef.current.map((timedForce) => ({
          ...timedForce,
          force: { ...timedForce.force },
        })),
      );

      animationFrameId = requestAnimationFrame(frame);
    };

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", resetFrameClock);
    };
  }, [isRunning, selectedParticleId, world]);

  const renderParticleControls = (particleId: number | null) => (
    <ParticleControls
      particleId={particleId}
      onApplyForce={(particleId, forceX, forceY, duration) => {
        const simulationWorld = worldRef.current;
        const particle = simulationWorld.particles.find(
          (item) => item.id === particleId,
        );
        if (!particle) {
          return;
        }

        const timedForce = {
          id: nextTimedForceIdRef.current++,
          particleId,
          force: { x: forceX, y: forceY },
          remainingDuration: Math.max(0, duration),
          totalDuration: Math.max(0, duration),
        };
        timedForcesRef.current = [...timedForcesRef.current, timedForce];
        setWorldRevision((revision) => revision + 1);
        setActiveForces(
          timedForcesRef.current.map((force) => ({
            ...force,
            force: { ...force.force },
          })),
        );

        if (!isRunning) {
          const appliedForce = sumForces(
            timedForcesRef.current.filter(
              (force) => force.particleId === particleId,
            ),
          );

          setParticleSnapshots((previous) =>
            previous.map((snapshot) =>
              snapshot.id === particleId
                ? { ...snapshot, appliedForce }
                : snapshot,
            ),
          );
        }
      }}
    />
  );

  const reset = () => {
    timedForcesRef.current = [];
    setActiveForces([]);
    const simulationWorld = worldRef.current;
    simulationWorld.reset();
    setParticleSnapshots(createParticleSnapshots(simulationWorld.particles));
    setWorldRevision((revision) => revision + 1);
  };

  const addParticle = () => {
    const simulationWorld = worldRef.current;
    const nextParticleId =
      simulationWorld.particles.reduce(
        (highestId, particle) => Math.max(highestId, particle.id),
        0,
      ) + 1;
    const newParticle = new Particle(
      nextParticleId,
      1, // mass
      { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT }, // position
      { x: 0, y: 0 }, // velocity
      { x: 0, y: 0 }, // acceleration
      { x: 0, y: 0 }, // accumulated force
    );
    simulationWorld.addParticle(newParticle);
    if (selectedParticleId === null) {
      setSelectedParticleId(nextParticleId);
    }
    setParticleSnapshots(createParticleSnapshots(simulationWorld.particles));
    setWorldRevision((revision) => revision + 1);
  };

  const removeParticle = (particleId: number) => {
    const simulationWorld = worldRef.current;
    simulationWorld.removeParticle(particleId);
    timedForcesRef.current = timedForcesRef.current.filter(
      (timedForce) => timedForce.particleId !== particleId,
    );
    setActiveForces(
      timedForcesRef.current.map((timedForce) => ({
        ...timedForce,
        force: { ...timedForce.force },
      })),
    );

    if (selectedParticleId === particleId) {
      setSelectedParticleId(simulationWorld.particles[0]?.id ?? null);
    }

    setParticleSnapshots(createParticleSnapshots(simulationWorld.particles));
    setWorldRevision((revision) => revision + 1);
  };

  const removeAllParticles = () => {
    const simulationWorld = worldRef.current;
    simulationWorld.removeAllParticles();
    timedForcesRef.current = [];
    setActiveForces([]);
    setSelectedParticleId(null);
    setParticleSnapshots([]);
    setWorldRevision((revision) => revision + 1);
  };

  return (
    <div className="simulation-layout">
      <section className="panel simulation-panel" aria-label="Simulation">
        <div className="panel-heading">
          <h2>Live simulation</h2>
          <span className="panel-kicker">WORLD · 800 × 500</span>
        </div>
        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            role="img"
            aria-label="A 2D physics world showing particles moving and bouncing off the borders"
          >
            Your browser does not support the canvas element.
          </canvas>
        </div>
        <div className="canvas-caption">
          <span>World origin at bottom left · positive y points up</span>
          <span>1 px / unit</span>
        </div>
        <SimulationControls
          isRunning={isRunning}
          onStart={() => setIsRunning(true)}
          onStop={() => setIsRunning(false)}
          onReset={reset}
          onAddParticle={addParticle}
        />
      </section>
      <section
        className="panel inspector-panel"
        aria-label="Particle inspector"
      >
        <ParticleInspector
          particles={particleSnapshots}
          selectedParticleId={selectedParticleId}
          onSelectParticle={setSelectedParticleId}
          onRemoveParticle={removeParticle}
          onRemoveAllParticles={removeAllParticles}
          controls={renderParticleControls}
        />
      </section>
      <section className="panel force-panel" aria-labelledby="forces-heading">
        <div className="panel-heading">
          <h2 id="forces-heading">Applied forces</h2>
          <span className="panel-kicker">{activeForces.length} ACTIVE</span>
        </div>
        {activeForces.length > 0 ? (
          <ul className="active-force-list">
            {activeForces.map((timedForce) => {
              const progress = Math.min(
                100,
                (timedForce.remainingDuration / timedForce.totalDuration) * 100,
              );

              return (
                <li className="active-force" key={timedForce.id}>
                  <div className="active-force-topline">
                    <strong>Particle {timedForce.particleId}</strong>
                    <span className="force-time">
                      {timedForce.remainingDuration.toFixed(2)} s
                    </span>
                  </div>
                  <p>
                    F = ({formatForce(timedForce.force.x)},{" "}
                    {formatForce(timedForce.force.y)}) N
                  </p>
                  <div
                    className="force-progress-track"
                    role="progressbar"
                    aria-label={`Force duration remaining for particle ${timedForce.particleId}`}
                    aria-valuemin={0}
                    aria-valuemax={timedForce.totalDuration}
                    aria-valuenow={timedForce.remainingDuration}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-forces">
            No active forces. Apply one to a particle to see its countdown here.
          </p>
        )}
      </section>
    </div>
  );
}
