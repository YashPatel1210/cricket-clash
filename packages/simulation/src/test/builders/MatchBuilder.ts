import { Team } from "../../domain/team";

import {
  Match,
  MatchConditions,
  PitchType,
  Stadium,
  WeatherCondition,
} from "../../domain/match";

import { InningsResult } from "../../domain/match/innings";
import { Toss } from "../../domain/match/toss/Toss";

import { TeamBuilder } from "./TeamBuilder";

export class MatchBuilder {
  private teamA: Team = TeamBuilder.standard().build();

  private teamB: Team = TeamBuilder.standard().build();

  private conditions = new MatchConditions(
    PitchType.GREEN,
    WeatherCondition.SUNNY,
    new Stadium("MCG"),
  );

  private toss?: Toss;

  private firstInnings?: InningsResult;

  private secondInnings?: InningsResult;

  public static standard(): MatchBuilder {
    return new MatchBuilder();
  }

  public withTeamA(team: Team): MatchBuilder {
    this.teamA = team;
    return this;
  }

  public withTeamB(team: Team): MatchBuilder {
    this.teamB = team;
    return this;
  }

  public withConditions(conditions: MatchConditions): MatchBuilder {
    this.conditions = conditions;
    return this;
  }

  public withToss(toss: Toss): MatchBuilder {
    this.toss = toss;
    return this;
  }

  public withFirstInnings(innings: InningsResult): MatchBuilder {
    this.firstInnings = innings;
    return this;
  }

  public withSecondInnings(innings: InningsResult): MatchBuilder {
    this.secondInnings = innings;
    return this;
  }

  public build(): Match {
    return new Match(
      this.teamA,
      this.teamB,
      this.conditions,
      this.toss,
      this.firstInnings,
      this.secondInnings,
    );
  }
}
