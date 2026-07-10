import { describe, expect, it } from "vitest";

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "../player";
import { TeamSelection } from "./TeamSelection";
import { PlayerBuilder } from "../../test";

describe("TeamSelection", () => {
  it("should assign a player to a batting position", () => {
    // Arrange
    const virat = PlayerBuilder
    .batter()
    .named("Virat Kohli")
    .build();

    // Act
    const selection = new TeamSelection(
      virat,
      3,
      false,
      false,
    );

    // Assert
    expect(selection.player).toBe(virat);
    expect(selection.battingPosition).toBe(3);
    expect(selection.isCaptain).toBe(false);
    expect(selection.isWicketKeeper).toBe(false);
  });
});