import { describe, expect, it } from "vitest";
import { PlayerRole } from "@cricket-clash/shared";

import { PlayerBuilder } from "../../test/builders/PlayerBuilder";
import { BattingPosition } from "./BattingPosition";
import { DraftSquad } from "./DraftSquad";
import { T20_SQUAD_RULES } from "./SquadCompositionRules";

const batter   = () => PlayerBuilder.batter().build();
const bowler   = () => PlayerBuilder.bowler().build();
const keeper   = () => PlayerBuilder.wicketKeeper().build();
const allRounder = () => PlayerBuilder.allRounder().build();

describe("DraftSquad", () => {
  it("should start empty", () => {
    const squad = DraftSquad.empty();
    expect(squad.size()).toBe(0);
    expect(squad.isComplete()).toBe(false);
  });

  it("should allow batter at position 3", () => {
    const squad = DraftSquad.empty();
    const p = batter();
    const result = squad.canPick(p, BattingPosition.of(3));
    expect(result.valid).toBe(true);
  });

  it("should reject batter at position 9 (out of range)", () => {
    const squad = DraftSquad.empty();
    const result = squad.canPick(batter(), BattingPosition.of(9));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("POSITION_OUT_OF_RANGE");
  });

  it("should reject bowler at position 1 (out of range)", () => {
    const squad = DraftSquad.empty();
    const result = squad.canPick(bowler(), BattingPosition.of(1));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("POSITION_OUT_OF_RANGE");
  });

  it("should allow bowler at position 9", () => {
    const squad = DraftSquad.empty();
    const result = squad.canPick(bowler(), BattingPosition.of(9));
    expect(result.valid).toBe(true);
  });

  it("should reject duplicate position", () => {
    const squad = DraftSquad.empty().pick(batter(), BattingPosition.of(3));
    const result = squad.canPick(batter(), BattingPosition.of(3));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("POSITION_OCCUPIED");
  });

  it("should reject same player twice", () => {
    const p = batter();
    const squad = DraftSquad.empty().pick(p, BattingPosition.of(3));
    const result = squad.canPick(p, BattingPosition.of(4));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("PLAYER_ALREADY_IN_SQUAD");
  });

  it("should reject when batter role limit reached (max 6)", () => {
    let squad = DraftSquad.empty();
    for (let i = 1; i <= 6; i++) {
      squad = squad.pick(batter(), BattingPosition.of(i));
    }
    const result = squad.canPick(batter(), BattingPosition.of(7));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("ROLE_LIMIT_REACHED");
  });

  it("should complete after 11 valid picks", () => {
    let squad = DraftSquad.empty(T20_SQUAD_RULES);

    // 4 batters (pos 1-4), 1 WK (pos 5), 2 all-rounders (pos 6-7), 4 bowlers (pos 8-11)
    for (let i = 1; i <= 4; i++) squad = squad.pick(batter(), BattingPosition.of(i));
    squad = squad.pick(keeper(), BattingPosition.of(5));
    for (let i = 6; i <= 7; i++) squad = squad.pick(allRounder(), BattingPosition.of(i));
    for (let i = 8; i <= 11; i++) squad = squad.pick(bowler(), BattingPosition.of(i));

    expect(squad.isComplete()).toBe(true);
    expect(squad.size()).toBe(11);
  });

  it("should return eligible positions for allrounder", () => {
    const squad    = DraftSquad.empty();
    const eligible = squad.eligiblePositionsFor(allRounder());
    const values   = eligible.map((p) => p.getValue());
    expect(Math.min(...values)).toBe(4);
    expect(Math.max(...values)).toBe(9);
  });
});
