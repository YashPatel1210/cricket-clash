import { Over } from "../over";
import { OverEngine } from "../over";

import { Innings } from "./Innings";
import { InningsResult } from "./InningsResult";
import { InningsStateEvaluator } from "./InningsStateEvaluator";

export class InningsEngine {
  public constructor(
    private readonly overEngine: OverEngine,
    private readonly stateEvaluator: InningsStateEvaluator,
  ) {}

  public simulate(innings: Innings): InningsResult {
    let currentInnings = innings;

    const overs: Over[] = [];

    while (this.stateEvaluator.shouldContinue(currentInnings)) {
      const result = this.overEngine.simulate(currentInnings);

      overs.push(result.getOver());

      currentInnings = result.getInnings();
    }

    return new InningsResult(currentInnings, overs);
  }
}
