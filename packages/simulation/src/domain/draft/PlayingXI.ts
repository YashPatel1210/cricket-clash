import { DraftOption } from "./DraftOption";

export class PlayingXI {
  public constructor(
    private readonly options: ReadonlyArray<DraftOption>,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.options.length !== 11) {
      throw new Error(
        "Playing XI must contain exactly 11 draft options.",
      );
    }
  }

  public size(): number {
    return this.options.length;
  }

  public getOptions(): ReadonlyArray<DraftOption> {
    return this.options;
  }

  public getAvailableOptions(): ReadonlyArray<DraftOption> {
    return this.options.filter((option) =>
      option.isSelectable(),
    );
  }

  public getDisabledOptions(): ReadonlyArray<DraftOption> {
    return this.options.filter((option) =>
      !option.isSelectable(),
    );
  }

  public availableCount(): number {
    return this.getAvailableOptions().length;
  }

  public disabledCount(): number {
    return this.getDisabledOptions().length;
  }

  public hasPlayer(playerId: string): boolean {
    return this.options.some(
      (option) => option.getPlayer().id === playerId,
    );
  }

  public findOption(
    playerId: string,
  ): DraftOption | undefined {
    return this.options.find(
      (option) => option.getPlayer().id === playerId,
    );
  }
}