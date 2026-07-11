import { PlayerPool } from "./PlayerPool";
import { Team } from "../team";
import { RandomGenerator } from "../../infrastructure/random";

export class DraftContext {
  public constructor(
    private readonly playerPool: PlayerPool,
    private readonly team: Team,
    private readonly random: RandomGenerator,
  ) {}

  public getPlayerPool(): PlayerPool {
    return this.playerPool;
  }

  public getTeam(): Team {
    return this.team;
  }

  public getRandom(): RandomGenerator {
    return this.random;
  }
}