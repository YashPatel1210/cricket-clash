import { describe, expect, it } from "vitest";

import { InningsBuilder, PlayerBuilder } from "../../../test";

import { Delivery } from "../delivery";
import { DeliveryEvent } from "../delivery/DeliveryEvent";
import { DeliveryEventFactory } from "../delivery/DeliveryEventFactory";
import { DeliveryOutcome } from "../delivery";
import { InningsProcessor } from "./InningsProcessor";
import { Score } from "../score";
import { BattingPair } from "./BattingPair";
import { BattingOrder } from "./BattingOrder";

const factory = new DeliveryEventFactory();

function makeDelivery(innings: ReturnType<typeof InningsBuilder.prototype.build>, outcome: DeliveryOutcome): Delivery {
  return new Delivery(
    innings.getBowlingSpell(),
    innings.getBattingPair(),
    factory.create(outcome),
  );
}

describe("InningsProcessor", () => {
  it("should return a new innings instance", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard().build();
    const delivery = makeDelivery(innings, DeliveryOutcome.DOT);
    const updated = processor.process(innings, delivery);
    expect(updated).not.toBe(innings);
  });

  it("should add runs to the score", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();
    const delivery = makeDelivery(innings, DeliveryOutcome.FOUR);
    const updated = processor.process(innings, delivery);
    expect(updated.getScore().getRuns()).toBe(104);
    expect(updated.getScore().getBalls()).toBe(61);
  });

  it("should rotate strike after a single", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard().build();
    const striker = innings.getBattingPair().getStriker();
    const nonStriker = innings.getBattingPair().getNonStriker();
    const delivery = makeDelivery(innings, DeliveryOutcome.ONE);
    const updated = processor.process(innings, delivery);
    expect(updated.getBattingPair().getStriker()).toBe(nonStriker);
    expect(updated.getBattingPair().getNonStriker()).toBe(striker);
  });

  it("should increment wickets after a wicket", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();
    const delivery = makeDelivery(innings, DeliveryOutcome.WICKET);
    const updated = processor.process(innings, delivery);
    expect(updated.getScore().getWickets()).toBe(3);
    expect(updated.getScore().getBalls()).toBe(61);
  });

  it("should replace the striker after a wicket", () => {
    const processor = new InningsProcessor();
    const striker = PlayerBuilder.batter().named("Rohit").build();
    const nonStriker = PlayerBuilder.batter().named("Gill").build();
    const nextBatter = PlayerBuilder.batter().named("Kohli").build();
    const pair = new BattingPair(striker, nonStriker);
    const order = new BattingOrder([nextBatter]);
    const innings = InningsBuilder.standard()
      .withBattingPair(pair)
      .withBattingOrder(order)
      .build();
    const delivery = makeDelivery(innings, DeliveryOutcome.WICKET);
    const updated = processor.process(innings, delivery);
    expect(updated.getBattingPair().getStriker()).toBe(nextBatter);
    expect(updated.getBattingPair().getNonStriker()).toBe(nonStriker);
    expect(updated.getBattingOrder().remaining()).toHaveLength(0);
  });

  it("should track statistics for the striker", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard().build();
    const striker = innings.getBattingPair().getStriker();
    const delivery = makeDelivery(innings, DeliveryOutcome.FOUR);
    const updated = processor.process(innings, delivery);
    const record = updated.getStatistics().getBatterRecord(striker);
    expect(record.getRuns()).toBe(4);
    expect(record.getFours()).toBe(1);
    expect(record.getBalls()).toBe(1);
  });

  it("should track wicket in batter record", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();
    const striker = innings.getBattingPair().getStriker();
    const delivery = makeDelivery(innings, DeliveryOutcome.WICKET);
    const updated = processor.process(innings, delivery);
    const record = updated.getStatistics().getBatterRecord(striker);
    expect(record.isOut()).toBe(true);
  });

  it("should track wicket in bowler record", () => {
    const processor = new InningsProcessor();
    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();
    const bowler = innings.getBowlingSpell().getBowler();
    const delivery = makeDelivery(innings, DeliveryOutcome.WICKET);
    const updated = processor.process(innings, delivery);
    const record = updated.getStatistics().getBowlerRecord(bowler);
    expect(record.getWickets()).toBe(1);
  });
});
