import { Player } from "../player";
import { DraftOptionState } from "./DraftOptionState";

export class DraftOption {
  constructor(
    private readonly player: Player,

    private readonly state: DraftOptionState =
    DraftOptionState.AVAILABLE,
  ) {}

  public getPlayer(): Player {
    return this.player;
  }

  public getStatus(): DraftOptionState {
    return this.state;
  }

  public isSelectable(): boolean {
    return this.state === DraftOptionState.AVAILABLE;
  }
}