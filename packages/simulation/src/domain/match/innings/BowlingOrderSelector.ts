import { Team } from "../../team";
import { BowlingOrder } from "./BowlingOrder";

export interface BowlingOrderSelector {
  select(team: Team): BowlingOrder;
}
