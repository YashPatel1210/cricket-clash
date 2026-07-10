import { describe, expect, it } from "vitest";

import { InMemoryPlayerRepository } from "../player";
import { PlayerPool } from "./PlayerPool";
import { PlayerBuilder } from "../../test";

describe("PlayerPool", () => {
  it("should create player pool from repository", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const bumrah = PlayerBuilder
      .bowler()
      .named("Jasprit Bumrah")
      .build();

    const repository =
      new InMemoryPlayerRepository([
        virat,
        bumrah,
      ]);

    // Act
    const pool = new PlayerPool(
      repository.getAll(),
    );

    // Assert
    expect(pool.size()).toBe(2);
  });

  it("should contain player", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const repository =
      new InMemoryPlayerRepository([
        virat,
      ]);

    // Act
    const pool = new PlayerPool(
      repository.getAll(),
    );

    // Assert
    expect(
      pool.hasPlayer(virat.id),
    ).toBe(true);
  });

  it("should expose repository players", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const repository =
      new InMemoryPlayerRepository([
        virat,
      ]);

    // Act
    const pool = new PlayerPool(
      repository.getAll(),
    );

    // Assert
    expect(
      pool.getPlayers(),
    ).toContain(virat);
  });
});