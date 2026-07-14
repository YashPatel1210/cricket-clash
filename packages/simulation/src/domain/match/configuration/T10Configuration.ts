import { MatchConfiguration } from "./MatchConfiguration";
import { MatchFormat } from "./MatchFormat";
import { MatchRules } from "./MatchRules";

export class T10Configuration extends MatchConfiguration {
  public constructor() {
    super(MatchFormat.T10, new MatchRules(10));
  }
}
