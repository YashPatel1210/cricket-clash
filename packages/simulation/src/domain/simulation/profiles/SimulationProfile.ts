import { BattingSimulationProfile } from "./BattingSimulationProfile";
import { BowlingSimulationProfile } from "./BowlingSimulationProfile";

export class SimulationProfile {
  public constructor(
    private readonly batting: BattingSimulationProfile,
    private readonly bowling: BowlingSimulationProfile,
  ) {}

  public getBatting(): BattingSimulationProfile {
    return this.batting;
  }

  public getBowling(): BowlingSimulationProfile {
    return this.bowling;
  }
}
