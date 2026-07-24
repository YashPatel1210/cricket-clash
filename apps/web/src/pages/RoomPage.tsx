import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

type Phase = "WAITING_FOR_OPPONENT" | "DRAFTING" | "SQUAD_REVEAL" | "TOSS" | "SIMULATING";
type Role = "BATTER" | "WICKET_KEEPER" | "ALL_ROUNDER" | "BOWLER";

interface PlayerSummary {
  id: string;
  name: string;
  imageUrl?: string;
  role: Role;
  attributes?: { batting: number; bowling: number };
}

interface DraftOption { player: PlayerSummary; status: string; eligiblePositions: number[]; }
interface SquadPlayer extends PlayerSummary { position: number; }
interface RoomState {
  roomCode: string;
  phase: Phase;
  you: { slot: "A" | "B"; name: string; ready: boolean };
  opponent?: { name: string; ready: boolean; pickedCount: number };
  toss?: { winner: string; decision: "BAT" | "BOWL" };
  playback?: { startedAt: number; firstTeam: string; secondTeam: string; firstScore: string; secondScore: string; winner: string | null; events: Array<{ innings: 1 | 2; outcome: string; runs: number; wicket: boolean; batter: string; bowler: string; legal: boolean }> };
  draft: null | { pickedCount: number; totalRounds: number; roundNumber: number; country: string; options: DraftOption[] };
  yourSquad: SquadPlayer[];
  squads: null | { you: SquadPlayer[]; opponent: SquadPlayer[] };
}

interface Props { roomCode: string; accessToken: string; onLeave: () => void; }
const SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL ?? "http://localhost:3001";
const ROLE_LABEL: Record<Role, string> = { BATTER: "BAT", WICKET_KEEPER: "WK", ALL_ROUNDER: "AR", BOWLER: "BOW" };
const ROLE_STYLE: Record<Role, string> = { BATTER: "border-blue-500/40 bg-blue-500/15 text-blue-300", WICKET_KEEPER: "border-purple-500/40 bg-purple-500/15 text-purple-300", ALL_ROUNDER: "border-amber-500/40 bg-amber-500/15 text-amber-300", BOWLER: "border-red-500/40 bg-red-500/15 text-red-300" };

export default function RoomPage({ roomCode, accessToken, onLeave }: Props) {
  const socket = useMemo<Socket>(() => io(SERVER_URL, { autoConnect: false }), []);
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();
    socket.on("room:state", setState);
    socket.emit("room:resume", { roomCode, accessToken }, (response: { ok: boolean; state?: RoomState; error?: string }) => response.ok && response.state ? setState(response.state) : setError(response.error ?? "Could not reconnect to this room."));
    return () => { socket.off("room:state", setState); socket.disconnect(); };
  }, [socket, roomCode, accessToken]);

  const pick = (playerId: string, positions: number[]) => {
    const position = positions[Math.floor(positions.length / 2)];
    if (!position) return;
    socket.emit("draft:pick", { roomCode, accessToken, playerId, position }, (response: { ok: boolean; error?: string }) => !response.ok && setError(response.error ?? "Pick failed."));
  };
  const ready = () => socket.emit("draft:ready", { roomCode, accessToken }, (response: { ok: boolean; error?: string }) => !response.ok && setError(response.error ?? "Unable to ready up."));

  if (error) return <RoomShell><p className="text-red-400">{error}</p><BackButton onLeave={onLeave} /></RoomShell>;
  if (!state || state.phase === "WAITING_FOR_OPPONENT") return <RoomShell><h1 className="text-2xl font-black">Room {roomCode}</h1><p className="mt-3 text-slate-400">Share this room code with your opponent. The draft begins when they join.</p><div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 px-6 py-4 text-3xl font-black tracking-[0.3em] text-green-300">{roomCode}</div><BackButton onLeave={onLeave} /></RoomShell>;

  if (state.phase === "SQUAD_REVEAL") return <Reveal state={state} />;
  if (state.phase === "TOSS") return <TossScreen state={state} />;
  if (state.phase === "SIMULATING") return <MatchStarting state={state} />;

  const draft = state.draft;
  if (!draft) return null;
  const complete = draft.pickedCount === 11;
  return <div className="min-h-screen bg-slate-950 px-4 py-5 text-white">
    <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-slate-800 pb-4"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Room {roomCode}</p><h1 className="text-2xl font-black">{state.you.name}'s Draft</h1></div><div className="text-right text-sm text-slate-400"><div className="text-lg text-white">{draft.pickedCount}/11 selected</div><div>{state.opponent?.name}: {state.opponent?.pickedCount ?? 0}/11</div></div></header>
    <div className="mx-auto mt-6 grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <main>{complete ? <ReadyPanel state={state} ready={ready} /> : <><div className="mb-5 flex items-end justify-between"><div><p className="text-sm text-slate-400">Pack {draft.roundNumber}/{draft.totalRounds}</p><h2 className="text-3xl font-black">{draft.country}</h2></div><p className="text-xs text-slate-500">Your opponent drafts independently.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{draft.options.map((option) => <DraftCard key={option.player.id} option={option} onPick={pick} />)}</div></>}</main>
      <aside><Squad title={`${state.you.name}'s Squad`} players={state.yourSquad} /><div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400"><strong className="text-slate-200">{state.opponent?.name}</strong> is drafting independently: {state.opponent?.pickedCount ?? 0}/11 selected.</div></aside>
    </div>
  </div>;
}

function DraftCard({ option, onPick }: { option: DraftOption; onPick: (id: string, positions: number[]) => void }) {
  const selectable = option.status === "AVAILABLE" && option.eligiblePositions.length > 0;
  const { player } = option;
  return <button disabled={!selectable} onClick={() => onPick(player.id, option.eligiblePositions)} className="rounded-xl border border-slate-600 bg-slate-800 p-3 text-left transition-all enabled:hover:border-green-500 enabled:active:scale-[0.98] disabled:opacity-40"><div className="flex items-start gap-3"><Avatar name={player.name} imageUrl={player.imageUrl} /><div className="min-w-0 flex-1"><div className="truncate font-bold text-white">{player.name}</div><div className="mt-1 flex items-center gap-2"><RoleBadge role={player.role} /><span className="text-xs text-slate-500">{selectable ? `#${option.eligiblePositions.join(", #")}` : option.status.toLowerCase().replaceAll("_", " ")}</span></div></div></div><div className="mt-3 grid grid-cols-2 gap-2"><Rating label="BAT" value={player.attributes?.batting ?? 50} color="bg-blue-400" /><Rating label="BWL" value={player.attributes?.bowling ?? 50} color="bg-red-400" /></div>{selectable && <p className="mt-2 text-center text-xs font-bold text-green-400">TAP TO PICK</p>}</button>;
}

function ReadyPanel({ state, ready }: { state: RoomState; ready: () => void }) { return <div className="mx-auto mt-20 max-w-lg text-center"><h2 className="text-3xl font-black">Your XI is ready</h2><p className="mt-3 text-slate-400">{state.opponent?.ready ? "Your opponent is ready too." : "Waiting for your opponent to finish their XI."}</p><button disabled={state.you.ready} onClick={ready} className="mt-8 rounded-xl bg-green-500 px-8 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">{state.you.ready ? "Ready — waiting for opponent" : "Ready & reveal squads"}</button></div>; }
function Reveal({ state }: { state: RoomState }) { return <RoomShell><p className="text-sm font-bold uppercase tracking-widest text-green-400">Both squads are locked</p><h1 className="mt-2 text-3xl font-black">Squad Reveal</h1><p className="mt-2 text-slate-400">The toss will happen automatically in 10 seconds.</p><div className="mt-8 grid gap-5 md:grid-cols-2"><Squad title={`${state.you.name}'s XI`} players={state.squads?.you ?? []} /><Squad title={`${state.opponent?.name ?? "Opponent"}'s XI`} players={state.squads?.opponent ?? []} /></div></RoomShell>; }
function TossScreen({ state }: { state: RoomState }) { const toss = state.toss; return <RoomShell><div className="text-6xl">🪙</div><p className="mt-5 text-sm font-bold uppercase tracking-widest text-amber-400">Toss result</p><h1 className="mt-2 text-3xl font-black">{toss?.winner} won the toss</h1><p className="mt-3 text-lg text-slate-300">and chose to {toss?.decision === "BAT" ? "bat" : "bowl"} first.</p><p className="mt-10 text-sm text-slate-500">The server will use this decision to start the shared match simulation.</p></RoomShell>; }
function MatchStarting({ state }: { state: RoomState }) {
  const playback = state.playback;
  const [now, setNow] = useState(Date.now());
  const [showFull, setShowFull] = useState(false);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 100); return () => clearInterval(timer); }, []);
  if (!playback) return <RoomShell><div className="text-6xl animate-bounce">🏏</div><p className="mt-5 text-green-400">Preparing the shared match…</p></RoomShell>;
  const revealed = Math.max(0, Math.min(playback.events.length, Math.floor((now - playback.startedAt) / 350)));
  const shown = playback.events.slice(0, revealed);
  const innings = shown.at(-1)?.innings ?? 1;
  const inningEvents = shown.filter((event) => event.innings === innings);
  const battingTeam = innings === 1 ? playback.firstTeam : playback.secondTeam;
  const bowlingTeam = innings === 1 ? playback.secondTeam : playback.firstTeam;
  const score = liveScore(inningEvents);
  const complete = revealed >= playback.events.length;
  const youBat = battingTeam === state.you.name;
  return <div className="min-h-screen bg-slate-950 p-4 text-white"><header className="mx-auto flex max-w-7xl justify-between text-sm font-bold"><span>{state.you.name}</span><span className="text-slate-500">vs</span><span>{state.opponent?.name}</span></header><main className="mx-auto mt-5 grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]"><LiveTable title={`${state.you.name} ${youBat ? "batting" : "bowling"}`} events={inningEvents} batting={youBat} /><section className="min-w-0"><div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center"><p className="text-xs font-bold uppercase tracking-widest text-green-400">Live scorecard</p><h1 className="mt-2 text-2xl font-black">{battingTeam} {score.runs}/{score.wickets}</h1><p className="text-slate-400">{score.overs} ov · {bowlingTeam} bowling</p></div><div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4"><p className="text-center text-sm text-slate-400">Latest ball</p><div className="mt-2 text-center text-4xl font-black">{shown.at(-1) ? ballLabel(shown.at(-1)!.outcome) : "•"}</div><div className="mt-5 max-h-48 overflow-y-auto"><div className="flex flex-wrap gap-2">{inningEvents.slice(-6).map((event, index) => <span key={`${revealed}-${index}`} className={`rounded-full px-3 py-1 text-xs font-bold ${event.wicket ? "bg-red-600" : "bg-slate-700"}`}>{ballLabel(event.outcome)}</span>)}</div><div className="mt-4 space-y-1 text-xs text-slate-500">{inningEvents.slice(0, -6).map((event, index) => <div key={index}>{event.batter} · {ballLabel(event.outcome)}</div>)}</div></div></div>{complete && <div className="mt-5 text-center"><h2 className="text-2xl font-black">{playback.winner ? `${playback.winner} wins!` : "Match tied!"}</h2><button onClick={() => setShowFull(!showFull)} className="mt-3 rounded-lg bg-green-500 px-5 py-2 font-bold text-slate-950">View full scorecard</button>{showFull && <p className="mt-3 text-sm text-slate-400">{playback.firstTeam} {playback.firstScore} · {playback.secondTeam} {playback.secondScore}</p>}</div>}</section><LiveTable title={`${state.opponent?.name} ${youBat ? "bowling" : "batting"}`} events={inningEvents} batting={!youBat} /></main></div>;
}
function LiveTable({ title, events, batting }: { title: string; events: NonNullable<RoomState["playback"]>["events"]; batting: boolean }) { const stats = new Map<string, { runs: number; balls: number; wickets: number }>(); for (const event of events) { const name = batting ? event.batter : event.bowler; const row = stats.get(name) ?? { runs: 0, balls: 0, wickets: 0 }; row.runs += event.runs; row.balls += event.legal ? 1 : 0; row.wickets += event.wicket ? 1 : 0; stats.set(name, row); } return <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3"><h2 className="mb-3 font-bold">{title}</h2><div className="space-y-1 text-xs">{[...stats.entries()].map(([name, row]) => <div key={name} className="flex justify-between rounded bg-slate-800 px-2 py-2"><span className="truncate">{name}</span><span>{batting ? `${row.runs} (${row.balls})` : `${row.balls / 6 | 0}.${row.balls % 6}-${row.runs}-${row.wickets}`}</span></div>)}</div></section>; }
function liveScore(events: NonNullable<RoomState["playback"]>["events"]) { const runs = events.reduce((sum, event) => sum + event.runs, 0); const wickets = events.filter((event) => event.wicket).length; const balls = events.filter((event) => event.legal).length; return { runs, wickets, overs: `${Math.floor(balls / 6)}.${balls % 6}` }; }
function ballLabel(outcome: string) { return outcome === "DOT" ? "•" : outcome === "WICKET" ? "W" : outcome === "RUN_OUT" ? "RO" : outcome === "FOUR" ? "4" : outcome === "SIX" ? "6" : outcome === "WIDE" ? "WD" : outcome === "NO_BALL" ? "NB" : outcome === "LEG_BYE" ? "LB" : outcome === "BYE" ? "B" : outcome.replace(/[^0-9]/g, "") || "1"; }

function Squad({ title, players }: { title: string; players: SquadPlayer[] }) { return <section className="rounded-2xl border border-slate-700 bg-slate-900 p-3"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{title}</h2><span className="text-xs text-slate-400">{players.length}/11</span></div><ol className="space-y-1">{Array.from({ length: 11 }, (_, index) => { const position = index + 1; const player = players.find((item) => item.position === position); return <li key={position} className="flex min-h-9 items-center gap-2 rounded-lg bg-slate-800/80 px-2 py-1"><span className="w-4 text-xs text-slate-500">{position}</span>{player ? <><Avatar name={player.name} imageUrl={player.imageUrl} small /><span className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</span><RoleBadge role={player.role} /></> : <span className="text-xs italic text-slate-600">— empty —</span>}</li>; })}</ol></section>; }
function RoleBadge({ role }: { role: Role }) { return <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${ROLE_STYLE[role]}`}>{ROLE_LABEL[role]}</span>; }
function Rating({ label, value, color }: { label: string; value: number; color: string }) { return <div className="flex items-center gap-1"><span className="w-7 text-xs text-slate-500">{label}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700"><span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></span><span className="w-5 text-right text-xs text-slate-400">{value}</span></div>; }
function Avatar({ name, imageUrl, small = false }: { name: string; imageUrl?: string; small?: boolean }) { const [imageFailed, setImageFailed] = useState(false); const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase(); const size = small ? "h-7 w-7 text-[10px]" : "h-12 w-12 text-sm"; return imageUrl && !imageFailed ? <img src={imageUrl} alt="" onError={() => setImageFailed(true)} className={`${size} shrink-0 rounded-full object-cover bg-slate-700 ring-1 ring-slate-600`} /> : <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold text-slate-200 ring-1 ring-slate-600`}>{initials}</span>; }
function RoomShell({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-slate-950 p-6 text-center text-white"><main className="mx-auto max-w-3xl pt-20">{children}</main></div>; }
function BackButton({ onLeave }: { onLeave: () => void }) { return <button onClick={onLeave} className="mt-8 text-sm text-slate-400 hover:text-white">← Leave room</button>; }
