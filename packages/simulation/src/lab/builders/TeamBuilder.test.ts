import { describe, expect, it } from "vitest";

import { TeamSelection } from "../../domain/team";
import { PlayerBuilder } from "./PlayerBuilder";
import { TeamBuilder } from "./TeamBuilder";

describe("TeamBuilder", () => {
  it("should build a team with one player", () => {
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const team = TeamBuilder
      .standard()
      .withPlayer(
        new TeamSelection(
          virat,
          3,
          false,
          false,
        ),
      )
      .build();

    expect(team.getSelections()).toHaveLength(1);
  });
});