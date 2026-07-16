import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";
import { BattingPair } from "./BattingPair";
import { DeliveryEventFactory } from "../delivery/DeliveryEventFactory";
import { DeliveryOutcome } from "../delivery/DeliveryOutcome";
import { Delivery } from "../delivery/Delivery";

import { BowlingSpell } from "./BowlingSpell";

const factory = new DeliveryEventFactory();

function makeDelivery(spell: BowlingSpell, outcome: DeliveryOutcome): Delivery {
  return new Delivery(
    spell,
    new BattingPair(PlayerBuilder.batter().build(), PlayerBuilder.batter().build()),
    factory.create(outcome),
  );
}

describe("BowlingSpell", () => {
  it("should create a bowling spell", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);
    expect(spell).toBeDefined();
  });

  it("should expose bowler", () => {
    const bowler = PlayerBuilder.bowler().build();
    const spell = new BowlingSpell(bowler, 0);
    expect(spell.getBowler()).toBe(bowler);
  });

  it("should expose balls bowled", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 18);
    expect(spell.getBallsBowled()).toBe(18);
  });

  it("should calculate completed overs", () => {
    expect(new BowlingSpell(PlayerBuilder.bowler().build(), 0).getOversBowled()).toBe("0.0");
    expect(new BowlingSpell(PlayerBuilder.bowler().build(), 7).getOversBowled()).toBe("1.1");
    expect(new BowlingSpell(PlayerBuilder.bowler().build(), 20).getOversBowled()).toBe("3.2");
  });

  it("should reject negative balls", () => {
    expect(() => new BowlingSpell(PlayerBuilder.bowler().build(), -1)).toThrow(
      "Balls bowled cannot be negative.",
    );
  });

  it("should return a new spell after delivering one ball", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);
    const delivery = makeDelivery(spell, DeliveryOutcome.DOT);
    const updated = spell.afterDelivery(delivery);
    expect(updated.getBallsBowled()).toBe(1);
    expect(spell.getBallsBowled()).toBe(0);
  });

  it("should track runs conceded", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);
    const delivery = makeDelivery(spell, DeliveryOutcome.FOUR);
    const updated = spell.afterDelivery(delivery);
    expect(updated.getRunsConceded()).toBe(4);
  });

  it("should track wickets taken", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);
    const delivery = makeDelivery(spell, DeliveryOutcome.WICKET);
    const updated = spell.afterDelivery(delivery);
    expect(updated.getWicketsTaken()).toBe(1);
  });
});
