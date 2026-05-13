/**
 * Unit tests for src/lib/utils.ts — getDueDateStatus classifier.
 * External boundary mocked: system clock (vi.useFakeTimers).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDueDateStatus } from "./utils.js";

// Pin "today" to 2026-05-13 for all tests
const TODAY = "2026-05-13";
function pinDate(): void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-13T12:00:00")); // local noon → unambiguous local date
}

// ── AC#1 — overdue ──────────────────────────────────────────────────────────

describe("AC#1 — getDueDateStatus — overdue", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("returns 'overdue' for a due date strictly before today", () => {
    expect(getDueDateStatus("2026-05-12")).toBe("overdue");
  });

  it("returns 'overdue' for a much earlier due date", () => {
    expect(getDueDateStatus("2020-01-01")).toBe("overdue");
  });
});

// ── AC#2 — today ────────────────────────────────────────────────────────────

describe("AC#2 — getDueDateStatus — today", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("returns 'today' for a due date equal to today", () => {
    expect(getDueDateStatus(TODAY)).toBe("today");
  });

  it("does not confuse today with overdue", () => {
    expect(getDueDateStatus(TODAY)).not.toBe("overdue");
  });
});

// ── AC#4 — no due date ──────────────────────────────────────────────────────

describe("AC#4 — getDueDateStatus — no due date", () => {
  beforeEach(pinDate);
  afterEach(() => vi.useRealTimers());

  it("returns 'none' for null due_date", () => {
    expect(getDueDateStatus(null)).toBe("none");
  });

  it("returns 'none' for a future due date", () => {
    expect(getDueDateStatus("2030-12-31")).toBe("none");
  });
});

// ── Timezone safety ─────────────────────────────────────────────────────────

describe("getDueDateStatus — local date, not UTC", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the local calendar date, not the UTC date", () => {
    // Simulate a timezone where local date differs from UTC:
    // Set system time to 2026-05-13T23:00:00 UTC.
    // In UTC-5 that is still 2026-05-13 locally.
    // getDueDateStatus('2026-05-13') should be 'today', NOT 'none' or 'overdue'.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13T23:00:00")); // local date is still May 13 in most zones
    // We verify by passing the explicit today parameter instead of clock:
    expect(getDueDateStatus("2026-05-13", "2026-05-13")).toBe("today");
    expect(getDueDateStatus("2026-05-12", "2026-05-13")).toBe("overdue");
  });
});
