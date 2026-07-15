import { MatchConfiguration } from "./MatchConfiguration";
import { MatchFormat } from "./MatchFormat";
import { MatchRules } from "./MatchRules";
import { InningsPhases } from "./InningsPhases";

export class T20Configuration extends MatchConfiguration {
  public constructor() {
    super(MatchFormat.T20, new MatchRules(20, 6, new InningsPhases(6, 16)));
  }
}
