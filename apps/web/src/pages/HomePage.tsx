import { useState } from "react";
import { io } from "socket.io-client";

interface Props {
  onRoomReady: (roomCode: string, accessToken: string) => void;
}

const SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL ?? "http://localhost:3001";

export default function HomePage({ onRoomReady }: Props) {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const request = (event: "room:create" | "room:join") => {
    setError(null);
    setBusy(true);
    const socket = io(SERVER_URL);
    const payload = event === "room:create" ? { name } : { name, roomCode: joinCode };
    socket.emit(event, payload, (response: { ok: boolean; roomCode?: string; accessToken?: string; error?: string }) => {
      socket.disconnect();
      setBusy(false);
      if (!response.ok || !response.roomCode || !response.accessToken) {
        setError(response.error ?? "Unable to join a room.");
        return;
      }
      onRoomReady(response.roomCode, response.accessToken);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center">
        <div className="text-7xl mb-4">🏏</div>
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Cricket Clash</h1>
        <p className="mt-3 text-slate-400 text-lg">Create a room, draft in parallel, then face the revealed XI.</p>

        <div className="mt-10 space-y-4 text-left">
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your name</span><input value={name} onChange={(event) => setName(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter name" /></label>
          <button disabled={busy} onClick={() => request("room:create")} className="w-full rounded-xl bg-green-500 px-8 py-4 text-lg font-bold text-slate-950 transition-colors hover:bg-green-400 disabled:bg-slate-700">Create Room</button>
          <div className="flex items-center gap-3 py-2 text-xs uppercase tracking-widest text-slate-600"><span className="h-px flex-1 bg-slate-800" />or<span className="h-px flex-1 bg-slate-800" /></div>
          <label className="flex flex-col gap-1"><span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Room code</span><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="ABC123" /></label>
          <button disabled={busy || !joinCode.trim()} onClick={() => request("room:join")} className="w-full rounded-xl border border-green-500/50 px-8 py-4 text-lg font-bold text-green-300 transition-colors hover:bg-green-500/10 disabled:border-slate-700 disabled:text-slate-600">Join Room</button>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
