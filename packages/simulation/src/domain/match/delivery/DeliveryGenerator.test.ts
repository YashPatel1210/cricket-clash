import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";
import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryGenerator } from "./DeliveryGenerator";

describe("DeliveryGenerator", () => {
  it("should generate a delivery", () => {
    const innings = InningsBuilder.standard().build();

    const generator = new DeliveryGenerator(new RandomGenerator(42));

    const delivery = generator.generate(innings);

    expect(delivery).toBeDefined();
  });
  it("should use the current batting pair", () => {
    const innings = InningsBuilder.standard().build();

    const generator = new DeliveryGenerator(new RandomGenerator(42));

    const delivery = generator.generate(innings);

    expect(delivery.getBattingPair()).toBe(innings.getBattingPair());
  });
  it("should use the current bowling spell", () => {
    const innings = InningsBuilder.standard().build();

    const generator = new DeliveryGenerator(new RandomGenerator(42));

    const delivery = generator.generate(innings);

    expect(delivery.getBowlingSpell()).toBe(innings.getBowlingSpell());
  });
  it("should generate deterministic events for the same seed", () => {
    const innings = InningsBuilder.standard().build();

    const first = new DeliveryGenerator(new RandomGenerator(42));

    const second = new DeliveryGenerator(new RandomGenerator(42));

    expect(first.generate(innings).getEvent().getOutcome()).toBe(
      second.generate(innings).getEvent().getOutcome(),
    );
  });
  it("should generate a legal delivery", () => {
    const innings = InningsBuilder.standard().build();

    const generator = new DeliveryGenerator(new RandomGenerator(42));

    const delivery = generator.generate(innings);

    expect(delivery.getEvent().isLegal()).toBe(true);
  });
});
