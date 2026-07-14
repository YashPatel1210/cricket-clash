import type { PlayerAttributes } from "./PlayerAttributes";
import { Player } from "./Player";

export class PlayerStrength {
  private static readonly MAX_ATTRIBUTE = 99;

  public constructor(private readonly attributes: PlayerAttributes) {}

  public batting(): number {
    return this.normalize(this.attributes.batting);
  }

  public bowling(): number {
    return this.normalize(this.attributes.bowling);
  }

  public fielding(): number {
    return this.normalize(this.attributes.fielding);
  }

  public fitness(): number {
    return this.normalize(this.attributes.fitness);
  }

  public experience(): number {
    return this.normalize(this.attributes.experience);
  }

  private normalize(value: number): number {
    return value / PlayerStrength.MAX_ATTRIBUTE;
  }
  public static of(player: Player): PlayerStrength {
    return new PlayerStrength(player.attributes);
  }
}
