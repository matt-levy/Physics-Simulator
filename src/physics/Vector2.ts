export type Vector2 = {
  x: number;
  y: number;
};

function add(v1: Vector2, v2: Vector2): Vector2 {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function subtract(v1: Vector2, v2: Vector2): Vector2 {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function scale(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v: Vector2): Vector2 {
  const mag = magnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0 }; // Return a zero vector if the magnitude is zero
  }
  return { x: v.x / mag, y: v.y / mag };
}

function dot(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

function cross(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.y - v1.y * v2.x;
}
