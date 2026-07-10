import { Player } from "../player";
import { DraftOptionState } from "./DraftOptionState";

export class DraftOption {
  constructor(
    private readonly player: Player,

    private readonly status: DraftOptionState =
      DraftOptionState.AVAILABLE,
  ) {}

  public getPlayer(): Player {
    return this.player;
  }

  public getStatus(): DraftOptionState {
    return this.status;
  }

  public isSelectable(): boolean {
    return this.status === DraftOptionState.AVAILABLE;
  }
}