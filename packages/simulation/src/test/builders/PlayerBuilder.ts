import {
  BattingStyle,
  BowlingStyle,
  Country,
  Handedness,
  PlayerRole,
} from "@cricket-clash/shared";

import { Player } from "../../domain/player";

type PlayerAttributes = {
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  experience: number;
};

export class PlayerBuilder {
  private static idCounter = 1;

  private id = `player-${PlayerBuilder.idCounter++}`;

  private name = "Test Player";

  private country = Country.INDIA;

  private role = PlayerRole.BATTER;

  private handedness = Handedness.RIGHT;

  private battingStyle = BattingStyle.RIGHT_HAND;

  private bowlingStyle: BowlingStyle | null = null;

  private attributes: PlayerAttributes = {
    batting: 80,
    bowling: 40,
    fielding: 75,
    fitness: 80,
    experience: 60,
  };

  private constructor() {}

  // ---------- Static Factory Methods ----------

  public static batter(): PlayerBuilder {
    return new PlayerBuilder()
      .withRole(PlayerRole.BATTER)
      .withAttributes({
        batting: 88,
        bowling: 15,
        fielding: 80,
        fitness: 85,
        experience: 75,
      });
  }

  public static bowler(): PlayerBuilder {
    return new PlayerBuilder()
      .withRole(PlayerRole.BOWLER)
      .withAttributes({
        batting: 20,
        bowling: 90,
        fielding: 78,
        fitness: 86,
        experience: 72,
      });
  }

  public static allRounder(): PlayerBuilder {
    return new PlayerBuilder()
      .withRole(PlayerRole.ALL_ROUNDER)
      .withAttributes({
        batting: 82,
        bowling: 82,
        fielding: 84,
        fitness: 88,
        experience: 78,
      });
  }

  public static wicketKeeper(): PlayerBuilder {
    return new PlayerBuilder()
      .withRole(PlayerRole.WICKET_KEEPER)
      .withAttributes({
        batting: 84,
        bowling: 10,
        fielding: 92,
        fitness: 84,
        experience: 76,
      });
  }

  // ---------- Fluent API ----------

  public named(name: string): PlayerBuilder {
    this.name = name;
    return this;
  }

  public fromCountry(country: Country): PlayerBuilder {
    this.country = country;
    return this;
  }

  public withRole(role: PlayerRole): PlayerBuilder {
    this.role = role;
    return this;
  }

  public withAttributes(attributes: PlayerAttributes): PlayerBuilder {
    this.attributes = attributes;
    return this;
  }

  public withBatting(value: number): PlayerBuilder {
    this.attributes.batting = value;
    return this;
  }

  public withBowling(value: number): PlayerBuilder {
    this.attributes.bowling = value;
    return this;
  }

  public withFielding(value: number): PlayerBuilder {
    this.attributes.fielding = value;
    return this;
  }

  public withFitness(value: number): PlayerBuilder {
    this.attributes.fitness = value;
    return this;
  }

  public withExperience(value: number): PlayerBuilder {
    this.attributes.experience = value;
    return this;
  }

  // ---------- Build ----------

  public build(): Player {
    return new Player(
      this.id,
      this.name,
      this.country,
      this.role,
      this.handedness,
      this.battingStyle,
      this.bowlingStyle,
      this.attributes,
    );
  }
}