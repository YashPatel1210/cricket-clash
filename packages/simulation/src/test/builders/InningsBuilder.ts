import { Team } from "../../domain/team";
import { Player } from "../../domain/player";
import { Match } from "../../domain/match";

import {
  BattingOrder,
  BattingPair,
  BowlingAttack,
  BowlingOrder,
  Innings,
} from "../../domain/match/innings";

import { Score } from "../../domain/match/score";

import { PlayerBuilder, TeamBuilder } from ".";

export class InningsBuilder {
  private battingTeam = TeamBuilder.standard().build();

  private bowlingTeam = TeamBuilder.standard().build();

  private score = new Score(0, 0, 0);

  private battingPair = new BattingPair(
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
  );

  private bowlingAttack = BowlingAttack.create(
    new BowlingOrder([PlayerBuilder.bowler().build()]),
  );

  private battingOrder = new BattingOrder([
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
  ]);

  public static standard(): InningsBuilder {
    return new InningsBuilder();
  }

  public withBattingTeam(team: Team): InningsBuilder {
    this.battingTeam = team;
    return this;
  }

  public withBowlingTeam(team: Team): InningsBuilder {
    this.bowlingTeam = team;
    return this;
  }

  public withBattingPair(pair: BattingPair): InningsBuilder {
    this.battingPair = pair;
    return this;
  }

  public withBattingOrder(order: BattingOrder): InningsBuilder {
    this.battingOrder = order;
    return this;
  }

  public withBowlingAttack(attack: BowlingAttack): InningsBuilder {
    this.bowlingAttack = attack;
    return this;
  }

  public withScore(score: Score): InningsBuilder;

  public withScore(
    runs: number,
    wickets: number,
    balls: number,
  ): InningsBuilder;

  public withScore(
    scoreOrRuns: Score | number,
    wickets?: number,
    balls?: number,
  ): InningsBuilder {
    if (scoreOrRuns instanceof Score) {
      this.score = scoreOrRuns;
    } else {
      this.score = new Score(scoreOrRuns, wickets!, balls!);
    }

    return this;
  }

  public withStriker(player: Player): InningsBuilder {
    this.battingPair = new BattingPair(
      player,
      this.battingPair.getNonStriker(),
    );

    return this;
  }

  public withNonStriker(player: Player): InningsBuilder {
    this.battingPair = new BattingPair(this.battingPair.getStriker(), player);

    return this;
  }

  public forFirstInnings(match: Match): InningsBuilder {
    this.battingTeam = match.getTeamA();

    this.bowlingTeam = match.getTeamB();

    return this;
  }

  public forSecondInnings(match: Match): InningsBuilder {
    this.battingTeam = match.getTeamB();

    this.bowlingTeam = match.getTeamA();

    return this;
  }

  public build(): Innings {
    return new Innings(
      this.battingTeam,
      this.bowlingTeam,
      this.score,
      this.battingPair,
      this.bowlingAttack,
      this.battingOrder,
    );
  }
}
