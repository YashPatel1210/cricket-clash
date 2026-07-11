import { describe, expect, it } from "vitest";

import { RandomGenerator } from "./RandomGenerator";

describe("RandomGenerator", () => {
  it("should produce identical sequences for the same seed", () => {
    const first = new RandomGenerator(42);
    const second = new RandomGenerator(42);

    for (let i = 0; i < 100; i++) {
      expect(first.nextInt(1, 100))
        .toBe(second.nextInt(1, 100));
    }
  });

it("should produce different sequences for different seeds", () => {
  const first = new RandomGenerator(1);
  const second = new RandomGenerator(2);

  let different = false;

  for (let i = 0; i < 100; i++) {
    if (first.nextInt(1, 1000) !== second.nextInt(1, 1000)) {
      different = true;
      break;
    }
  }

  expect(different).toBe(true);
});

  it("should generate floats between 0 and 1", () => {
    const random = new RandomGenerator(123);

    for (let i = 0; i < 1000; i++) {
      const value = random.nextFloat();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("should pick an item from a collection", () => {
    const random = new RandomGenerator(42);

    const players = [
      "Virat",
      "Rohit",
      "Gill",
      "Bumrah",
    ];

    const selected = random.pick(players);

    expect(players).toContain(selected);
  });

  it("should throw when picking from an empty collection", () => {
    const random = new RandomGenerator(42);

    expect(() => random.pick([]))
      .toThrow("Cannot pick from an empty collection.");
  });

  it("should throw when minimum is greater than maximum", () => {
    const random = new RandomGenerator(42);

    expect(() => random.nextInt(20, 10))
      .toThrow("Minimum cannot be greater than maximum.");
  });
});