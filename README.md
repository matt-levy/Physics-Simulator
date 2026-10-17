# Motion Lab

An interactive 2D classical mechanics playground built with Next.js, React, and TypeScript. Add particles, apply timed forces, and inspect how their motion changes over time.

## Live site

[Open Motion Lab](https://matt-levy.github.io/physics-sim/)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful project commands:

```bash
npm run lint
npm run build
```

## Using the simulator

- Start and stop the fixed-step simulation.
- Add particles and select one to inspect its state.
- Apply an x/y force to a particle for a chosen duration. The active forces panel shows each force and its remaining time.
- Reset the simulation to stop it, clear active forces, and restore every particle's saved starting state.
- Remove the selected particle or remove all particles.

Particles bounce off the world boundaries. The canvas uses a bottom-left world origin, with positive y pointing upward.

## Saved progress

The simulator saves particle state and active timed forces in the browser's `localStorage`. It restores the state after a page reload and starts paused. Saved data is local to the current browser and device; it is not synced to an account or server.

## How the simulation works

The physics code is independent of React and Next.js. Each fixed simulation step applies active forces, calculates acceleration from force and mass, updates velocity and position, then handles boundary collisions. The canvas renders the current world, while React displays a snapshot of particle values in the inspector.

```text
Timed force
  -> accumulated force
  -> acceleration (force / mass)
  -> velocity
  -> position
  -> canvas rendering and particle inspector
```

## Project structure

```text
src/
  app/          Next.js App Router page, layout, metadata, and global styles
  components/   Canvas, simulation controls, particle controls, and inspector
  hooks/        Browser persistence for simulation state
  physics/      Framework-independent particle and world logic
```
