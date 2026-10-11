"use client";

import { useState } from "react";

type SimulationControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  reset?: () => void;
  onApplyForce?: (forceX: number, forceY: number, duration: number) => void;
};

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
  reset,
  onApplyForce,
}: SimulationControlsProps) {
  const [forceX, setForceX] = useState<string>("");
  const [forceY, setForceY] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  const handleApplyForce = () => {
    let forceValueX = parseFloat(forceX);
    let forceValueY = parseFloat(forceY);
    let durationValue = parseFloat(duration);

    if (isNaN(forceValueX)) {
      forceValueX = 0;
    }
    if (isNaN(forceValueY)) {
      forceValueY = 0;
    }
    if (isNaN(durationValue)) {
      durationValue = 1 / 60; // Minimum step duration
    }
    if (
      !isNaN(forceValueX) &&
      !isNaN(forceValueY) &&
      !isNaN(durationValue) &&
      onApplyForce
    ) {
      onApplyForce(forceValueX, forceValueY, durationValue);
    }
  };

  return (
    <section aria-label="Simulation controls">
      <button type="button" disabled={isRunning} onClick={onStart}>
        Start
      </button>
      <button type="button" disabled={!isRunning} onClick={onStop}>
        Stop
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      <p>Apply Force</p>
      <p>Positive x points right; positive y points up.</p>
      <input
        type="text"
        title="x"
        aria-label="Force x component"
        value={forceX}
        onChange={(e) => setForceX(e.target.value)}
        placeholder="400"
      />
      <input
        type="text"
        title="y"
        aria-label="Force y component (positive is up)"
        value={forceY}
        onChange={(e) => setForceY(e.target.value)}
        placeholder="400"
      />
      <input
        type="text"
        title="duration"
        aria-label="Duration that the force should be applied"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="1"
      />
      <button type="button" onClick={handleApplyForce}>
        Apply Force
      </button>
    </section>
  );
}
