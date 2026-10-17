"use client";

import { useState } from "react";

type ParticleControlsProps = {
  particleId: number | null;
  onApplyForce: (
    particleId: number,
    forceX: number,
    forceY: number,
    duration: number,
  ) => void;
};

export function ParticleControls({
  particleId,
  onApplyForce,
}: ParticleControlsProps) {
  const [forceX, setForceX] = useState("400");
  const [forceY, setForceY] = useState("400");
  const [duration, setDuration] = useState("1");

  const handleApplyForce = () => {
    if (particleId === null) {
      return;
    }

    const parsedX = Number(forceX);
    const parsedY = Number(forceY);
    const parsedDuration = Number(duration);
    if (
      ![parsedX, parsedY, parsedDuration].every(Number.isFinite) ||
      parsedDuration <= 0
    ) {
      return;
    }
    onApplyForce(particleId, parsedX, parsedY, parsedDuration);
  };

  return (
    <section aria-label="Particle controls">
      <h3>Particle controls</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleApplyForce();
        }}
      >
        <p>Positive x points right; positive y points up.</p>
        <label>
          Force x
          <input
            type="number"
            step="any"
            value={forceX}
            onChange={(event) => setForceX(event.target.value)}
            required
          />
        </label>
        <label>
          Force y
          <input
            type="number"
            step="any"
            value={forceY}
            onChange={(event) => setForceY(event.target.value)}
            required
          />
        </label>
        <label>
          Duration (s)
          <input
            type="number"
            min="0.001"
            step="any"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={
            particleId === null ||
            !Number.isFinite(Number(duration)) ||
            Number(duration) <= 0
          }
        >
          Apply Force
        </button>
      </form>
    </section>
  );
}
