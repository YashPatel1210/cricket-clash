import { MatchConfiguration } from "./MatchConfiguration";
import { MatchFormat } from "./MatchFormat";
import { MatchRules } from "./MatchRules";

export class ODIConfiguration extends MatchConfiguration {
  public constructor() {
    super(MatchFormat.ODI, new MatchRules(50));
  }
}
