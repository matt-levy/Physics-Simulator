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
  const [forceX, setForceX] = useState("");
  const [forceY, setForceY] = useState("");
  const [duration, setDuration] = useState("");

  const handleApplyForce = () => {
    if (particleId === null) {
      return;
    }

    const parsedX = Number.parseFloat(forceX);
    const parsedY = Number.parseFloat(forceY);
    const parsedDuration = Number.parseFloat(duration);
    const forceValueX = Number.isNaN(parsedX) ? 0 : parsedX;
    const forceValueY = Number.isNaN(parsedY) ? 0 : parsedY;
    const durationValue = Number.isNaN(parsedDuration)
      ? 1 / 60
      : parsedDuration;
    onApplyForce(particleId, forceValueX, forceValueY, durationValue);
  };

  return (
    <section aria-label="Particle controls">
      <h3>Particle controls</h3>
      <p>Apply force. Positive x points right; positive y points up.</p>
      <input
        type="text"
        title="x"
        aria-label="Force x component"
        value={forceX}
        onChange={(event) => setForceX(event.target.value)}
        placeholder="400"
      />
      <input
        type="text"
        title="y"
        aria-label="Force y component (positive is up)"
        value={forceY}
        onChange={(event) => setForceY(event.target.value)}
        placeholder="400"
      />
      <input
        type="text"
        title="duration"
        aria-label="Duration that the force should be applied"
        value={duration}
        onChange={(event) => setDuration(event.target.value)}
        placeholder="1"
      />
      <button
        type="button"
        disabled={particleId === null}
        onClick={handleApplyForce}
      >
        Apply Force
      </button>
    </section>
  );
}
