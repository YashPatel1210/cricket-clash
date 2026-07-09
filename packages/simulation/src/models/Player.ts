import { PlayerRole } from "../types/PlayerRole";

export interface Player {
  id: string;

  name: string;

  role: PlayerRole;

  batting: number;

  bowling: number;

  fielding: number;

  pace: number;

  spin: number;

  fitness: number;

  confidence: number;

  stamina: number;
}