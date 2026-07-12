import { Team } from "../../domain/team";
import { Player } from "../../domain/player";

import { BattingPair, BowlingSpell, Innings } from "../../domain/match/innings";

import { Score } from "../../domain/match/score";

import { PlayerBuilder, TeamBuilder } from ".";

export class InningsBuilder {
  private battingTeam: Team = TeamBuilder.standard().build();

  private bowlingTeam: Team = TeamBuilder.standard().build();

  private score = new Score(0, 0, 0);

  private battingPair = new BattingPair(
    PlayerBuilder.batter().build(),
    PlayerBuilder.batter().build(),
  );

  private bowlingSpell = new BowlingSpell(PlayerBuilder.bowler().build(), 0);

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

  public withScore(score: Score): InningsBuilder {
    this.score = score;
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

  public withBowler(player: Player): InningsBuilder {
    this.bowlingSpell = new BowlingSpell(
      player,
      this.bowlingSpell.getBallsBowled(),
    );

    return this;
  }

  public withBallsBowled(balls: number): InningsBuilder {
    this.bowlingSpell = new BowlingSpell(this.bowlingSpell.getBowler(), balls);

    return this;
  }

  public build(): Innings {
    return new Innings(
      this.battingTeam,
      this.bowlingTeam,
      this.score,
      this.battingPair,
      this.bowlingSpell,
    );
  }
  public withBattingPair(pair: BattingPair): InningsBuilder {
    this.battingPair = pair;
    return this;
  }

  public withBowlingSpell(spell: BowlingSpell): InningsBuilder {
    this.bowlingSpell = spell;
    return this;
  }
}
