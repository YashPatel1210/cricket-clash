import type { OperationResult } from "../common";
import type { TeamRules } from "../rules";
import { TeamSelection } from "./TeamSelection";
import { PlayerRole } from "@cricket-clash/shared";
import type { RoleLimit } from "../rules";
import { Player } from "../player";

export class Team {
  private readonly selections: TeamSelection[] = [];

  constructor(private readonly rules: TeamRules) {}

  public getSelections(): ReadonlyArray<TeamSelection> {
    return this.selections;
  }
  public getPlayers(): ReadonlyArray<Player> {
    return this.selections.map((selection) => selection.player);
  }
  public selectedPlayerIds(): ReadonlyArray<string> {
    return this.selections.map((selection) => selection.player.id);
  }
  public getCaptain(): Player | undefined {
    return this.selections.find((selection) => selection.isCaptain)?.player;
  }

  public addSelection(selection: TeamSelection): OperationResult {
    const playerCountValidation = this.validatePlayerCount();

    if (!playerCountValidation.success) {
      return playerCountValidation;
    }

    const battingPositionValidation = this.validateBattingPosition(selection);

    if (!battingPositionValidation.success) {
      return battingPositionValidation;
    }

    const captainValidation = this.validateCaptain(selection);

    if (!captainValidation.success) {
      return captainValidation;
    }
    const roleValidation = this.validateRoleLimit(selection);

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

  private validateRoleLimit(selection: TeamSelection): OperationResult {
    const role = selection.player.role;

    const currentCount = this.roleCount(role);

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

  private validateBattingPosition(selection: TeamSelection): OperationResult {
    const battingPositionExists = this.selections.some(
      (existing) => existing.battingPosition === selection.battingPosition,
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

  private validateCaptain(selection: TeamSelection): OperationResult {
    if (!selection.isCaptain) {
      return {
        success: true,
      };
    }

    const captainExists = this.selections.some(
      (existing) => existing.isCaptain,
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

  public roleCount(role: PlayerRole): number {
    return this.selections.filter((selection) => selection.player.role === role)
      .length;
  }

  public roleLimit(role: PlayerRole): RoleLimit {
    return this.rules.roleLimits[role];
  }

  public minimumRoleCount(role: PlayerRole): number {
    return this.roleLimit(role).min;
  }

  public maximumRoleCount(role: PlayerRole): number {
    return this.roleLimit(role).max;
  }
  public playerCount(): number {
    return this.selections.length;
  }
  public isComplete(): boolean {
    return this.playerCount() >= this.rules.maxPlayers;
  }
  public nextBattingPosition(): number {
    return this.selections.length + 1;
  }
  public addPlayer(player: Player): OperationResult {
    return this.addSelection(
      new TeamSelection(player, this.nextBattingPosition()),
    );
  }
  public battingOrder(): ReadonlyArray<Player> {
    return [...this.selections]
      .sort((left, right) => left.battingPosition - right.battingPosition)
      .map((selection) => selection.player);
  }
}
