import test from "node:test";

export const DEFAULT_CASES = 256;

export function seededRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) {
    throw new RangeError("seed must be a non-zero 32-bit integer");
  }

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

export function property(name, options, predicate) {
  const {
    seed,
    generate,
    cases = DEFAULT_CASES,
    examples = [],
  } = options;
  const seedLabel = `0x${(seed >>> 0).toString(16).padStart(8, "0")}`;

  test(`${name} [seed=${seedLabel}, cases=${cases}]`, () => {
    const random = seededRandom(seed);
    const samples = [...examples];
    for (let index = 0; index < cases; index += 1) {
      samples.push(generate(random, index));
    }

    samples.forEach((sample, index) => {
      try {
        predicate(sample, index);
      } catch (cause) {
        throw new Error(
          `${name} failed at case ${index} with ${JSON.stringify(sample)}`,
          { cause },
        );
      }
    });
  });
}

export function randomQuaternion(random) {
  return Array.from({ length: 4 }, () => 2 * random() - 1);
}
