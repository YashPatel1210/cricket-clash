import { describe, expect, it } from "vitest";

import { MatchRules } from "./MatchRules";

describe("MatchRules", () => {
  it("should expose maximum overs", () => {
    const rules = new MatchRules(20);

    expect(rules.getMaximumOvers()).toBe(20);
  });

  it("should default to six balls per over", () => {
    const rules = new MatchRules(20);

    expect(rules.getBallsPerOver()).toBe(6);
  });

  it("should calculate maximum balls", () => {
    const rules = new MatchRules(20);

    expect(rules.getMaximumBalls()).toBe(120);
  });

  it("should support custom balls per over", () => {
    const rules = new MatchRules(20, 5);

    expect(rules.getBallsPerOver()).toBe(5);

    expect(rules.getMaximumBalls()).toBe(100);
  });
});
