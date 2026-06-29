const DEFAULT_EPSILON = 1e-12;
const SLERP_LINEAR_THRESHOLD = 1 - 1e-8;

function components(value, expectedLength, name) {
  if (value == null || typeof value.length !== "number") {
    throw new TypeError(`${name} must be an array-like value`);
  }
  if (value.length !== expectedLength) {
    throw new RangeError(`${name} must contain exactly ${expectedLength} components`);
  }

  const result = Array.from(value);
  if (!result.every(Number.isFinite)) {
    throw new RangeError(`${name} components must be finite numbers`);
  }
  return result;
}

export function norm(q) {
  return Math.hypot(...components(q, 4, "q"));
}

export function normalize(q, epsilon = DEFAULT_EPSILON) {
  const value = components(q, 4, "q");
  const magnitude = Math.hypot(...value);
  if (magnitude <= epsilon) {
    throw new RangeError(`cannot normalize a quaternion with norm <= ${epsilon}`);
  }
  return value.map((component) => component / magnitude);
}

export function dot(a, b) {
  const left = components(a, 4, "a");
  const right = components(b, 4, "b");
  return left.reduce((sum, component, index) => sum + component * right[index], 0);
}

export function hamilton(a, b) {
  const [aw, ax, ay, az] = components(a, 4, "a");
  const [bw, bx, by, bz] = components(b, 4, "b");

  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

/**
 * Principal logarithm of a unit quaternion, returned as its 3D pure-vector part.
 * The exact negative real unit quaternion has no unique axis and is rejected.
 */
export function logUnit(q, epsilon = DEFAULT_EPSILON) {
  const [w, x, y, z] = normalize(q, epsilon);
  const vectorNorm = Math.hypot(x, y, z);

  if (vectorNorm === 0) {
    if (w < 0) {
      throw new RangeError("logUnit is undefined at the negative real unit quaternion");
    }
    return [0, 0, 0];
  }

  const scale = Math.atan2(vectorNorm, w) / vectorNorm;
  return [x * scale, y * scale, z * scale];
}

/** Exponential of a 3D pure quaternion vector. */
export function expPure(vector) {
  const [x, y, z] = components(vector, 3, "vector");
  const angle = Math.hypot(x, y, z);

  if (angle === 0) {
    return [1, 0, 0, 0];
  }

  const scale = angle < 1e-8
    ? 1 - (angle * angle) / 6
    : Math.sin(angle) / angle;

  return normalize([
    Math.cos(angle),
    x * scale,
    y * scale,
    z * scale,
  ]);
}

/**
 * Unit-quaternion interpolation on the shortest S^3 arc.
 * When b is antipodal to a, the returned endpoint is the equivalent -b.
 */
export function slerp(a, b, t) {
  if (!Number.isFinite(t) || t < 0 || t > 1) {
    throw new RangeError("t must be a finite number in [0, 1]");
  }

  const left = normalize(a);
  let right = normalize(b);
  let cosine = dot(left, right);

  if (cosine < 0) {
    right = right.map((component) => -component);
    cosine = -cosine;
  }
  cosine = Math.min(1, Math.max(-1, cosine));

  if (cosine >= SLERP_LINEAR_THRESHOLD) {
    return normalize(left.map(
      (component, index) => (1 - t) * component + t * right[index],
    ));
  }

  const angle = Math.acos(cosine);
  const denominator = Math.sin(angle);
  const leftWeight = Math.sin((1 - t) * angle) / denominator;
  const rightWeight = Math.sin(t * angle) / denominator;

  return normalize(left.map(
    (component, index) => leftWeight * component + rightWeight * right[index],
  ));
}
