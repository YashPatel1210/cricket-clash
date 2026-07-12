import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";
import { PlayerBuilder } from "../../../test";
import { Delivery } from "../delivery";
import { DeliveryOutcome } from "../delivery";
import { InningsProcessor } from "./InningsProcessor";
import { Score } from "../score";
import { BattingPair } from "./BattingPair";
import { BattingOrder } from "./BattingOrder";

describe("InningsProcessor", () => {
  it("should return a new innings instance", () => {
    const processor = new InningsProcessor();

    const innings = InningsBuilder.standard().build();

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.DOT,
    );

    const updated = processor.process(innings, delivery);

    expect(updated).not.toBe(innings);
  });

  it("should increment balls after every legal delivery", () => {
    const processor = new InningsProcessor();

    const innings = InningsBuilder.standard().withBallsBowled(17).build();

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.DOT,
    );

    const updated = processor.process(innings, delivery);

    expect(updated.getBowlingSpell().getBallsBowled()).toBe(18);

    expect(updated.getScore().getBalls()).toBe(1);
  });

  it("should add runs to the score", () => {
    const processor = new InningsProcessor();

    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.FOUR,
    );

    const updated = processor.process(innings, delivery);

    expect(updated.getScore().getRuns()).toBe(104);

    expect(updated.getScore().getBalls()).toBe(61);
  });

  it("should rotate strike after a single", () => {
    const processor = new InningsProcessor();

    const innings = InningsBuilder.standard().build();

    const striker = innings.getBattingPair().getStriker();

    const nonStriker = innings.getBattingPair().getNonStriker();

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.ONE,
    );

    const updated = processor.process(innings, delivery);

    expect(updated.getBattingPair().getStriker()).toBe(nonStriker);

    expect(updated.getBattingPair().getNonStriker()).toBe(striker);
  });

  it("should increment wickets after a wicket", () => {
    const processor = new InningsProcessor();

    const innings = InningsBuilder.standard()
      .withScore(new Score(100, 2, 60))
      .build();

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.WICKET,
    );

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

    const delivery = new Delivery(
      innings.getBowlingSpell(),
      innings.getBattingPair(),
      DeliveryOutcome.WICKET,
    );

    const updated = processor.process(innings, delivery);

    expect(updated.getBattingPair().getStriker()).toBe(nextBatter);

    expect(updated.getBattingPair().getNonStriker()).toBe(nonStriker);

    expect(updated.getBattingOrder().remaining()).toHaveLength(0);
  });
});
