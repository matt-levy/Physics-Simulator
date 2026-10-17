"use client";

import { useEffect, useState } from "react";
import { Particle } from "@/physics/Particle";
import type { Vector2 } from "@/physics/Vector2";
import type { World } from "@/physics/World";

const STORAGE_KEY = "physics-sim:state";
const LEGACY_STORAGE_KEY = "physics-sim:positions";

export type SavedTimedForce = {
  id: number;
  particleId: number;
  force: Vector2;
  remainingDuration: number;
  totalDuration: number;
};

type SavedParticle = {
  id: number;
  mass: number;
  radius: number;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  accumulatedForce: Vector2;
  lastAppliedForce: Vector2;
};

type SavedSimulation = {
  version: 2;
  particles: SavedParticle[];
  timedForces: SavedTimedForce[];
};

type LegacySavedSimulation = {
  version: 1;
  particles: { id: number; x: number; y: number }[];
};

type MutableTimedForceRef = {
  current: SavedTimedForce[];
};

type UseSimulationPersistenceOptions = {
  world: World;
  isRunning: boolean;
  worldRevision: number;
  timedForcesRef: MutableTimedForceRef;
};

function isVector2(value: unknown): value is Vector2 {
  if (typeof value !== "object" || value === null) return false;

  const vector = value as { x?: unknown; y?: unknown };
  return (
    typeof vector.x === "number" &&
    Number.isFinite(vector.x) &&
    typeof vector.y === "number" &&
    Number.isFinite(vector.y)
  );
}

function isSavedParticle(value: unknown): value is SavedParticle {
  if (typeof value !== "object" || value === null) return false;

  const particle = value as Partial<SavedParticle>;
  return (
    typeof particle.id === "number" &&
    Number.isInteger(particle.id) &&
    particle.id > 0 &&
    typeof particle.mass === "number" &&
    Number.isFinite(particle.mass) &&
    particle.mass > 0 &&
    typeof particle.radius === "number" &&
    Number.isFinite(particle.radius) &&
    particle.radius > 0 &&
    isVector2(particle.position) &&
    isVector2(particle.velocity) &&
    isVector2(particle.acceleration) &&
    isVector2(particle.accumulatedForce) &&
    isVector2(particle.lastAppliedForce)
  );
}

function isSavedTimedForce(value: unknown): value is SavedTimedForce {
  if (typeof value !== "object" || value === null) return false;

  const timedForce = value as Partial<SavedTimedForce>;
  return (
    typeof timedForce.id === "number" &&
    Number.isInteger(timedForce.id) &&
    timedForce.id > 0 &&
    typeof timedForce.particleId === "number" &&
    Number.isInteger(timedForce.particleId) &&
    timedForce.particleId > 0 &&
    isVector2(timedForce.force) &&
    typeof timedForce.remainingDuration === "number" &&
    Number.isFinite(timedForce.remainingDuration) &&
    timedForce.remainingDuration > 0 &&
    typeof timedForce.totalDuration === "number" &&
    Number.isFinite(timedForce.totalDuration) &&
    timedForce.totalDuration > 0 &&
    timedForce.remainingDuration <= timedForce.totalDuration
  );
}

function isSavedSimulation(value: unknown): value is SavedSimulation {
  if (typeof value !== "object" || value === null) return false;

  const saved = value as {
    version?: unknown;
    particles?: unknown;
    timedForces?: unknown;
  };
  return (
    saved.version === 2 &&
    Array.isArray(saved.particles) &&
    saved.particles.every(isSavedParticle) &&
    Array.isArray(saved.timedForces) &&
    saved.timedForces.every(isSavedTimedForce)
  );
}

function isLegacySavedSimulation(
  value: unknown,
): value is LegacySavedSimulation {
  if (typeof value !== "object" || value === null) return false;

  const saved = value as { version?: unknown; particles?: unknown };
  return (
    saved.version === 1 &&
    Array.isArray(saved.particles) &&
    saved.particles.every((particle: unknown) => {
      if (typeof particle !== "object" || particle === null) return false;

      const position = particle as { id?: unknown; x?: unknown; y?: unknown };
      return (
        typeof position.id === "number" &&
        Number.isInteger(position.id) &&
        position.id > 0 &&
        typeof position.x === "number" &&
        Number.isFinite(position.x) &&
        typeof position.y === "number" &&
        Number.isFinite(position.y)
      );
    })
  );
}

function migrateLegacySnapshot(
  legacy: LegacySavedSimulation,
): SavedSimulation {
  return {
    version: 2,
    particles: legacy.particles.map(({ id, x, y }) => ({
      id,
      mass: 1,
      radius: 5,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      accumulatedForce: { x: 0, y: 0 },
      lastAppliedForce: { x: 0, y: 0 },
    })),
    timedForces: [],
  };
}

type UseSimulationPersistenceResult = {
  isReady: boolean;
  restoredTimedForces: SavedTimedForce[];
};

export function useSimulationPersistence({
  world,
  isRunning,
  worldRevision,
  timedForcesRef,
}: UseSimulationPersistenceOptions): UseSimulationPersistenceResult {
  const [isReady, setIsReady] = useState(false);
  const [restoredTimedForces, setRestoredTimedForces] = useState<
    SavedTimedForce[]
  >([]);

  useEffect(() => {
    try {
      const savedText =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedText) {
        const parsed: unknown = JSON.parse(savedText);
        const savedSimulation = isSavedSimulation(parsed)
          ? parsed
          : isLegacySavedSimulation(parsed)
            ? migrateLegacySnapshot(parsed)
            : null;

        if (savedSimulation) {
          world.removeAllParticles();
          for (const savedParticle of savedSimulation.particles) {
            world.addParticle(
              new Particle(
                savedParticle.id,
                savedParticle.mass,
                { ...savedParticle.position },
                { ...savedParticle.velocity },
                { ...savedParticle.acceleration },
                { ...savedParticle.accumulatedForce },
                savedParticle.radius,
                { ...savedParticle.lastAppliedForce },
              ),
            );
          }

          const particleIds = new Set(
            world.particles.map((particle) => particle.id),
          );
          timedForcesRef.current = savedSimulation.timedForces
            .filter((timedForce) => particleIds.has(timedForce.particleId))
            .map((timedForce) => ({
              ...timedForce,
              force: { ...timedForce.force },
            }));
          setRestoredTimedForces(timedForcesRef.current);
        }
      }
    } catch {
      // Keep the default world if storage is unavailable or malformed.
    }

    setIsReady(true);
  }, [timedForcesRef, world]);

  useEffect(() => {
    if (!isReady) return;

    const saveSimulation = () => {
      const snapshot: SavedSimulation = {
        version: 2,
        particles: world.particles.map((particle) => ({
          id: particle.id,
          mass: particle.mass,
          radius: particle.radius,
          position: { ...particle.position },
          velocity: { ...particle.velocity },
          acceleration: { ...particle.acceleration },
          accumulatedForce: { ...particle.accumulatedForce },
          lastAppliedForce: { ...particle.lastAppliedForce },
        })),
        timedForces: timedForcesRef.current.map((timedForce) => ({
          ...timedForce,
          force: { ...timedForce.force },
        })),
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // The simulation remains usable if browser storage is unavailable.
      }
    };

    if (!isRunning) {
      saveSimulation();
      return;
    }

    const intervalId = window.setInterval(saveSimulation, 1000);
    window.addEventListener("pagehide", saveSimulation);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", saveSimulation);
    };
  }, [isReady, isRunning, timedForcesRef, world, worldRevision]);

  return { isReady, restoredTimedForces };
}
