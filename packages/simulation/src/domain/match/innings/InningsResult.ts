import { Over } from "../over";

import { Innings } from "./Innings";

export class InningsResult {
  public constructor(
    private readonly innings: Innings,
    private readonly overs: ReadonlyArray<Over>,
  ) {}

  public getInnings(): Innings {
    return this.innings;
  }

  public getOvers(): ReadonlyArray<Over> {
    return this.overs;
  }

  public totalOvers(): number {
    return this.overs.length;
  }
}
