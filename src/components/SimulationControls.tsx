type SimulationControlsProps = {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddParticle: () => void;
};

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
  onReset,
  onAddParticle,
}: SimulationControlsProps) {
  return (
    <section aria-label="Simulation controls">
      <button type="button" disabled={isRunning} onClick={onStart}>
        Start
      </button>
      <button type="button" disabled={!isRunning} onClick={onStop}>
        Stop
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
      <button type="button" onClick={onAddParticle}>
        Add Particle
      </button>
    </section>
  );
}
