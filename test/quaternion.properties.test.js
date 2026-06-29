import assert from "node:assert/strict";
import test from "node:test";

import {
  dot,
  expPure,
  hamilton,
  logUnit,
  norm,
  normalize,
  slerp,
} from "../src/math/quaternion.js";
import {
  property,
  randomQuaternion,
} from "../test-support/property.js";

const IDENTITY = [1, 0, 0, 0];
const TOLERANCE = 1e-11;

function assertClose(actual, expected, tolerance = TOLERANCE) {
  const scale = Math.max(1, Math.abs(actual), Math.abs(expected));
  assert.ok(
    Math.abs(actual - expected) <= tolerance * scale,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function assertQuaternionClose(actual, expected, tolerance = TOLERANCE) {
  assert.equal(actual.length, 4);
  assert.equal(expected.length, 4);
  actual.forEach((component, index) => {
    assertClose(component, expected[index], tolerance);
  });
}

function assertVectorClose(actual, expected, tolerance = TOLERANCE) {
  assert.equal(actual.length, expected.length);
  actual.forEach((component, index) => {
    assertClose(component, expected[index], tolerance);
  });
}

function orientationDistance(a, b) {
  const cosine = Math.min(1, Math.max(0, Math.abs(dot(normalize(a), normalize(b)))));
  return Math.acos(cosine);
}

function assertOrientationEquivalent(a, b, tolerance = TOLERANCE) {
  assertClose(Math.abs(dot(normalize(a), normalize(b))), 1, tolerance);
}

property("normalization produces a unit quaternion and is idempotent", {
  seed: 0x51a7c0de,
  generate: randomQuaternion,
}, (q) => {
  const unit = normalize(q);
  assertClose(norm(unit), 1);
  assertQuaternionClose(normalize(unit), unit);
});

test("normalization rejects zero, near-zero, malformed, and non-finite inputs", () => {
  assert.throws(() => normalize([0, 0, 0, 0]), RangeError);
  assert.throws(() => normalize([1e-14, 0, 0, 0]), RangeError);
  assert.throws(() => normalize([1, 2, 3]), RangeError);
  assert.throws(() => normalize([1, 2, 3, Number.NaN]), RangeError);
});

property("Hamilton products preserve identity and multiply norms", {
  seed: 0xa11ce5ed,
  generate: (random) => [randomQuaternion(random), randomQuaternion(random)],
}, ([a, b]) => {
  assertQuaternionClose(hamilton(IDENTITY, a), a);
  assertQuaternionClose(hamilton(a, IDENTITY), a);
  assertClose(norm(hamilton(a, b)), norm(a) * norm(b));
});

test("Hamilton products use the noncommutative quaternion basis", () => {
  const i = [0, 1, 0, 0];
  const j = [0, 0, 1, 0];
  const k = [0, 0, 0, 1];
  assertQuaternionClose(hamilton(i, j), k);
  assertQuaternionClose(hamilton(j, i), k.map((component) => -component));
  assert.notDeepEqual(hamilton(i, j), hamilton(j, i));
});

property("exp(log(q)) round-trips unit quaternions away from the branch singularity", {
  seed: 0x10e0cafe,
  generate: (random) => normalize(randomQuaternion(random)),
}, (q) => {
  assertQuaternionClose(expPure(logUnit(q)), q);
});

test("log/exp handle identity and tiny angles and reject the undefined branch point", () => {
  assert.deepEqual(logUnit(IDENTITY), [0, 0, 0]);
  assert.deepEqual(expPure([0, 0, 0]), IDENTITY);

  const tiny = [1e-10, -2e-10, 3e-10];
  assertQuaternionClose(expPure(logUnit(expPure(tiny))), expPure(tiny));

  const halfSqrt = Math.SQRT1_2;
  assertQuaternionClose(expPure([Math.PI / 2, 0, 0]), [0, 1, 0, 0]);
  assertVectorClose(logUnit([halfSqrt, 0, halfSqrt, 0]), [0, Math.PI / 4, 0]);
  assert.throws(() => logUnit([-1, 0, 0, 0]), RangeError);
});

property("shortest-path SLERP preserves endpoints and antipodal orientation", {
  seed: 0x5e1e7e57,
  examples: [[[1, 0, 0, 0], [-1, 0, 0, 0]]],
  generate: (random) => [
    normalize(randomQuaternion(random)),
    normalize(randomQuaternion(random)),
  ],
}, ([a, b]) => {
  assertOrientationEquivalent(slerp(a, b, 0), a);
  assertOrientationEquivalent(slerp(a, b, 1), b);

  const negatedB = b.map((component) => -component);
  assertOrientationEquivalent(
    slerp(a, b, 0.37),
    slerp(a, negatedB, 0.37),
  );
});

property("SLERP stays unit length, follows constant speed, and remains stable near collinearity", {
  seed: 0xc0111ea7,
  examples: [
    {
      a: [1, 0, 0, 0],
      b: normalize([1, 1e-10, -2e-10, 3e-10]),
      t: 0.5,
    },
    {
      a: [1, 0, 0, 0],
      b: [0, 1, 0, 0],
      t: 0.5,
      expected: [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
    },
  ],
  generate: (random, index) => ({
    a: normalize(randomQuaternion(random)),
    b: normalize(randomQuaternion(random)),
    t: index / 255,
  }),
}, ({ a, b, t, expected }) => {
  const interpolated = slerp(a, b, t);
  assert.ok(interpolated.every(Number.isFinite));
  assertClose(norm(interpolated), 1);
  assertClose(orientationDistance(a, interpolated), t * orientationDistance(a, b));
  if (expected) {
    assertQuaternionClose(interpolated, expected);
  }
});
