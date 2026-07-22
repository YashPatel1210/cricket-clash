import type { DraftPickOption } from "@cricket-clash/simulation/domain/draft/DraftPickOption";
import { DraftPickStatus } from "@cricket-clash/simulation/domain/draft/DraftPickStatus";
import type { BattingPosition } from "@cricket-clash/simulation/domain/draft/BattingPosition";

const ROLE_COLOR: Record<string, string> = {
  BATTER:        "bg-blue-500/20 text-blue-300 border-blue-500/30",
  WICKET_KEEPER: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  ALL_ROUNDER:   "bg-amber-500/20 text-amber-300 border-amber-500/30",
  BOWLER:        "bg-red-500/20 text-red-300 border-red-500/30",
};

const ROLE_LABEL: Record<string, string> = {
  BATTER: "BAT", WICKET_KEEPER: "WK", ALL_ROUNDER: "AR", BOWLER: "BOW",
};

// England flag uses Unicode tag chars that break some parsers — use text fallback
const COUNTRY_FLAG: Record<string, string> = {
  "India":        "\uD83C\uDDEE\uD83C\uDDF3",  // 🇮🇳
  "Australia":    "\uD83C\uDDE6\uD83C\uDDFA",  // 🇦🇺
  "England":      "ENG",                        // avoid tag-emoji parser issues
  "Pakistan":     "\uD83C\uDDF5\uD83C\uDDF0",  // 🇵🇰
  "South Africa": "\uD83C\uDDFF\uD83C\uDDE6",  // 🇿🇦
  "New Zealand":  "\uD83C\uDDF3\uD83C\uDDFF",  // 🇳🇿
  "Bangladesh":   "\uD83C\uDDE7\uD83C\uDDE9",  // 🇧🇩
  "Afghanistan":  "\uD83C\uDDE6\uD83C\uDDEB",  // 🇦🇫
  "Ireland":      "\uD83C\uDDEE\uD83C\uDDEA",  // 🇮🇪
};

function unavailableReason(status: DraftPickStatus): string {
  switch (status) {
    case DraftPickStatus.ALREADY_PICKED:        return "picked";
    case DraftPickStatus.ROLE_LIMIT_REACHED:    return "role full";
    case DraftPickStatus.NO_ELIGIBLE_POSITION:  return "no position";
    case DraftPickStatus.SQUAD_FULL:            return "squad full";
    case DraftPickStatus.MUST_FILL_MINIMUM:     return "fill min first";
    default: return "unavailable";
  }
}

interface Props {
  option: DraftPickOption;
  onPick: (position: BattingPosition) => void;
}

export function PlayerCard({ option, onPick }: Props) {
  const player        = option.player;
  const selectable    = option.isSelectable();
  const alreadyPicked = option.status === DraftPickStatus.ALREADY_PICKED;
  const mustFillMin   = option.status === DraftPickStatus.MUST_FILL_MINIMUM;

  const role      = player.role as string;
  const roleColor = ROLE_COLOR[role] ?? "bg-slate-700 text-slate-300 border-slate-600";
  const flag      = COUNTRY_FLAG[player.country as string] ?? "?";

  const bestPosition = selectable
    ? option.eligiblePositions[Math.floor(option.eligiblePositions.length / 2)]
    : null;

  const attrs      = player.attributes as { batting?: number; bowling?: number } | undefined;
  const batRating  = attrs?.batting  ?? 50;
  const bowlRating = attrs?.bowling  ?? 50;

  return (
    <div
      className={[
        "relative rounded-xl border p-3 transition-all select-none",
        selectable
          ? "border-slate-600 bg-slate-800 hover:border-green-500 cursor-pointer active:scale-95"
          : mustFillMin
            ? "border-orange-800/40 bg-slate-800/30 opacity-60 cursor-not-allowed"
            : "border-slate-700/50 bg-slate-800/40 opacity-40 cursor-not-allowed",
      ].join(" ")}
      onClick={() => selectable && bestPosition && onPick(bestPosition)}
    >
      {alreadyPicked && (
        <div className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 rounded px-1.5 py-0.5">
          picked
        </div>
      )}
      {mustFillMin && (
        <div className="absolute top-2 right-2 text-xs bg-orange-500/20 text-orange-400 rounded px-1.5 py-0.5">
          locked
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className="text-base leading-none mt-0.5 font-mono">{flag}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate text-white">{player.name}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded border font-mono font-bold ${roleColor}`}>
              {ROLE_LABEL[role] ?? role}
            </span>
            {selectable && option.eligiblePositions.length > 0 && (
              <span className="text-xs text-slate-500">
                #{option.eligiblePositions.map((p) => p.getValue()).join(",")}
              </span>
            )}
            {!selectable && !alreadyPicked && (
              <span className="text-xs text-slate-600 italic">{unavailableReason(option.status)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1">
        <RatingBar label="BAT" value={batRating}  color="bg-blue-400" />
        <RatingBar label="BWL" value={bowlRating} color="bg-red-400"  />
      </div>

      {selectable && (
        <div className="mt-1.5 text-center text-xs font-semibold text-green-400/80">TAP TO PICK</div>
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
