import { BattingSimulationProfile } from "./BattingSimulationProfile";
import { BowlingSimulationProfile } from "./BowlingSimulationProfile";
import { SimulationProfile } from "./SimulationProfile";

export class DefaultSimulationProfile {
  public static standard(): SimulationProfile {
    return new SimulationProfile(
      new BattingSimulationProfile(5, 2, 3, 3, 3),
      new BowlingSimulationProfile(5, 3, 3),
    );
  }
}
