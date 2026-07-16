import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";
import { BattingPair } from "../innings/BattingPair";
import { BowlingSpell } from "../innings/BowlingSpell";

import { Delivery } from "./Delivery";
import { DeliveryEventFactory } from "./DeliveryEventFactory";
import { DeliveryOutcome } from "./DeliveryOutcome";

const factory = new DeliveryEventFactory();

describe("Delivery", () => {
  function createDelivery(outcome: DeliveryOutcome): Delivery {
    return new Delivery(
      new BowlingSpell(PlayerBuilder.bowler().build(), 0),
      new BattingPair(
        PlayerBuilder.batter().build(),
        PlayerBuilder.batter().build(),
      ),
      factory.create(outcome),
    );
  }

  it("should create a delivery", () => {
    expect(createDelivery(DeliveryOutcome.DOT)).toBeDefined();
  });

  it("should expose bowling spell", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);

    const delivery = new Delivery(
      spell,
      new BattingPair(
        PlayerBuilder.batter().build(),
        PlayerBuilder.batter().build(),
      ),
      factory.create(DeliveryOutcome.DOT),
    );

    expect(delivery.getBowlingSpell()).toBe(spell);
  });

  it("should expose batting pair", () => {
    const pair = new BattingPair(
      PlayerBuilder.batter().build(),
      PlayerBuilder.batter().build(),
    );

    const delivery = new Delivery(
      new BowlingSpell(PlayerBuilder.bowler().build(), 0),
      pair,
      factory.create(DeliveryOutcome.DOT),
    );

    expect(delivery.getBattingPair()).toBe(pair);
  });

  it("should expose outcome via event", () => {
    expect(createDelivery(DeliveryOutcome.FOUR).getEvent().getOutcome()).toBe(
      DeliveryOutcome.FOUR,
    );
  });

  it("should calculate runs", () => {
    expect(createDelivery(DeliveryOutcome.DOT).runs()).toBe(0);
    expect(createDelivery(DeliveryOutcome.ONE).runs()).toBe(1);
    expect(createDelivery(DeliveryOutcome.TWO).runs()).toBe(2);
    expect(createDelivery(DeliveryOutcome.THREE).runs()).toBe(3);
    expect(createDelivery(DeliveryOutcome.FOUR).runs()).toBe(4);
    expect(createDelivery(DeliveryOutcome.SIX).runs()).toBe(6);
    expect(createDelivery(DeliveryOutcome.WICKET).runs()).toBe(0);
  });

  it("should identify boundaries", () => {
    expect(createDelivery(DeliveryOutcome.FOUR).isBoundary()).toBe(true);
    expect(createDelivery(DeliveryOutcome.SIX).isBoundary()).toBe(true);
    expect(createDelivery(DeliveryOutcome.ONE).isBoundary()).toBe(false);
  });

  it("should identify wickets", () => {
    expect(createDelivery(DeliveryOutcome.WICKET).isWicket()).toBe(true);
    expect(createDelivery(DeliveryOutcome.ONE).isWicket()).toBe(false);
  });

  it("should identify dot balls", () => {
    expect(createDelivery(DeliveryOutcome.DOT).isDotBall()).toBe(true);
    expect(createDelivery(DeliveryOutcome.ONE).isDotBall()).toBe(false);
  });
});
