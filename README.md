# Classical Mechanics Simulator

A small Next.js + React + TypeScript foundation for building a 2D classical mechanics simulator. The physics has intentionally not been implemented: this repository provides the places to write it yourself.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
  app/          Next.js App Router route, layout, and global CSS
  components/   Future simulation view, controls, and inspector UI
  physics/      Framework-independent TypeScript simulation code
```

The physics folder is deliberately independent of React and Next.js:

- `Vector2.ts` is the home for 2D vector operations.
- `Particle.ts` will hold a particle's mass, position, velocity, acceleration, and accumulated force.
- `World.ts` will hold particles and eventually advance the simulation by a timestep.

The React components currently only establish the eventual UI areas:

- `SimulationCanvas.tsx` will render the simulation.
- `SimulationControls.tsx` will provide force and stepping controls.
- `ParticleInspector.tsx` will display particle state.

The intended data flow is:

```text
UI input
  → applies force to a particle
  → particle accumulates forces
  → a simulation step calculates acceleration
  → acceleration updates velocity
  → velocity updates position
  → canvas reads position and renders the particle
```
