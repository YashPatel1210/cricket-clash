import { Team } from "../../team";
import { Player } from "../../player";

export interface OpeningBowlerSelector {
  select(team: Team): Player;
}
