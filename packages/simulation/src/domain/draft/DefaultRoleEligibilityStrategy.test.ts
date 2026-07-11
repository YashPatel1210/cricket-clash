import { describe, expect, it } from "vitest";

import { PlayerRole } from "@cricket-clash/shared";

import { TeamBuilder } from "../../test";
import { PlayerPool } from "./PlayerPool";
import { DraftContext } from "./DraftContext";
import { RandomGenerator } from "../../infrastructure/random";
import { DefaultRoleEligibilityStrategy } from "./DefaultRoleEligibilityStrategy";

describe("DefaultRoleEligibilityStrategy", () => {
  it("should return every role for an empty team", () => {
    // Arrange
    const team = TeamBuilder.standard().build();

    const context = new DraftContext(
      new PlayerPool([]),
      team,
      new RandomGenerator(42),
    );

    const strategy = new DefaultRoleEligibilityStrategy();

    // Act
    const roles = strategy.availableRoles(context);

    // Assert
    expect(roles).toEqual([
      PlayerRole.BATTER,
      PlayerRole.ALL_ROUNDER,
      PlayerRole.BOWLER,
      PlayerRole.WICKET_KEEPER,
    ]);
  });
  it("should prioritize roles below the minimum", () => {
    // Arrange
    const team = TeamBuilder.standard()
      .withBatters(3)
      .withAllRounders(1)
      .withBowlers(2)
      .withWicketKeepers(1)
      .build();

    const context = new DraftContext(
      new PlayerPool([]),
      team,
      new RandomGenerator(42),
    );

    const strategy = new DefaultRoleEligibilityStrategy();

    // Act
    const roles = strategy.availableRoles(context);

    // Assert
    expect(roles).toEqual([PlayerRole.BOWLER]);
  });
});
