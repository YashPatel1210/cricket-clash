import type { DraftPickOption } from "@cricket-clash/simulation/domain/draft/DraftPickOption";
import { DraftPickStatus } from "@cricket-clash/simulation/domain/draft/DraftPickStatus";
import type { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";

// Use literal string keys — avoids ESM init order issues with PlayerRole enum
const ROLE_COLOR: Record<string, string> = {
  BATTER:        "bg-blue-500/20 text-blue-300 border-blue-500/30",
  WICKET_KEEPER: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  ALL_ROUNDER:   "bg-amber-500/20 text-amber-300 border-amber-500/30",
  BOWLER:        "bg-red-500/20 text-red-300 border-red-500/30",
};

const ROLE_LABEL: Record<string, string> = {
  BATTER: "BAT", WICKET_KEEPER: "WK", ALL_ROUNDER: "AR", BOWLER: "BOW",
};

const COUNTRY_FLAG: Record<string, string> = {
  "India":        "🇮🇳",
  "Australia":    "🇦🇺",
  "England":      "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Pakistan":     "🇵🇰",
  "South Africa": "🇿🇦",
  "New Zealand":  "🇳🇿",
  "Bangladesh":   "🇧🇩",
  "Afghanistan":  "🇦🇫",
  "Ireland":      "🇮🇪",
};

interface Props {
  option: DraftPickOption;
  onPick: (position: BattingPosition) => void;
}

export function PlayerCard({ option, onPick }: Props) {
  const player      = option.player;
  const selectable  = option.isSelectable();
  const alreadyPicked = option.status === DraftPickStatus.ALREADY_PICKED;

  const role      = player.role as string;
  const roleColor = ROLE_COLOR[role] ?? "bg-slate-700 text-slate-300 border-slate-600";
  const flag      = COUNTRY_FLAG[player.country as string] ?? "🌍";

  // Best eligible position: middle of the range
  const bestPosition = selectable
    ? option.eligiblePositions[Math.floor(option.eligiblePositions.length / 2)]
    : null;

  // Get batting / bowling ratings from player attributes
  const attrs = player.attributes as { batting?: number; bowling?: number } | undefined;
  const batRating  = attrs?.batting  ?? 50;
  const bowlRating = attrs?.bowling  ?? 50;

  return (
    <div
      className={`
        relative rounded-xl border p-3 transition-all select-none
        ${selectable
          ? "border-slate-600 bg-slate-800 hover:border-green-500 hover:bg-slate-800/90 cursor-pointer active:scale-95"
          : "border-slate-700/50 bg-slate-800/40 opacity-50 cursor-not-allowed"
        }
      `}
      onClick={() => selectable && bestPosition && onPick(bestPosition)}
    >
      {/* Already picked badge */}
      {alreadyPicked && (
        <div className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 rounded px-1.5 py-0.5">
          ✓
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className="text-base leading-none mt-0.5">{flag}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-white">{player.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded border font-mono font-bold ${roleColor}`}>
              {ROLE_LABEL[role] ?? role}
            </span>
            {selectable && option.eligiblePositions.length > 0 && (
              <span className="text-xs text-slate-500">
                #{option.eligiblePositions.map((p) => p.getValue()).join(",")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rating bars */}
      <div className="mt-2 grid grid-cols-2 gap-1">
        <RatingBar label="BAT" value={batRating}  color="bg-blue-400" />
        <RatingBar label="BWL" value={bowlRating} color="bg-red-400"  />
      </div>

      {selectable && (
        <div className="mt-1.5 text-center text-xs font-semibold text-green-400/80">
          TAP TO PICK
        </div>
      )}
    </div>
  );
}

function RatingBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500 w-7">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-5 text-right">{value}</span>
    </div>
  );
}
