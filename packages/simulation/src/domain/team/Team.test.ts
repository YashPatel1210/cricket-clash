import { describe, expect, it } from "vitest";

import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { STANDARD_T20_TEAM_RULES } from "../rules";
import { Player } from "../player";
import { Team } from "./Team";
import { TeamSelection } from "./TeamSelection";
import { PlayerBuilder } from "../../test";
import { TeamBuilder } from "../../test";

describe("Team", () => {
  it("should add a valid player selection", () => {
    // Arrange
    const team = new Team(STANDARD_T20_TEAM_RULES);

    const virat = PlayerBuilder.batter().named("Virat Kohli").build();

    const selection = new TeamSelection(virat, 3, false, false);

    // Act
    const result = team.addSelection(selection);

    // Assert
    expect(result.success).toBe(true);
    expect(team.getSelections()).toHaveLength(1);
    expect(team.getSelections()[0]).toBe(selection);
  });

  it("should reject a twelfth player", () => {
    // Arrange
    const team = new Team(STANDARD_T20_TEAM_RULES);

    for (let i = 1; i <= 5; i++) {
      const virat = PlayerBuilder.batter().named("Virat Kohli").build();

      const selection = new TeamSelection(virat, i, false, false);
      team.addSelection(selection);
    }
    for (let i = 6; i <= 7; i++) {
      const hardik = PlayerBuilder.allRounder().named("Hardik Pandya").build();

      const allrounder = new TeamSelection(hardik, i, false, false);
      team.addSelection(allrounder);
    }
    for (let i = 8; i <= 11; i++) {
      const bumrah = PlayerBuilder.bowler()
        .named("Jasprit Bumrah")
        .withBowling(99)
        .build();

      const bowler = new TeamSelection(bumrah, i, false, false);
      team.addSelection(bowler);
    }

    // Twelfth player
    const virat = PlayerBuilder.batter().named("Virat Kohli").build();

    const extraSelection = new TeamSelection(virat, 12, false, false);

    // Act
    const result = team.addSelection(extraSelection);

    // Assert
    expect(result.success).toBe(false);
    expect(team.getSelections()).toHaveLength(11);
  });

  it("should reject duplicate batting positions", () => {
    // Arrange
    const team = new Team(STANDARD_T20_TEAM_RULES);

    const virat1 = PlayerBuilder.batter().named("Virat Kohli").build();

    const virat2 = PlayerBuilder.batter().named("Virat Kohli").build();

    team.addSelection(new TeamSelection(virat1, 3));

    // Act
    const result = team.addSelection(new TeamSelection(virat2, 3));

    // Assert
    expect(result.success).toBe(false);
    expect(team.getSelections()).toHaveLength(1);
  });

  it("should reject a second captain", () => {
    // Arrange
    const team = new Team(STANDARD_T20_TEAM_RULES);

    const rohit = PlayerBuilder.batter().named("Virat Kohli").build();

    const hardik = PlayerBuilder.allRounder().named("Hardik Pandya").build();

    team.addSelection(new TeamSelection(rohit, 1, true, false));

    // Act
    const result = team.addSelection(new TeamSelection(hardik, 6, true, false));

    // Assert
    expect(result.success).toBe(false);
    expect(team.getSelections()).toHaveLength(1);
  });

  it("should reject player when role limit is exceeded", () => {
    // Arrange
    const team = new Team(STANDARD_T20_TEAM_RULES);

    for (let i = 1; i <= 5; i++) {
      const virat = PlayerBuilder.batter().named("Virat Kohli").build();

      team.addSelection(new TeamSelection(virat, i, false, false));
    }

    const virat = PlayerBuilder.batter().named("Virat Kohli").build();
    // Act
    const result = team.addSelection(new TeamSelection(virat, 6, false, false));

    // Assert
    expect(result.success).toBe(false);
    expect(team.getSelections()).toHaveLength(5);
  });
  it("should expose selected players", () => {
    const team = TeamBuilder.standard().build();

    const player = PlayerBuilder.batter().build();

    team.addPlayer(player);

    expect(team.getPlayers()).toEqual([player]);
  });
  it("should expose captain", () => {
    const team = TeamBuilder.standard().build();

    const captain = PlayerBuilder.batter().build();

    team.addSelection(new TeamSelection(captain, 1, true));

    expect(team.getCaptain()).toBe(captain);
  });
});
