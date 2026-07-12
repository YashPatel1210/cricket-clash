import { Team } from "../../team";
import { Player } from "../../player";

export interface OpeningPairSelector {
  select(team: Team): readonly [Player, Player];
}
