import { describe, expect, it } from "vitest";

import { RandomGenerator } from "../../../infrastructure/random";

import { DeliveryOutcome } from "./DeliveryOutcome";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { OutcomeSelector } from "./OutcomeSelector";
import { OutcomeWeight } from "./OutcomeWeight";

describe("OutcomeSelector", () => {
  it("should select the only available outcome", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.FOUR, 1),
    ]);

    const selector = new OutcomeSelector(new RandomGenerator(42), distribution);

    expect(selector.select()).toBe(DeliveryOutcome.FOUR);
  });

  it("should always return a configured outcome", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.ONE, 1),
      new OutcomeWeight(DeliveryOutcome.FOUR, 1),
    ]);

    const selector = new OutcomeSelector(new RandomGenerator(42), distribution);

    const outcome = selector.select();

    expect([DeliveryOutcome.ONE, DeliveryOutcome.FOUR]).toContain(outcome);
  });

  it("should eventually select every configured outcome", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.ONE, 1),
      new OutcomeWeight(DeliveryOutcome.FOUR, 1),
      new OutcomeWeight(DeliveryOutcome.WICKET, 1),
    ]);

    const selector = new OutcomeSelector(new RandomGenerator(42), distribution);

    const outcomes = new Set<DeliveryOutcome>();

    for (let i = 0; i < 200; i++) {
      outcomes.add(selector.select());
    }

    expect(outcomes).toEqual(
      new Set([
        DeliveryOutcome.ONE,
        DeliveryOutcome.FOUR,
        DeliveryOutcome.WICKET,
      ]),
    );
  });

  it("should favor outcomes with higher weights", () => {
    const distribution = new OutcomeDistribution([
      new OutcomeWeight(DeliveryOutcome.DOT, 90),
      new OutcomeWeight(DeliveryOutcome.SIX, 10),
    ]);

    const selector = new OutcomeSelector(new RandomGenerator(42), distribution);

    let dots = 0;
    let sixes = 0;

    for (let i = 0; i < 1000; i++) {
      if (selector.select() === DeliveryOutcome.DOT) {
        dots++;
      } else {
        sixes++;
      }
    }

    expect(dots).toBeGreaterThan(sixes);
  });
});
