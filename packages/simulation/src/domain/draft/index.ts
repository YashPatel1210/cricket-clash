// ── Core draft infrastructure ─────────────────────────────────────────
export { PlayerPool } from "./PlayerPool";
export { DraftOption } from "./DraftOption";
export { DraftOptionState } from "./DraftOptionState";
export { DraftOptionDisableReason } from "./DraftOptionDisableReason";

// ── Position system ────────────────────────────────────────────────────
export { BattingPosition } from "./BattingPosition";
export { PositionRange } from "./PositionRange";

// ── Squad composition ─────────────────────────────────────────────────
export type { SquadCompositionRules, RoleLimit } from "./SquadCompositionRules";
export { T20_SQUAD_RULES } from "./SquadCompositionRules";
export { DraftSquad } from "./DraftSquad";
export type { PickValidation, PickFailureReason } from "./DraftSquad";

// ── Round generation ──────────────────────────────────────────────────
export type { RoundComposition } from "./RoundComposition";
export { ROUND_COMPOSITION_TEMPLATES } from "./RoundComposition";
export { DraftRound, DraftRoundGenerator } from "./DraftRoundGenerator";

// ── Pick options ──────────────────────────────────────────────────────
export { DraftPickStatus } from "./DraftPickStatus";
export { DraftPickOption, buildPickOptions } from "./DraftPickOption";

// ── Participant ───────────────────────────────────────────────────────
export { DraftParticipant } from "./DraftParticipant";

// ── Session ───────────────────────────────────────────────────────────
export { DraftSessionStatus } from "./DraftSessionStatus";
export { DraftSession } from "./DraftSession";
export type { DraftPickResult } from "./DraftSession";
export type { DraftSessionConfig } from "./DraftSessionConfig";
export { DEFAULT_DRAFT_CONFIG } from "./DraftSessionConfig";
export { DraftSessionEngine } from "./DraftSessionEngine";

// ── Legacy (kept for backward compatibility) ──────────────────────────
export { Draft } from "./Draft";
export { DraftStatus } from "./DraftStatus";
export { DraftContext } from "./DraftContext";
export { DraftGenerator } from "./DraftGenerator";
export { PlayingXI } from "./PlayingXI";
export { PlayingXIGenerator } from "./PlayingXIGenerator";
export { DefaultRoleEligibilityStrategy } from "./DefaultRoleEligibilityStrategy";
export type { RoleEligibilityStrategy } from "./RoleEligibilityStrategy";
