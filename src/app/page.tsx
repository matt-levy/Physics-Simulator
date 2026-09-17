import { ParticleInspector } from "@/components/ParticleInspector";
import { SimulationCanvas } from "@/components/SimulationCanvas";
import { SimulationControls } from "@/components/SimulationControls";

export default function Home() {
  return (
    <main>
      <h1>Classical Mechanics Simulator</h1>
      <SimulationCanvas />
      <SimulationControls />
      <ParticleInspector />
    </main>
  );
}
