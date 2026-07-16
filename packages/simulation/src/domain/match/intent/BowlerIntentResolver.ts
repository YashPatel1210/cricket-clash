import { Player } from "../../player";
import { MatchContext } from "../context/MatchContext";

import { BowlerIntent } from "./BowlerIntent";

export interface BowlerIntentResolver {
  resolve(context: MatchContext, bowler: Player): BowlerIntent;
}
