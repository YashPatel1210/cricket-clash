import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";

import { Delivery } from "../delivery";
import { DeliveryEvent } from "../delivery/DeliveryEvent";
import { DeliveryOutcome } from "../delivery";

import { Over } from "./Over";

describe("Over", () => {
  function createDelivery(
    outcome: DeliveryOutcome = DeliveryOutcome.DOT,
  ): Delivery {
    const innings = InningsBuilder.standard().build();

    return new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      new DeliveryEvent(
        outcome,
        outcome === DeliveryOutcome.FOUR
          ? 4
          : outcome === DeliveryOutcome.SIX
            ? 6
            : outcome === DeliveryOutcome.THREE
              ? 3
              : outcome === DeliveryOutcome.TWO
                ? 2
                : outcome === DeliveryOutcome.ONE
                  ? 1
                  : 0,
        true,
      ),
    );
  }

  it("should create an over", () => {
    const over = new Over([]);

    expect(over).toBeDefined();
  });

  it("should expose deliveries", () => {
    const deliveries = [createDelivery(), createDelivery()];

    const over = new Over(deliveries);

    expect(over.getDeliveries()).toEqual(deliveries);
  });

  it("should report the legal ball count", () => {
    const over = new Over([
      createDelivery(),
      createDelivery(),
      createDelivery(),
    ]);

    expect(over.legalBallCount()).toBe(3);
  });

  it("should identify an incomplete over", () => {
    const over = new Over([createDelivery(), createDelivery()]);

    expect(over.isCompleted()).toBe(false);
  });

  it("should identify a completed over", () => {
    const over = new Over([
      createDelivery(),
      createDelivery(),
      createDelivery(),
      createDelivery(),
      createDelivery(),
      createDelivery(),
    ]);

    expect(over.isCompleted()).toBe(true);
  });

  it("should reject more than six legal deliveries", () => {
    expect(
      () =>
        new Over([
          createDelivery(),
          createDelivery(),
          createDelivery(),
          createDelivery(),
          createDelivery(),
          createDelivery(),
          createDelivery(),
        ]),
    ).toThrow("An over cannot contain more than six legal deliveries.");
  });

  it("should return a new over after adding a delivery", () => {
    const over = new Over([]);

    const updated = over.afterDelivery(createDelivery());

    expect(updated.legalBallCount()).toBe(1);

    expect(over.legalBallCount()).toBe(0);
  });
});
