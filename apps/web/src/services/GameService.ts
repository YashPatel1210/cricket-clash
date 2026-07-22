/**
 * GameService.ts
 *
 * Bridges @cricket-clash/simulation, @cricket-clash/data, and the React UI.
 * Owns the lifecycle of a game session: draft → match simulation → result.
 */

import { Country, PlayerRole } from "@cricket-clash/shared";
import type { PlayerData } from "@cricket-clash/data";

import { PlayerFactory }      from "@cricket-clash/simulation/domain/player/PlayerFactory";
import { PlayerPool }         from "@cricket-clash/simulation/domain/draft/PlayerPool";
import { DraftSessionEngine } from "@cricket-clash/simulation/domain/draft/DraftSessionEngine";
import { DraftSession }       from "@cricket-clash/simulation/domain/draft/DraftSession";
import { BattingPosition }    from "@cricket-clash/simulation/domain/draft/BattingPosition";
import { DraftParticipant }   from "@cricket-clash/simulation/domain/draft/DraftParticipant";
import { DEFAULT_DRAFT_CONFIG } from "@cricket-clash/simulation/domain/draft/DraftSessionConfig";
import { RandomGenerator }    from "@cricket-clash/simulation/infrastructure/random";
import { Team }               from "@cricket-clash/simulation/domain/team/Team";
import { TeamSelection }      from "@cricket-clash/simulation/domain/team/TeamSelection";
import { Match }              from "@cricket-clash/simulation/domain/match/Match";
import { MatchConditions }    from "@cricket-clash/simulation/domain/match/conditions/MatchConditions";
import { PitchType }          from "@cricket-clash/simulation/domain/match/conditions/PitchType";
import { WeatherCondition }   from "@cricket-clash/simulation/domain/match/conditions/WeatherCondition";
import { Stadium }            from "@cricket-clash/simulation/domain/match/conditions/Stadium";
import { BoundarySize }       from "@cricket-clash/simulation/domain/match/conditions/BoundarySize";
import { T20Configuration }   from "@cricket-clash/simulation/domain/match/configuration/T20Configuration";
import { SimulationEngine }   from "@cricket-clash/simulation/SimulationEngine";
import { T20TuningProfile }   from "@cricket-clash/simulation/domain/simulation/config/T20TuningProfile";
import type { MatchResult }   from "@cricket-clash/simulation/domain/match/MatchResult";
import { Player }             from "@cricket-clash/simulation/domain/player/Player";

import { ALL_PLAYER_DATA } from "./browserData";

// ── Singleton setup ────────────────────────────────────────────────────────────

const allPlayers = PlayerFactory.fromDataList(ALL_PLAYER_DATA);
const playerPool = new PlayerPool(allPlayers);

// ── Draft ──────────────────────────────────────────────────────────────────────

export function createDraftSession(
  player1Name: string,
  player2Name: string,
  seed: number = Date.now(),
): DraftSession {
  const engine = new DraftSessionEngine(playerPool, new RandomGenerator(seed));
  const config = {
    ...DEFAULT_DRAFT_CONFIG,
    totalRounds: 16,
    countries: [
      Country.INDIA, Country.AUSTRALIA, Country.ENGLAND,
      Country.BANGLADESH, Country.SOUTH_AFRICA, Country.AFGHANISTAN,
      Country.IRELAND, Country.NEW_ZEALAND,
    ].filter((c) => playerPool.playersFromCountry(c).length >= 11),
  };
  return engine.createSession(player1Name, player2Name, config);
}

// ── Match simulation ───────────────────────────────────────────────────────────

export function simulateMatchFromDraft(
  session: DraftSession,
  seed: number = Date.now(),
): MatchResult {
  const teamA = squadToTeam(session.participantA);
  const teamB = squadToTeam(session.participantB);

  const match = new Match(
    teamA, teamB,
    new MatchConditions(
      PitchType.FLAT,
      WeatherCondition.SUNNY,
      new Stadium("Cricket Ground", BoundarySize.MEDIUM),
    ),
    new T20Configuration(),
  );

  return SimulationEngine.standard(seed, T20TuningProfile).simulate(match);
}

// ── Squad → Team conversion ────────────────────────────────────────────────────

function squadToTeam(participant: DraftParticipant): Team {
  // Permissive rules for simulation — draft already validated composition
  const permissiveRules = {
    maxPlayers: 11,
    roleLimits: {
      [PlayerRole.BATTER]:        { min: 0, max: 11 },
      [PlayerRole.BOWLER]:        { min: 0, max: 11 },
      [PlayerRole.ALL_ROUNDER]:   { min: 0, max: 11 },
      [PlayerRole.WICKET_KEEPER]: { min: 0, max: 11 },
    },
  };

  const team  = new Team(permissiveRules);
  const picks = participant.squad.getAllPicks();

  // Captain = highest batting + bowling rating
  const captain = picks.reduce((best, p) =>
    (p.player.attributes.batting + p.player.attributes.bowling) >
    (best.player.attributes.batting + best.player.attributes.bowling) ? p : best
  );

  const keeper = picks.find((p) => p.player.role === PlayerRole.WICKET_KEEPER);

  for (const { position, player } of picks) {
    team.addSelection(new TeamSelection(
      player,
      position.getValue(),
      player.id === captain.player.id,
      keeper ? player.id === keeper.player.id : false,
    ));
  }

  return team;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getParticipantName(session: DraftSession, which: "A" | "B"): string {
  return which === "A" ? session.participantA.userId : session.participantB.userId;
}

export function playerById(id: string): Player | undefined {
  return allPlayers.find((p) => p.id === id);
}

export { BattingPosition };
