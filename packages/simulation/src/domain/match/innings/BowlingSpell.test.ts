import { describe, expect, it } from "vitest";

import { PlayerBuilder } from "../../../test";

import { BowlingSpell } from "./BowlingSpell";

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
    expect(
      new BowlingSpell(PlayerBuilder.bowler().build(), 0).getOversBowled(),
    ).toBe("0.0");

    expect(
      new BowlingSpell(PlayerBuilder.bowler().build(), 7).getOversBowled(),
    ).toBe("1.1");

    expect(
      new BowlingSpell(PlayerBuilder.bowler().build(), 20).getOversBowled(),
    ).toBe("3.2");
  });

  it("should reject negative balls", () => {
    expect(() => new BowlingSpell(PlayerBuilder.bowler().build(), -1)).toThrow(
      "Balls bowled cannot be negative.",
    );
  });

  it("should return a new spell after bowling one ball", () => {
    const spell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);

    const updated = spell.afterBall();

    expect(updated.getBallsBowled()).toBe(1);

    expect(spell.getBallsBowled()).toBe(0);
  });
});
