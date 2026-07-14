import { describe, expect, it } from "vitest";

import { PlayerStrength } from "./PlayerStrength";

describe("PlayerStrength", () => {
  it("should normalize batting strength", () => {
    const strength = new PlayerStrength({
      batting: 99,
      bowling: 0,
      fielding: 0,
      fitness: 0,
      experience: 0,
    });

    expect(strength.batting()).toBe(1);
  });

  it("should normalize bowling strength", () => {
    const strength = new PlayerStrength({
      batting: 0,
      bowling: 99,
      fielding: 0,
      fitness: 0,
      experience: 0,
    });

    expect(strength.bowling()).toBe(1);
  });

  it("should normalize fielding strength", () => {
    const strength = new PlayerStrength({
      batting: 0,
      bowling: 0,
      fielding: 99,
      fitness: 0,
      experience: 0,
    });

    expect(strength.fielding()).toBe(1);
  });

  it("should normalize fitness strength", () => {
    const strength = new PlayerStrength({
      batting: 0,
      bowling: 0,
      fielding: 0,
      fitness: 99,
      experience: 0,
    });

    expect(strength.fitness()).toBe(1);
  });

  it("should normalize experience strength", () => {
    const strength = new PlayerStrength({
      batting: 0,
      bowling: 0,
      fielding: 0,
      fitness: 0,
      experience: 99,
    });

    expect(strength.experience()).toBe(1);
  });

  it("should normalize intermediate values", () => {
    const strength = new PlayerStrength({
      batting: 50,
      bowling: 50,
      fielding: 50,
      fitness: 50,
      experience: 50,
    });

    expect(strength.batting()).toBeCloseTo(50 / 99);
    expect(strength.bowling()).toBeCloseTo(50 / 99);
    expect(strength.fielding()).toBeCloseTo(50 / 99);
    expect(strength.fitness()).toBeCloseTo(50 / 99);
    expect(strength.experience()).toBeCloseTo(50 / 99);
  });

  it("should normalize zero values", () => {
    const strength = new PlayerStrength({
      batting: 0,
      bowling: 0,
      fielding: 0,
      fitness: 0,
      experience: 0,
    });

    expect(strength.batting()).toBe(0);
    expect(strength.bowling()).toBe(0);
    expect(strength.fielding()).toBe(0);
    expect(strength.fitness()).toBe(0);
    expect(strength.experience()).toBe(0);
  });
});
