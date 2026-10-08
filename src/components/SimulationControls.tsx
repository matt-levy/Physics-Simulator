"use client";

import { useState } from "react";

type SimulationControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  reset?: () => void;
  onApplyForce?: (forceX: number, forceY: number) => void;
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

  const handleApplyForce = () => {
    let forceValueX = parseFloat(forceX);
    let forceValueY = parseFloat(forceY);
    if (isNaN(forceValueX)) {
      forceValueX = 0;
    }
    if (isNaN(forceValueY)) {
      forceValueY = 0;
    }
    if (!isNaN(forceValueX) && !isNaN(forceValueY) && onApplyForce) {
      onApplyForce(forceValueX, forceValueY);
    }
    setForceX(""); // Clear the input after applying the force
    setForceY(""); // Clear the input after applying the force
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
      <input
        type="text"
        title="x"
        value={forceX}
        onChange={(e) => setForceX(e.target.value)}
        placeholder="400"
      />
      <input
        type="text"
        title="y"
        value={forceY}
        onChange={(e) => setForceY(e.target.value)}
        placeholder="400"
      />
      <button type="button" onClick={handleApplyForce}>
        Apply Force
      </button>
    </section>
  );
}
