import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

import { Server } from "socket.io";
import { PlayerLoader } from "@cricket-clash/data";
import { PlayerFactory } from "@cricket-clash/simulation/domain/player/PlayerFactory";
import { PlayerPool } from "@cricket-clash/simulation/domain/draft/PlayerPool";
import { DraftSessionEngine } from "@cricket-clash/simulation/domain/draft/DraftSessionEngine";
import type { DraftSession } from "@cricket-clash/simulation/domain/draft/DraftSession";
import { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";
import { DEFAULT_DRAFT_CONFIG } from "@cricket-clash/simulation/domain/draft/DraftSessionConfig";
import { RandomGenerator } from "@cricket-clash/simulation/infrastructure/random/index";
import { Team } from "@cricket-clash/simulation/domain/team/Team";
import { TeamSelection } from "@cricket-clash/simulation/domain/team/TeamSelection";
import { Match } from "@cricket-clash/simulation/domain/match/Match";
import { MatchConditions } from "@cricket-clash/simulation/domain/match/conditions/MatchConditions";
import { PitchType } from "@cricket-clash/simulation/domain/match/conditions/PitchType";
import { WeatherCondition } from "@cricket-clash/simulation/domain/match/conditions/WeatherCondition";
import { Stadium } from "@cricket-clash/simulation/domain/match/conditions/Stadium";
import { BoundarySize } from "@cricket-clash/simulation/domain/match/conditions/BoundarySize";
import { T20Configuration } from "@cricket-clash/simulation/domain/match/configuration/T20Configuration";
import { Toss } from "@cricket-clash/simulation/domain/match/toss/Toss";
import { TossDecision } from "@cricket-clash/simulation/domain/match/toss/TossDecision";
import { SimulationEngine } from "@cricket-clash/simulation/SimulationEngine";
import { T20TuningProfile } from "@cricket-clash/simulation/domain/simulation/config/T20TuningProfile";

type Slot = "A" | "B";
type Phase = "WAITING_FOR_OPPONENT" | "DRAFTING" | "SQUAD_REVEAL" | "TOSS" | "SIMULATING";

interface RoomPlayer {
  name: string;
  accessToken: string;
  ready: boolean;
}

interface GameRoom {
  code: string;
  phase: Phase;
  players: Partial<Record<Slot, RoomPlayer>>;
  session?: DraftSession;
  toss?: { winner: Slot; decision: "BAT" | "BOWL" };
  playback?: MatchPlayback;
}

interface MatchPlayback {
  startedAt: number;
  firstTeam: string;
  secondTeam: string;
  firstScore: string;
  secondScore: string;
  winner: string | null;
  events: Array<{ innings: 1 | 2; outcome: string; runs: number; wicket: boolean; batter: string; bowler: string; legal: boolean }>;
}

const playerPool = new PlayerPool(PlayerFactory.fromDataList(PlayerLoader.loadAll()));
const rooms = new Map<string, GameRoom>();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" },
});

function randomCode(): string {
  let code = "";
  do code = randomBytes(3).toString("hex").toUpperCase(); while (rooms.has(code));
  return code;
}

function newAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

function participantFor(room: GameRoom, token: string): Slot | undefined {
  return (Object.entries(room.players) as Array<[Slot, RoomPlayer | undefined]>)
    .find(([, player]) => player?.accessToken === token)?.[0];
}

function createDraft(playerA: string, playerB: string): DraftSession {
  const countries = playerPool.countries().filter(
    (country) => playerPool.playersFromCountry(country).length >= 11,
  );
  return new DraftSessionEngine(playerPool, new RandomGenerator(Date.now())).createSession(
    "A",
    "B",
    { ...DEFAULT_DRAFT_CONFIG, totalRounds: 16, countries },
  );
}

function squadFor(session: DraftSession, slot: Slot) {
  const participant = slot === "A" ? session.participantA : session.participantB;
  return participant.squad.getAllPicks().map(({ position, player }) => ({
    position: position.getValue(),
    id: player.id,
    name: player.name,
    imageUrl: player.imageUrl,
    role: player.role,
  }));
}

function squadToTeam(session: DraftSession, slot: Slot): Team {
  const participant = slot === "A" ? session.participantA : session.participantB;
  const picks = participant.squad.getAllPicks();
  const team = new Team({
    maxPlayers: 11,
    roleLimits: {
      BATTER: { min: 0, max: 11 }, BOWLER: { min: 0, max: 11 },
      ALL_ROUNDER: { min: 0, max: 11 }, WICKET_KEEPER: { min: 0, max: 11 },
    },
  });
  const captain = picks.reduce((best, pick) =>
    pick.player.attributes.batting + pick.player.attributes.bowling > best.player.attributes.batting + best.player.attributes.bowling ? pick : best,
  );
  const keeper = picks.find((pick) => (pick.player.role as string) === "WICKET_KEEPER");
  for (const pick of picks) {
    team.addSelection(new TeamSelection(
      pick.player, pick.position.getValue(), pick.player.id === captain.player.id,
      pick.player.id === keeper?.player.id,
    ));
  }
  return team;
}

function runMatch(room: GameRoom): MatchPlayback {
  const session = room.session!;
  const teamA = squadToTeam(session, "A");
  const teamB = squadToTeam(session, "B");
  const toss = room.toss!;
  const tossTeam = toss.winner === "A" ? teamA : teamB;
  const match = new Match(
    teamA, teamB,
    new MatchConditions(PitchType.FLAT, WeatherCondition.SUNNY, new Stadium("Cricket Ground", BoundarySize.MEDIUM)),
    new T20Configuration(),
  ).withToss(new Toss(tossTeam, toss.decision === "BAT" ? TossDecision.BAT : TossDecision.BOWL));
  const result = SimulationEngine.standard(Date.now(), T20TuningProfile).simulate(match);
  const first = result.getFirstInnings();
  const second = result.getSecondInnings();
  const nameFor = (team: Team) => team === teamA ? room.players.A!.name : room.players.B!.name;
  const events = [first, second].flatMap((innings, index) => innings.getOvers().flatMap((over) =>
    over.getDeliveries().map((delivery) => ({
      innings: (index + 1) as 1 | 2,
      outcome: delivery.getEvent().getOutcome() as string,
      runs: delivery.runs(),
      wicket: delivery.getEvent().isDismissal(),
      batter: delivery.getBattingPair().getStriker().name,
      bowler: delivery.getBowlingSpell().getBowler().name,
      legal: delivery.getEvent().isLegal(),
    })),
  ));
  const firstScore = first.getInnings().getScore();
  const secondScore = second.getInnings().getScore();
  return {
    // Both clients derive their animation position from this shared server time.
    startedAt: Date.now() + 1_500,
    firstTeam: nameFor(first.getInnings().getBattingTeam()),
    secondTeam: nameFor(second.getInnings().getBattingTeam()),
    firstScore: `${firstScore.getRuns()}/${firstScore.getWickets()} (${firstScore.getOvers()} ov)`,
    secondScore: `${secondScore.getRuns()}/${secondScore.getWickets()} (${secondScore.getOvers()} ov)`,
    winner: result.getWinner() ? nameFor(result.getWinner()!) : null,
    events,
  };
}

/** Builds the viewer-specific payload. Opponent picks remain private until both ready. */
function snapshot(room: GameRoom, viewer: Slot) {
  const opponent: Slot = viewer === "A" ? "B" : "A";
  const session = room.session;
  const me = room.players[viewer]!;
  const them = room.players[opponent];
  const participant = session && (viewer === "A" ? session.participantA : session.participantB);
  const currentRound = participant?.getCurrentRound();
  const reveal = room.phase === "SQUAD_REVEAL" || room.phase === "SIMULATING";

  return {
    roomCode: room.code,
    phase: room.phase,
    you: { slot: viewer, name: me.name, ready: me.ready },
    opponent: them && {
      name: them.name,
      ready: them.ready,
      pickedCount: session ? (opponent === "A" ? session.participantA : session.participantB).pickedCount() : 0,
    },
    toss: room.toss && {
      winner: room.players[room.toss.winner]!.name,
      decision: room.toss.decision,
    },
    playback: room.playback,
    draft: session && participant && currentRound ? {
      pickedCount: participant.pickedCount(),
      totalRounds: participant.getTotalRounds(),
      roundNumber: participant.getRoundNumber(),
      country: currentRound.country,
      options: session.getOptionsFor(viewer).map((option) => {
        // `eligiblePositions` checks the player's natural batting range. The
        // squad validator has one additional safeguard: a position must not
        // make it impossible to place a required role later in the XI.
        const validPositions = option.eligiblePositions.filter((position) =>
          participant.canPick(option.player, position).valid,
        );
        return {
          player: option.player,
          status: validPositions.length > 0 ? option.status : "NO_ELIGIBLE_POSITION",
          eligiblePositions: validPositions.map((position) => position.getValue()),
        };
      }),
    } : null,
    yourSquad: session ? squadFor(session, viewer) : [],
    squads: reveal && session ? {
      you: squadFor(session, viewer),
      opponent: squadFor(session, opponent),
    } : null,
  };
}

function emitRoom(room: GameRoom): void {
  for (const slot of ["A", "B"] as const) {
    const player = room.players[slot];
    if (player) io.to(player.accessToken).emit("room:state", snapshot(room, slot));
  }
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ name }: { name: string }, reply) => {
    const room: GameRoom = {
      code: randomCode(),
      phase: "WAITING_FOR_OPPONENT",
      players: { A: { name: name.trim() || "Player 1", accessToken: newAccessToken(), ready: false } },
    };
    rooms.set(room.code, room);
    const host = room.players.A!;
    socket.join(host.accessToken);
    reply({ ok: true, roomCode: room.code, accessToken: host.accessToken, state: snapshot(room, "A") });
  });

  socket.on("room:join", ({ roomCode, name }: { roomCode: string; name: string }, reply) => {
    const room = rooms.get(roomCode.trim().toUpperCase());
    if (!room || room.players.B) return reply({ ok: false, error: "Room is unavailable." });

    room.players.B = { name: name.trim() || "Player 2", accessToken: newAccessToken(), ready: false };
    room.session = createDraft(room.players.A!.name, room.players.B.name);
    room.phase = "DRAFTING";
    socket.join(room.players.B.accessToken);
    emitRoom(room);
    reply({ ok: true, roomCode: room.code, accessToken: room.players.B.accessToken, state: snapshot(room, "B") });
  });

  socket.on("room:resume", ({ roomCode, accessToken }: { roomCode: string; accessToken: string }, reply) => {
    const room = rooms.get(roomCode.trim().toUpperCase());
    const slot = room && participantFor(room, accessToken);
    if (!room || !slot) return reply({ ok: false, error: "Room or player session not found." });
    socket.join(accessToken);
    reply({ ok: true, state: snapshot(room, slot) });
  });

  socket.on("draft:pick", ({ roomCode, accessToken, playerId, position }, reply) => {
    const room = rooms.get(roomCode);
    const slot = room && participantFor(room, accessToken);
    if (!room || !slot || !room.session || room.phase !== "DRAFTING") return reply({ ok: false, error: "Draft is not active." });

    const option = room.session.getOptionsFor(slot).find((item) => item.player.id === playerId && item.isSelectable());
    if (!option) return reply({ ok: false, error: "That player is no longer available." });
    let battingPosition: BattingPosition;
    try {
      battingPosition = BattingPosition.of(position);
    } catch {
      return reply({ ok: false, error: "Choose a valid batting position." });
    }

    const participant = slot === "A" ? room.session.participantA : room.session.participantB;
    const validation = participant.canPick(option.player, battingPosition);
    if (!validation.valid) {
      return reply({
        ok: false,
        error: "That position would prevent a valid XI. Choose one of the available positions.",
      });
    }

    const result = room.session.pick(slot, option.player, battingPosition);
    if (!result.success) return reply({ ok: false, error: result.reason });
    room.session = result.session;
    emitRoom(room);
    reply({ ok: true });
  });

  socket.on("draft:ready", ({ roomCode, accessToken }, reply) => {
    const room = rooms.get(roomCode);
    const slot = room && participantFor(room, accessToken);
    if (!room || !slot || !room.session) return reply({ ok: false, error: "Room not found." });
    const participant = slot === "A" ? room.session.participantA : room.session.participantB;
    if (!participant.isSquadComplete()) return reply({ ok: false, error: "Complete all 11 picks before readying up." });

    room.players[slot]!.ready = true;
    if (room.players.A?.ready && room.players.B?.ready) {
      room.phase = "SQUAD_REVEAL";
      // Give both players a short, equal window to inspect every selection.
      setTimeout(() => {
        if (room.phase !== "SQUAD_REVEAL") return;
        room.phase = "TOSS";
        room.toss = {
          winner: Math.random() < 0.5 ? "A" : "B",
          decision: Math.random() < 0.5 ? "BAT" : "BOWL",
        };
        emitRoom(room);
        // Keep the toss result visible briefly, then transition both clients
        // together into the match phase.
        setTimeout(() => {
          if (room.phase !== "TOSS") return;
          room.phase = "SIMULATING";
          room.playback = runMatch(room);
          emitRoom(room);
        }, 5_000);
      }, 10_000);
    }
    emitRoom(room);
    reply({ ok: true });
  });
});

const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, () => console.log(`Cricket Clash game server listening on :${port}`));
