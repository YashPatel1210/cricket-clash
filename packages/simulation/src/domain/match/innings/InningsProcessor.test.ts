import { describe, expect, it } from "vitest";

import { InningsBuilder, PlayerBuilder } from "../../../test";

import { Delivery } from "../delivery";
import { DeliveryEventFactory } from "../delivery/DeliveryEventFactory";
import { DeliveryOutcome } from "../delivery";
import { DismissalType } from "../delivery/DismissalType";
import { InningsProcessor } from "./InningsProcessor";
import { Score } from "../score";
import { BattingPair } from "./BattingPair";
import { BattingOrder } from "./BattingOrder";

const factory = new DeliveryEventFactory();

function makeDelivery(
  innings: ReturnType<typeof InningsBuilder.prototype.build>,
  outcome: DeliveryOutcome,
): Delivery {
  return new Delivery(
    innings.getBowlingSpell(),
    innings.getBattingPair(),
    factory.create(outcome),
  );
}

describe("InningsProcessor", () => {
  it("should return a new innings instance", () => {
    const innings = InningsBuilder.standard().build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.DOT));
    expect(updated).not.toBe(innings);
  });

  it("should add runs to the score for a four", () => {
    const innings = InningsBuilder.standard().withScore(new Score(100, 2, 60)).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.FOUR));
    expect(updated.getScore().getRuns()).toBe(104);
    expect(updated.getScore().getBalls()).toBe(61);
  });

  it("should rotate strike after a single", () => {
    const innings = InningsBuilder.standard().build();
    const striker = innings.getBattingPair().getStriker();
    const nonStriker = innings.getBattingPair().getNonStriker();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.ONE));
    expect(updated.getBattingPair().getStriker()).toBe(nonStriker);
    expect(updated.getBattingPair().getNonStriker()).toBe(striker);
  });

  it("should increment wickets after a WICKET", () => {
    const innings = InningsBuilder.standard().withScore(new Score(100, 2, 60)).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WICKET));
    expect(updated.getScore().getWickets()).toBe(3);
    expect(updated.getScore().getBalls()).toBe(61);
  });

  it("should replace striker after a wicket", () => {
    const pair  = new BattingPair(PlayerBuilder.batter().named("Rohit").build(), PlayerBuilder.batter().named("Gill").build());
    const order = new BattingOrder([PlayerBuilder.batter().named("Kohli").build()]);
    const innings = InningsBuilder.standard().withBattingPair(pair).withBattingOrder(order).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WICKET));
    expect(updated.getBattingPair().getStriker().name).toBe("Kohli");
    expect(updated.getBattingPair().getNonStriker().name).toBe("Gill");
  });

  it("should mark batter as out with dismissal type after WICKET", () => {
    const innings = InningsBuilder.standard().withScore(new Score(100, 2, 60)).build();
    const striker = innings.getBattingPair().getStriker();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WICKET));
    const record = updated.getStatistics().getBatterRecord(striker);
    expect(record.isOut()).toBe(true);
    expect(record.getDismissalType()).toBeDefined();
  });

  it("should credit bowler wicket for WICKET outcome", () => {
    const innings = InningsBuilder.standard().withScore(new Score(100, 2, 60)).build();
    const bowler = innings.getBowlingSpell().getBowler();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WICKET));
    expect(updated.getStatistics().getBowlerRecord(bowler).getWickets()).toBe(1);
  });

  it("should NOT credit bowler wicket for RUN_OUT", () => {
    const innings = InningsBuilder.standard().withScore(new Score(100, 2, 60)).build();
    const bowler = innings.getBowlingSpell().getBowler();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.RUN_OUT));
    expect(updated.getStatistics().getBowlerRecord(bowler).getWickets()).toBe(0);
  });

  // ── Extras ────────────────────────────────────────────────────────────

  it("should add 1 run for WIDE but NOT advance ball count", () => {
    const innings = InningsBuilder.standard().withScore(new Score(0, 0, 0)).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WIDE));
    expect(updated.getScore().getRuns()).toBe(1);
    expect(updated.getScore().getBalls()).toBe(0);   // ball NOT advanced
    expect(updated.getStatistics().getExtras().getWides()).toBe(1);
  });

  it("should add 1 run for NO_BALL but NOT advance ball count", () => {
    const innings = InningsBuilder.standard().withScore(new Score(0, 0, 0)).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.NO_BALL));
    expect(updated.getScore().getRuns()).toBe(1);
    expect(updated.getScore().getBalls()).toBe(0);   // ball NOT advanced
    expect(updated.getStatistics().getExtras().getNoBalls()).toBe(1);
  });

  it("should add runs for BYE and advance ball count, but not credit batter", () => {
    const innings = InningsBuilder.standard().withScore(new Score(0, 0, 0)).build();
    const striker = innings.getBattingPair().getStriker();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.BYE));
    expect(updated.getScore().getRuns()).toBe(1);
    expect(updated.getScore().getBalls()).toBe(1);   // ball advanced
    expect(updated.getStatistics().getExtras().getByes()).toBe(1);
    // Batter gets ball faced but 0 runs
    expect(updated.getStatistics().getBatterRecord(striker).getRuns()).toBe(0);
    expect(updated.getStatistics().getBatterRecord(striker).getBalls()).toBe(1);
  });

  it("should add runs for LEG_BYE and advance ball count, but not credit batter", () => {
    const innings = InningsBuilder.standard().withScore(new Score(0, 0, 0)).build();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.LEG_BYE));
    expect(updated.getScore().getRuns()).toBe(1);
    expect(updated.getScore().getBalls()).toBe(1);
    expect(updated.getStatistics().getExtras().getLegByes()).toBe(1);
  });

  it("should charge wide runs to bowler economy but not as a ball", () => {
    const innings = InningsBuilder.standard().build();
    const bowler = innings.getBowlingSpell().getBowler();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WIDE));
    const bowlerRecord = updated.getStatistics().getBowlerRecord(bowler);
    expect(bowlerRecord.getRuns()).toBe(1);     // economy hurt
    expect(bowlerRecord.getBalls()).toBe(0);    // not a ball in figures
    expect(bowlerRecord.getWides()).toBe(1);
  });

  it("should NOT count wide as ball faced by batter", () => {
    const innings = InningsBuilder.standard().build();
    const striker = innings.getBattingPair().getStriker();
    const updated = new InningsProcessor().process(innings, makeDelivery(innings, DeliveryOutcome.WIDE));
    expect(updated.getStatistics().getBatterRecord(striker).getBalls()).toBe(0);
  });
});
