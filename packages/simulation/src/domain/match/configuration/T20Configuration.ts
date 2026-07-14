import { MatchConfiguration } from "./MatchConfiguration";
import { MatchFormat } from "./MatchFormat";
import { MatchRules } from "./MatchRules";

export class T20Configuration extends MatchConfiguration {
  public constructor() {
    super(MatchFormat.T20, new MatchRules(20));
  }
}
