import { describe, expect, it } from "vitest";

import { MatchBuilder } from "./test";

import { SimulationEngine } from "./SimulationEngine";

describe("SimulationEngine", () => {
  it("should create a standard engine", () => {
    const engine = SimulationEngine.standard(42);

    expect(engine).toBeDefined();
  });

  it("should simulate a match", () => {
    const engine = SimulationEngine.standard(42);

    const result = engine.simulate(MatchBuilder.standard().build());

    expect(result).toBeDefined();
  });

  it("should produce a winner or tie", () => {
    const engine = SimulationEngine.standard(42);

    const result = engine.simulate(MatchBuilder.standard().build());

    expect(result.getFirstInnings()).toBeDefined();

    expect(result.getSecondInnings()).toBeDefined();
  });
});
