import { Innings } from "../innings";

import { Over } from "./Over";

export class OverResult {
  public constructor(
    private readonly over: Over,
    private readonly innings: Innings,
  ) {}

  public getOver(): Over {
    return this.over;
  }

  public getInnings(): Innings {
    return this.innings;
  }
}
