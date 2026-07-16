import { Player } from "../../player";

import { BatterRecord } from "./BatterRecord";
import { BowlerRecord } from "./BowlerRecord";

export class InningsStatistics {
  private constructor(
    private readonly batterRecords: ReadonlyMap<string, BatterRecord>,
    private readonly bowlerRecords: ReadonlyMap<string, BowlerRecord>,
    private readonly extras: number,
  ) {}

  public static empty(): InningsStatistics {
    return new InningsStatistics(new Map(), new Map(), 0);
  }

  public getBatterRecord(batter: Player): BatterRecord {
    return (
      this.batterRecords.get(batter.id) ?? new BatterRecord(batter)
    );
  }

  public getBowlerRecord(bowler: Player): BowlerRecord {
    return (
      this.bowlerRecords.get(bowler.id) ?? new BowlerRecord(bowler)
    );
  }

  public getAllBatterRecords(): ReadonlyArray<BatterRecord> {
    return Array.from(this.batterRecords.values());
  }

  public getAllBowlerRecords(): ReadonlyArray<BowlerRecord> {
    return Array.from(this.bowlerRecords.values());
  }

  public getExtras(): number {
    return this.extras;
  }

  public withBatterRecord(record: BatterRecord): InningsStatistics {
    const updated = new Map(this.batterRecords);
    updated.set(record.getBatter().id, record);
    return new InningsStatistics(updated, this.bowlerRecords, this.extras);
  }

  public withBowlerRecord(record: BowlerRecord): InningsStatistics {
    const updated = new Map(this.bowlerRecords);
    updated.set(record.getBowler().id, record);
    return new InningsStatistics(this.batterRecords, updated, this.extras);
  }
}
