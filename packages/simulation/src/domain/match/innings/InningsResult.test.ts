import { describe, expect, it } from "vitest";

import { InningsBuilder } from "../../../test";

import { Over } from "../over";

import { InningsResult } from "./InningsResult";

describe("InningsResult", () => {
  it("should create an innings result", () => {
    const result = new InningsResult(InningsBuilder.standard().build(), []);

    expect(result).toBeDefined();
  });

  it("should expose the innings", () => {
    const innings = InningsBuilder.standard().build();

    const result = new InningsResult(innings, []);

    expect(result.getInnings()).toBe(innings);
  });

  it("should expose overs", () => {
    const overs = [new Over([]), new Over([])];

    const result = new InningsResult(InningsBuilder.standard().build(), overs);

    expect(result.getOvers()).toBe(overs);
  });

  it("should expose the total overs bowled", () => {
    const overs = [new Over([]), new Over([]), new Over([])];

    const result = new InningsResult(InningsBuilder.standard().build(), overs);

    expect(result.totalOvers()).toBe(3);
  });
});
