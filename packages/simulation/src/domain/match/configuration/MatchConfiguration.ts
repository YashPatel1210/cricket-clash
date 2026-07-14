import { MatchFormat } from "./MatchFormat";
import { MatchRules } from "./MatchRules";

export abstract class MatchConfiguration {
  protected constructor(
    private readonly format: MatchFormat,
    private readonly rules: MatchRules,
  ) {}

  public getFormat(): MatchFormat {
    return this.format;
  }

  public getRules(): MatchRules {
    return this.rules;
  }
}
