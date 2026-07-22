import type { DraftParticipant } from "@cricket-clash/simulation/domain/draft/DraftParticipant";

const ROLE_LABEL: Record<string, string> = {
  BATTER: "BAT", WICKET_KEEPER: "WK", ALL_ROUNDER: "AR", BOWLER: "BOW",
};

const ROLE_DOT: Record<string, string> = {
  BATTER:        "bg-blue-400",
  WICKET_KEEPER: "bg-purple-400",
  ALL_ROUNDER:   "bg-amber-400",
  BOWLER:        "bg-red-400",
};

const ALL_ROLES = ["BATTER", "WICKET_KEEPER", "ALL_ROUNDER", "BOWLER"] as const;

interface Props {
  participant: DraftParticipant;
  name: string;
  isActive: boolean;
}

export function SquadPanel({ participant, name, isActive }: Props) {
  const picks = participant.squad.getAllPicks();
  const rules  = participant.squad.getRules();

  const roleCount = (role: string) =>
    participant.squad.roleCount(role as never);

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isActive
        ? "border-green-500/50 bg-slate-800/60"
        : "border-slate-700/40 bg-slate-900/40 opacity-60"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-white">{name}'s Squad</h3>
        <span className="text-xs text-slate-400">{picks.length}/11</span>
      </div>

      {/* Role summary */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {ALL_ROLES.map((role) => {
          const count = roleCount(role);
          const lim   = rules.limits[role];
          if (!lim) return null;
          const ok = count >= lim.min;
          return (
            <span
              key={role}
              className={`text-xs px-2 py-0.5 rounded-full ${
                ok ? "bg-slate-700 text-slate-300" : "bg-red-900/40 text-red-400"
              }`}
            >
              {ROLE_LABEL[role]} {count}/{lim.max}
            </span>
          );
        })}
      </div>

      {/* Slots */}
      <div className="space-y-1">
        {Array.from({ length: 11 }, (_, i) => i + 1).map((pos) => {
          const pick = picks.find((p) => p.position.getValue() === pos);
          return (
            <div
              key={pos}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                pick ? "bg-slate-700/60" : "bg-slate-800/30"
              }`}
            >
              <span className="text-xs text-slate-500 w-4 font-mono">{pos}</span>
              {pick ? (
                <>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    ROLE_DOT[pick.player.role as string] ?? "bg-slate-500"
                  }`} />
                  <span className="text-xs text-white truncate flex-1">{pick.player.name}</span>
                  <span className="text-xs text-slate-500">
                    {ROLE_LABEL[pick.player.role as string] ?? pick.player.role}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-600 italic">— empty —</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
