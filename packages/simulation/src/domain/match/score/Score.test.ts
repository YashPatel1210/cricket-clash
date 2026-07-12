import { describe, expect, it } from "vitest";

import { Score } from "./Score";

describe("Score", () => {
  it("should create a score", () => {
    const score = new Score(100, 2, 60);

    expect(score).toBeDefined();
  });

  it("should expose runs", () => {
    const score = new Score(183, 6, 106);

    expect(score.getRuns()).toBe(183);
  });

  it("should expose wickets", () => {
    const score = new Score(183, 6, 106);

    expect(score.getWickets()).toBe(6);
  });

  it("should expose balls", () => {
    const score = new Score(183, 6, 106);

    expect(score.getBalls()).toBe(106);
  });

  it("should calculate completed overs", () => {
    expect(new Score(0, 0, 0).getOvers()).toBe("0.0");

    expect(new Score(0, 0, 1).getOvers()).toBe("0.1");

    expect(new Score(0, 0, 6).getOvers()).toBe("1.0");

    expect(new Score(0, 0, 7).getOvers()).toBe("1.1");

    expect(new Score(0, 0, 17).getOvers()).toBe("2.5");

    expect(new Score(0, 0, 20).getOvers()).toBe("3.2");
  });

  it("should identify all out", () => {
    expect(new Score(200, 10, 120).isAllOut()).toBe(true);

    expect(new Score(200, 9, 120).isAllOut()).toBe(false);
  });

  it("should reject negative runs", () => {
    expect(() => new Score(-1, 0, 0)).toThrow("Runs cannot be negative.");
  });

  it("should reject negative wickets", () => {
    expect(() => new Score(0, -1, 0)).toThrow(
      "Wickets must be between 0 and 10.",
    );
  });

  it("should reject more than ten wickets", () => {
    expect(() => new Score(0, 11, 0)).toThrow(
      "Wickets must be between 0 and 10.",
    );
  });

  it("should reject negative balls", () => {
    expect(() => new Score(0, 0, -1)).toThrow("Balls cannot be negative.");
  });
});
