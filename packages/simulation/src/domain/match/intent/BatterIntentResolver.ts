import { Player } from "../../player";
import { MatchContext } from "../context/MatchContext";

import { BatterIntent } from "./BatterIntent";

export interface BatterIntentResolver {
  resolve(context: MatchContext, batter: Player): BatterIntent;
}
