import { useState, useCallback, useEffect, useRef } from "react";
import type { MatchResult } from "@cricket-clash/simulation/domain/match/MatchResult";
import type { DraftSession } from "@cricket-clash/simulation/domain/draft/DraftSession";
import type { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";
import type { Player } from "@cricket-clash/simulation/domain/player/Player";

import { createDraftSession, simulateMatchFromDraft } from "../services/GameService";
import { PlayerCard } from "../components/PlayerCard";
import { SquadPanel } from "../components/SquadPanel";

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_PASSES = 2; // Each player can skip at most 2 rounds

/** Role display order in the round grid: Batter → WK → AR → Bowler */
const ROLE_ORDER: Record<string, number> = {
  BATTER: 0, WICKET_KEEPER: 1, ALL_ROUNDER: 2, BOWLER: 3,
};

const ROUND_COMPOSITION_LABEL = (comp: {
  batters: number; allRounders: number; bowlers: number; wicketKeepers: number;
}) => `${comp.batters}B  ${comp.allRounders}AR  ${comp.bowlers}BOW  ${comp.wicketKeepers}WK`;

const COUNTRY_FLAG: Record<string, string> = {
  "India":        "\uD83C\uDDEE\uD83C\uDDF3",
  "Australia":    "\uD83C\uDDE6\uD83C\uDDFA",
  "England":      "ENG",
  "Pakistan":     "\uD83C\uDDF5\uD83C\uDDF0",
  "South Africa": "\uD83C\uDDFF\uD83C\uDDE6",
  "New Zealand":  "\uD83C\uDDF3\uD83C\uDDFF",
  "Bangladesh":   "\uD83C\uDDE7\uD83C\uDDE9",
  "Afghanistan":  "\uD83C\uDDE6\uD83C\uDDEB",
  "Ireland":      "\uD83C\uDDEE\uD83C\uDDEA",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  player1: string;
  player2: string;
  onMatchReady: (result: MatchResult) => void;
  onBack: () => void;
}

// ── Entry — safe async init ────────────────────────────────────────────────────

export default function DraftPage({ player1, player2, onMatchReady, onBack }: Props) {
  const [session, setSession]     = useState<DraftSession | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSession(createDraftSession(player1, player2, Date.now()));
    } catch (e) {
      setInitError((e as Error).message);
      console.error("[DraftPage] Init failed:", e);
    }
  }, [player1, player2]);

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Draft Setup Failed</h2>
          <p className="text-slate-400 text-sm mb-6">{initError}</p>
          <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg text-sm transition-colors">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">⚙️</div>
          <p className="text-slate-400">Loading player pool…</p>
        </div>
      </div>
    );
  }

  return (
    <DraftUI
      session={session}
      setSession={setSession}
      player1={player1}
      player2={player2}
      onMatchReady={onMatchReady}
      onBack={onBack}
    />
  );
}

// ── Draft UI ──────────────────────────────────────────────────────────────────

interface UIProps extends Props {
  session: DraftSession;
  setSession: (s: DraftSession) => void;
}

function DraftUI({ session, setSession, player1, player2, onMatchReady, onBack }: UIProps) {
  const [activeTurn, setActiveTurn] = useState<"A" | "B">("A");
  const [simulating, setSimulating] = useState(false);
  const [positionPicker, setPositionPicker] = useState<{
    player: Player; options: BattingPosition[];
  } | null>(null);
  // Issue 1: limit passes per player
  const [passesUsed, setPassesUsed] = useState({ A: 0, B: 0 });
  const autoPassingRef = useRef(false);

  const pA = session.participantA;
  const pB = session.participantB;
  const bothDone = pA.isSquadComplete() && pB.isSquadComplete();

  const activeParticipant = activeTurn === "A" ? pA : pB;
  const activeName        = activeTurn === "A" ? player1 : player2;
  const activeUserId      = activeParticipant.userId;
  const currentRound      = activeParticipant.getCurrentRound();

  // Options sorted: Batters → WK → AR → Bowlers (Issue 5)
  const rawOptions = session.getOptionsFor(activeUserId);
  const options    = [...rawOptions].sort(
    (a, b) => (ROLE_ORDER[a.player.role as string] ?? 99) - (ROLE_ORDER[b.player.role as string] ?? 99)
  );

  // ── Issue 2: auto-pass when active player's squad is already full ─────────

  useEffect(() => {
    if (autoPassingRef.current) return;
    if (simulating || bothDone) return;
    if (!activeParticipant.isSquadComplete()) return;
    if (activeParticipant.hasMadePickThisRound) return;

    // Active player's squad is full — auto-pass for them
    autoPassingRef.current = true;
    const result = session.pass(activeUserId);
    autoPassingRef.current = false;

    if (result.success) {
      const updated = result.session;
      setSession(updated);
      if (updated.status === "COMPLETED" || (updated.participantA.isSquadComplete() && updated.participantB.isSquadComplete())) {
        triggerSimulation(updated);
        return;
      }
      setActiveTurn(activeTurn === "A" ? "B" : "A");
    }
  }, [activeTurn, session, simulating]);

  const triggerSimulation = useCallback((s: DraftSession) => {
    setSimulating(true);
    setTimeout(() => {
      try {
        onMatchReady(simulateMatchFromDraft(s, Date.now()));
      } catch (e) {
        console.error("[DraftUI] Simulation failed:", e);
        setSimulating(false);
      }
    }, 300);
  }, [onMatchReady]);

  // ── Pick ──────────────────────────────────────────────────────────────────

  const confirmPick = useCallback((player: Player, position: BattingPosition) => {
    setPositionPicker(null);
    const result = session.pick(activeUserId, player, position);

    if (!result.success) {
      console.warn("[DraftUI] Pick failed:", result.reason);
      return;
    }

    const updated = result.session;
    setSession(updated);

    if (updated.status === "COMPLETED" ||
        (updated.participantA.isSquadComplete() && updated.participantB.isSquadComplete())) {
      triggerSimulation(updated);
      return;
    }

    setActiveTurn(activeTurn === "A" ? "B" : "A");
  }, [session, activeUserId, activeTurn, triggerSimulation]);

  // ── Issue 1: Pass with limit ───────────────────────────────────────────────

  const handlePass = useCallback(() => {
    const used = passesUsed[activeTurn];
    if (used >= MAX_PASSES) return;

    const result = session.pass(activeUserId);
    if (result.success) {
      setSession(result.session);
      setPassesUsed((prev) => ({ ...prev, [activeTurn]: prev[activeTurn] + 1 }));
      setActiveTurn(activeTurn === "A" ? "B" : "A");
    }
  }, [session, activeUserId, activeTurn, passesUsed]);

  // ── Screens ───────────────────────────────────────────────────────────────

  if (simulating) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏏</div>
          <h2 className="text-2xl font-bold">Simulating Match…</h2>
          <p className="text-slate-400 mt-2">Calculating ball by ball…</p>
        </div>
      </div>
    );
  }

  // Issue 3: Both squads full — show explicit Start Match screen
  if (bothDone) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <div className="border-b border-slate-800 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-slate-500 hover:text-white text-sm">← Back</button>
          <span className="font-bold text-white">Draft Complete</span>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto w-full">
          <SquadPanel participant={pA} name={player1} isActive />
          <div className="flex flex-col items-center justify-center gap-4 px-6">
            <div className="text-4xl">🏏</div>
            <div className="text-slate-400 text-sm text-center">
              Both squads are ready!
            </div>
            <button
              onClick={() => triggerSimulation(session)}
              className="bg-green-500 hover:bg-green-400 text-slate-950 font-black px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-green-900/40"
            >
              Start Match →
            </button>
          </div>
          <SquadPanel participant={pB} name={player2} isActive />
        </div>
      </div>
    );
  }

  // ── Main draft UI ─────────────────────────────────────────────────────────

  const passesLeft = MAX_PASSES - passesUsed[activeTurn];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <div className="text-center">
          <div className="font-bold text-white">
            Round {activeParticipant.getRoundNumber()} / {activeParticipant.getTotalRounds()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {player1}: {pA.pickedCount()}/11 &nbsp;|&nbsp; {player2}: {pB.pickedCount()}/11
          </div>
        </div>
        <div className="text-sm font-semibold text-green-400">{activeName}'s Pick</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">
        {/* Active player's round */}
        <div className="flex-1">
          {currentRound && (
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{COUNTRY_FLAG[currentRound.country] ?? "🌍"}</div>
              <div>
                <h2 className="font-bold text-xl">{currentRound.country}</h2>
                <div className="text-xs text-slate-500">
                  {ROUND_COMPOSITION_LABEL(currentRound.composition)}
                </div>
              </div>
              <div className="ml-auto text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                {activeName}'s round
              </div>
            </div>
          )}

          {/* Minimum role warning / fallback notice */}
          {(() => {
            const req = activeParticipant.squad.requiredRoles();
            const rem = 11 - activeParticipant.pickedCount();
            const forced = req.length > 0 && rem <= activeParticipant.squad.totalRequiredPicks();
            const ROLE_NAMES: Record<string, string> = {
              BATTER: "Batter", WICKET_KEEPER: "Wicket Keeper",
              ALL_ROUNDER: "All-Rounder", BOWLER: "Bowler",
            };
            if (req.length === 0) return null;

            // Check if any required role has no selectable player in this round
            const selectableRoles = new Set(
              options.filter((o) => o.isSelectable()).map((o) => o.player.role as string)
            );
            const missingInRound = req.filter((r) => !selectableRoles.has(r));

            if (missingInRound.length > 0) {
              return (
                <div className="mb-3 px-3 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-xs text-blue-300">
                  🔄 Extra picks added: {missingInRound.map((r) => ROLE_NAMES[r] ?? r).join(", ")} players from global pool (no eligible player in this round)
                </div>
              );
            }

            if (!forced) return null;
            return (
              <div className="mb-3 px-3 py-2 bg-orange-900/30 border border-orange-700/50 rounded-lg text-xs text-orange-300">
                ⚠ You must pick: {req.map((r) => ROLE_NAMES[r] ?? r).join(", ")} — other players are locked
              </div>
            );
          })()}

          {/* Player grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => (
              <PlayerCard
                key={opt.player.id}
                option={opt}
                onPick={(pos) => {
                  const all = opt.eligiblePositions;
                  if (all.length <= 1) confirmPick(opt.player, all[0] ?? pos);
                  else setPositionPicker({ player: opt.player, options: [...all] });
                }}
              />
            ))}
          </div>

          {/* Pass button with limit indicator */}
          <button
            onClick={handlePass}
            disabled={passesLeft <= 0}
            className={`mt-4 w-full rounded-lg border py-2 text-sm transition-colors ${
              passesLeft > 0
                ? "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                : "border-slate-800 text-slate-700 cursor-not-allowed"
            }`}
          >
            {passesLeft > 0
              ? `Skip this round (${passesLeft} skip${passesLeft === 1 ? "" : "s"} remaining)`
              : "No skips remaining"}
          </button>
        </div>

        {/* Squad panels */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          <SquadPanel participant={pA} name={player1} isActive={activeTurn === "A"} />
          <SquadPanel participant={pB} name={player2} isActive={activeTurn === "B"} />
        </div>
      </div>

      {/* Position picker modal */}
      {positionPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-1">Choose batting position</h3>
            <p className="text-slate-400 text-sm mb-4">{positionPicker.player.name}</p>
            <div className="grid grid-cols-4 gap-2">
              {positionPicker.options.map((pos) => (
                <button
                  key={pos.getValue()}
                  onClick={() => confirmPick(positionPicker.player, pos)}
                  className="rounded-lg bg-slate-700 hover:bg-green-600 py-3 font-bold text-lg transition-colors"
                >
                  #{pos.getValue()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPositionPicker(null)}
              className="mt-4 w-full text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
