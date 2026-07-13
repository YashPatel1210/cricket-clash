import { InningsOrder } from "./InningsOrder";

export class MatchOrder {
  public constructor(
    private readonly firstInnings: InningsOrder,
    private readonly secondInnings: InningsOrder,
  ) {}

  public getFirstInnings(): InningsOrder {
    return this.firstInnings;
  }

  public getSecondInnings(): InningsOrder {
    return this.secondInnings;
  }
}
