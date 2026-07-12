import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";

import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryGenerator } from "../delivery/DeliveryGenerator";
import { InningsProcessor } from "../innings";

import { OverEngine } from "./OverEngine";

describe("OverEngine", () => {
  it("should simulate a complete over", () => {
    const innings = InningsBuilder.standard().build();

    const engine = new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const result = engine.simulate(innings);

    expect(result.getOver().isCompleted()).toBe(true);
  });

  it("should contain six legal deliveries", () => {
    const innings = InningsBuilder.standard().build();

    const engine = new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const result = engine.simulate(innings);

    expect(result.getOver().legalBallCount()).toBe(6);
  });

  it("should update the innings score", () => {
    const innings = InningsBuilder.standard().build();

    const engine = new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const result = engine.simulate(innings);

    expect(result.getInnings().getScore().getBalls()).toBe(6);
  });

  it("should update the bowling spell", () => {
    const innings = InningsBuilder.standard().build();

    const engine = new OverEngine(
      new DeliveryGenerator(new RandomGenerator(42)),
      new InningsProcessor(),
    );

    const result = engine.simulate(innings);

    expect(result.getInnings().getBowlingSpell().getBallsBowled()).toBe(6);
  });
});
