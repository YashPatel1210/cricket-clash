import type { OperationResult } from "../common";
import type { TeamRules } from "../rules";
import { TeamSelection } from "./TeamSelection";
import { PlayerRole } from "@cricket-clash/shared";

export class Team {
  private readonly selections: TeamSelection[] = [];

  constructor(
    private readonly rules: TeamRules,
  ) {}

  public getSelections(): ReadonlyArray<TeamSelection> {
    return this.selections;
  }

  public addSelection(selection: TeamSelection): OperationResult {
    const playerCountValidation = this.validatePlayerCount();

    if (!playerCountValidation.success) {
      return playerCountValidation;
    }

    const battingPositionValidation =
      this.validateBattingPosition(selection);

    if (!battingPositionValidation.success) {
      return battingPositionValidation;
    }

    const captainValidation =
      this.validateCaptain(selection);

    if (!captainValidation.success) {
      return captainValidation;
    }
    const roleValidation =
      this.validateRoleLimit(selection);

    if (!roleValidation.success) {
      return roleValidation;
    }

    this.selections.push(selection);

    return {
      success: true,
    };
  }

  private validatePlayerCount(): OperationResult {
    if (this.selections.length >= this.rules.maxPlayers) {
      return {
        success: false,
        message: "Team already contains the maximum number of players.",
      };
    }

    return {
      success: true,
    };
  }

  private getRoleCount(role: PlayerRole): number {
    return this.selections.filter(
      selection => selection.player.role === role,
    ).length;
  }

  private validateRoleLimit(
  selection: TeamSelection,
): OperationResult {

  const role = selection.player.role;

  const currentCount = this.getRoleCount(role);

  const limit = this.rules.roleLimits[role];

  if (currentCount >= limit.max) {
    return {
      success: false,
      message: `Maximum ${role} limit reached.`,
    };
  }

  return {
    success: true,
  };
}

  private validateBattingPosition(
    selection: TeamSelection,
  ): OperationResult {
    const battingPositionExists = this.selections.some(
      existing =>
        existing.battingPosition === selection.battingPosition,
    );

    if (battingPositionExists) {
      return {
        success: false,
        message: "Batting position is already assigned.",
      };
    }

    return {
      success: true,
    };
  }

  private validateCaptain(
    selection: TeamSelection,
  ): OperationResult {
    if (!selection.isCaptain) {
      return {
        success: true,
      };
    }

    const captainExists = this.selections.some(
      existing => existing.isCaptain,
    );

    if (captainExists) {
      return {
        success: false,
        message: "Captain has already been selected.",
      };
    }

    return {
      success: true,
    };
  }
}