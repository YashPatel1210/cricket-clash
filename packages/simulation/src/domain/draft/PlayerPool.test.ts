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

    const repository = new InMemoryPlayerRepository([
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

    const repository = new InMemoryPlayerRepository([
      virat,
    ]);

    const pool = new PlayerPool(
      repository.getAll(),
    );

    // Assert
    expect(pool.hasPlayer(virat.id)).toBe(true);
  });

  it("should expose repository players", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const repository = new InMemoryPlayerRepository([
      virat,
    ]);

    const pool = new PlayerPool(
      repository.getAll(),
    );

    // Assert
    expect(pool.getPlayers()).toContain(
      virat,
    );
  });

  it("should exclude players", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .named("Virat Kohli")
      .build();

    const rohit = PlayerBuilder
      .batter()
      .named("Rohit Sharma")
      .build();

    const bumrah = PlayerBuilder
      .bowler()
      .named("Jasprit Bumrah")
      .build();

    const pool = new PlayerPool([
      virat,
      rohit,
      bumrah,
    ]);

    // Act
    const filtered = pool.exclude([
      virat.id,
    ]);

    // Assert
    expect(filtered.size()).toBe(2);
    expect(filtered.hasPlayer(virat.id)).toBe(
      false,
    );
    expect(filtered.hasPlayer(rohit.id)).toBe(
      true,
    );
    expect(filtered.hasPlayer(bumrah.id)).toBe(
      true,
    );
  });

  it("should not mutate original player pool", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .build();

    const rohit = PlayerBuilder
      .batter()
      .build();

    const bumrah = PlayerBuilder
      .bowler()
      .build();

    const original = new PlayerPool([
      virat,
      rohit,
      bumrah,
    ]);

    // Act
    const filtered = original.exclude([
      virat.id,
    ]);

    // Assert
    expect(original.size()).toBe(3);
    expect(filtered.size()).toBe(2);
  });

  it("should ignore unknown player ids", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .build();

    const pool = new PlayerPool([
      virat,
    ]);

    // Act
    const filtered = pool.exclude([
      "unknown-player",
    ]);

    // Assert
    expect(filtered.size()).toBe(1);
  });

  it("should return same players when excluding empty collection", () => {
    // Arrange
    const virat = PlayerBuilder
      .batter()
      .build();

    const pool = new PlayerPool([
      virat,
    ]);

    // Act
    const filtered = pool.exclude([]);

    // Assert
    expect(filtered.size()).toBe(1);
  });

  it("should report empty player pool", () => {
    // Arrange
    const pool = new PlayerPool([]);

    // Assert
    expect(pool.isEmpty()).toBe(true);
  });

  it("should report non-empty player pool", () => {
    // Arrange
    const pool = new PlayerPool([
      PlayerBuilder.batter().build(),
    ]);

    // Assert
    expect(pool.isEmpty()).toBe(false);
  });
});