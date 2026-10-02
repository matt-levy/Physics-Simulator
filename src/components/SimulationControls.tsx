"use client";

type SimulationControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
}: SimulationControlsProps) {
  return (
    <section aria-label="Simulation controls">
      <button type="button" disabled={isRunning} onClick={onStart}>
        Start
      </button>
      <button type="button" disabled={!isRunning} onClick={onStop}>
        Stop
      </button>
      {/* TODO: Add controls that apply forces or step the simulation once. */}
    </section>
  );
}
