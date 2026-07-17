import { BoundarySize } from "./BoundarySize";

export class Stadium {
  public constructor(
    private readonly name: string,
    private readonly boundarySize: BoundarySize = BoundarySize.MEDIUM,
  ) {}

  public getName(): string {
    return this.name;
  }

  public getBoundarySize(): BoundarySize {
    return this.boundarySize;
  }
}
