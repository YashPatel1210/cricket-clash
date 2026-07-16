import { Target } from "../target";
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

  public simulate(innings: Innings, target?: Target): InningsResult {
    let currentInnings = innings;

    const overs: Over[] = [];

    while (this.stateEvaluator.shouldContinue(currentInnings, target)) {
      const result = this.overEngine.simulate(currentInnings, target);

      overs.push(result.getOver());

      currentInnings = result.getInnings();
    }

    return new InningsResult(currentInnings, overs);
  }
}
