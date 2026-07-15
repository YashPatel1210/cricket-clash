import { Player } from "./Player";

export class PlayerInstance {
  public constructor(private readonly player: Player) {}

  public getPlayer(): Player {
    return this.player;
  }

  public getId(): string {
    return this.player.id;
  }

  public getName(): string {
    return this.player.name;
  }

  public getCountry() {
    return this.player.country;
  }

  public getRole() {
    return this.player.role;
  }

  public getHandedness() {
    return this.player.handedness;
  }

  public getBattingStyle() {
    return this.player.battingStyle;
  }

  public getBowlingStyle() {
    return this.player.bowlingStyle;
  }

  public getAttributes() {
    return this.player.attributes;
  }
}
