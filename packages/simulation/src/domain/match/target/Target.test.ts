import { describe, expect, it } from "vitest";

import { Score } from "../score";
import { Target } from "./Target";

describe("Target", () => {
  it("should create a target", () => {
    const target = new Target(158);

    expect(target).toBeDefined();
  });

  it("should expose the target score", () => {
    const target = new Target(158);

    expect(target.score()).toBe(158);
  });

  it("should report target not reached", () => {
    const target = new Target(158);

    const score = new Score(157, 3, 95);

    expect(target.isReached(score)).toBe(false);
  });

  it("should report target reached", () => {
    const target = new Target(158);

    const score = new Score(158, 2, 94);

    expect(target.isReached(score)).toBe(true);
  });

  it("should report target exceeded", () => {
    const target = new Target(158);

    const score = new Score(182, 5, 112);

    expect(target.isReached(score)).toBe(true);
  });

  it("should reject targets below one", () => {
    expect(() => new Target(0)).toThrow(
      "Target score must be greater than zero.",
    );
  });
});
