import { Player } from "../player/Player";

export class TeamSelection {
  constructor(
    public readonly player: Player,

    public readonly battingPosition: number,

    public readonly isCaptain: boolean = false,

    public readonly isWicketKeeper: boolean = false,
  ) {}
}