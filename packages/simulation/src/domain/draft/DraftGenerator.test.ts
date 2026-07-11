import { describe, expect, it } from "vitest";

import { Country, PlayerRole } from "@cricket-clash/shared";

import { PlayerBuilder, TeamBuilder } from "../../test";

import { RandomGenerator } from "../../infrastructure/random";
import { DraftContext } from "./DraftContext";
import { DraftGenerator } from "./DraftGenerator";
import { DefaultCountrySelectionStrategy } from "./DefaultCountrySelectionStrategy";
import { DefaultRoleEligibilityStrategy } from "./DefaultRoleEligibilityStrategy";
import { PlayerPool } from "./PlayerPool";

describe("DraftGenerator", () => {
  it("should generate a complete team", () => {
    // Arrange

    const players = [
      ...createPlayers(Country.INDIA),
      ...createPlayers(Country.AUSTRALIA),
    ];

    const context = new DraftContext(
      new PlayerPool(players),
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const generator = new DraftGenerator(
      new DefaultCountrySelectionStrategy(),
      new DefaultRoleEligibilityStrategy(),
    );

    // Act

    const team = generator.generate(context);

    // Assert

    expect(team.playerCount()).toBe(11);
  });
  it("should not select duplicate players", () => {
    // Arrange

    const players = [
      ...createPlayers(Country.INDIA),
      ...createPlayers(Country.AUSTRALIA),
    ];

    const context = new DraftContext(
      new PlayerPool(players),
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const generator = new DraftGenerator(
      new DefaultCountrySelectionStrategy(),
      new DefaultRoleEligibilityStrategy(),
    );

    // Act

    const team = generator.generate(context);

    // Assert

    const selectedPlayerIds = team.selectedPlayerIds();

    expect(new Set(selectedPlayerIds).size).toBe(selectedPlayerIds.length);
  });

  it("should satisfy role limits", () => {
    // Arrange

    const players = [
      ...createPlayers(Country.INDIA),
      ...createPlayers(Country.AUSTRALIA),
    ];

    const context = new DraftContext(
      new PlayerPool(players),
      TeamBuilder.standard().build(),
      new RandomGenerator(42),
    );

    const generator = new DraftGenerator(
      new DefaultCountrySelectionStrategy(),
      new DefaultRoleEligibilityStrategy(),
    );

    // Act

    const team = generator.generate(context);

    // Assert

    expect(team.roleCount(PlayerRole.BATTER)).toBeGreaterThanOrEqual(3);

    expect(team.roleCount(PlayerRole.BATTER)).toBeLessThanOrEqual(5);

    expect(team.roleCount(PlayerRole.BOWLER)).toBeGreaterThanOrEqual(3);

    expect(team.roleCount(PlayerRole.BOWLER)).toBeLessThanOrEqual(5);

    expect(team.roleCount(PlayerRole.ALL_ROUNDER)).toBeGreaterThanOrEqual(1);

    expect(team.roleCount(PlayerRole.ALL_ROUNDER)).toBeLessThanOrEqual(3);

    expect(team.roleCount(PlayerRole.WICKET_KEEPER)).toBeGreaterThanOrEqual(1);

    expect(team.roleCount(PlayerRole.WICKET_KEEPER)).toBeLessThanOrEqual(3);
  });
});

function createPlayers(country: Country) {
  return [
    ...Array.from({ length: 10 }, (_, index) =>
      PlayerBuilder.batter()
        .named(`BAT-${country}-${index}`)
        .fromCountry(country)
        .build(),
    ),

    ...Array.from({ length: 10 }, (_, index) =>
      PlayerBuilder.bowler()
        .named(`BOWL-${country}-${index}`)
        .fromCountry(country)
        .build(),
    ),

    ...Array.from({ length: 10 }, (_, index) =>
      PlayerBuilder.allRounder()
        .named(`AR-${country}-${index}`)
        .fromCountry(country)
        .build(),
    ),

    ...Array.from({ length: 10 }, (_, index) =>
      PlayerBuilder.wicketKeeper()
        .named(`WK-${country}-${index}`)
        .fromCountry(country)
        .build(),
    ),
  ];
}
