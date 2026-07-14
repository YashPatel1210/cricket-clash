import { PlayerRole } from "@cricket-clash/shared";

import { Team } from "../../domain/team";
import { TeamSelection } from "../../domain/team";
import { STANDARD_T20_TEAM_RULES } from "../../domain/rules";
import { PlayerBuilder } from "./PlayerBuilder";

export class TeamBuilder {
  private readonly selections: TeamSelection[] = [];

  private battingPosition = 1;

  public static standard(): TeamBuilder {
    return new TeamBuilder()
      .withBatters(4)
      .withAllRounders(2)
      .withBowlers(4)
      .withWicketKeepers(1);
  }

  public withBatters(count: number): TeamBuilder {
    for (let i = 0; i < count; i++) {
      this.add(PlayerRole.BATTER);
    }

    return this;
  }

  public withAllRounders(count: number): TeamBuilder {
    for (let i = 0; i < count; i++) {
      this.add(PlayerRole.ALL_ROUNDER);
    }

    return this;
  }

  public withBowlers(count: number): TeamBuilder {
    for (let i = 0; i < count; i++) {
      this.add(PlayerRole.BOWLER);
    }

    return this;
  }

  public withWicketKeepers(count: number): TeamBuilder {
    for (let i = 0; i < count; i++) {
      this.add(PlayerRole.WICKET_KEEPER);
    }

    return this;
  }

  public build(): Team {
    const team = new Team(STANDARD_T20_TEAM_RULES);

    for (const selection of this.selections) {
      const result = team.addSelection(selection);

      if (!result.success) {
        throw new Error("Some Error happened while adding selection");
      }
    }

    return team;
  }

  private add(role: PlayerRole): void {
    const player = this.createPlayer(role);

    this.selections.push(new TeamSelection(player, this.battingPosition++));
  }

  private createPlayer(role: PlayerRole) {
    switch (role) {
      case PlayerRole.BATTER:
        return PlayerBuilder.batter()
          .named(`Batter ${this.battingPosition}`)
          .build();

      case PlayerRole.ALL_ROUNDER:
        return PlayerBuilder.allRounder()
          .named(`All Rounder ${this.battingPosition}`)
          .build();

      case PlayerRole.BOWLER:
        return PlayerBuilder.bowler()
          .named(`Bowler ${this.battingPosition}`)
          .build();

      case PlayerRole.WICKET_KEEPER:
        return PlayerBuilder.wicketKeeper()
          .named(`Keeper ${this.battingPosition}`)
          .build();
    }
  }
}
