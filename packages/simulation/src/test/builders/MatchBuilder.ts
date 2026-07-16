import { Team } from "../../domain/team";

import {
  Match,
  MatchConditions,
  PitchType,
  Stadium,
  WeatherCondition,
} from "../../domain/match";

import { MatchConfiguration } from "../../domain/match/configuration/MatchConfiguration";
import { T20Configuration } from "../../domain/match/configuration/T20Configuration";
import { InningsResult } from "../../domain/match/innings";
import { Toss } from "../../domain/match/toss/Toss";

import { TeamBuilder } from "./TeamBuilder";

export class MatchBuilder {
  private teamA: Team = TeamBuilder.standard().build();

  private teamB: Team = TeamBuilder.standard().build();

  private conditions = new MatchConditions(
    PitchType.FLAT,
    WeatherCondition.SUNNY,
    new Stadium("MCG"),
  );

  private configuration: MatchConfiguration = new T20Configuration();

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

  public withConfiguration(configuration: MatchConfiguration): MatchBuilder {
    this.configuration = configuration;
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
    let match = new Match(
      this.teamA,
      this.teamB,
      this.conditions,
      this.configuration,
    );

    if (this.toss) {
      match = match.withToss(this.toss);
    }

    if (this.firstInnings) {
      match = match.withFirstInnings(this.firstInnings);
    }

    if (this.secondInnings) {
      match = match.withSecondInnings(this.secondInnings);
    }

    return match;
  }
}
