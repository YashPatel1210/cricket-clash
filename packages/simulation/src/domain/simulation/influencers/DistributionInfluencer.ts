import { Player } from "../../player";
import { OutcomeDistribution } from "../../match/delivery/OutcomeDistribution";

export interface DistributionInfluencer {
  influence(
    striker: Player,
    distribution: OutcomeDistribution,
  ): OutcomeDistribution;
}
