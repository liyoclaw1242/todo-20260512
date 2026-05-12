/**
 * Unit tests for getDueDateStatus pure utility.
 * Covers AC#1, AC#2, AC#4, AC#5 at the logic layer.
 */

import { describe, it, expect } from "vitest";
import { getDueDateStatus } from "./utils.js";

const TODAY = "2026-05-13";
const YESTERDAY = "2026-05-12";
const TOMORROW = "2026-05-14";

// ── AC#1 ──────────────────────────────────────────────────────────────────────

describe("AC#1 — overdue", () => {
  it("returns 'overdue' when due_date is strictly before today and not completed", () => {
    expect(getDueDateStatus(YESTERDAY, false, TODAY)).toBe("overdue");
  });

  it("returns 'overdue' for a date far in the past", () => {
    expect(getDueDateStatus("2020-01-01", false, TODAY)).toBe("overdue");
  });
});

// ── AC#2 ──────────────────────────────────────────────────────────────────────

describe("AC#2 — due today", () => {
  it("returns 'today' when due_date equals today and not completed", () => {
    expect(getDueDateStatus(TODAY, false, TODAY)).toBe("today");
  });
});

// ── AC#4 ──────────────────────────────────────────────────────────────────────

describe("AC#4 — no due date", () => {
  it("returns null when due_date is null", () => {
    expect(getDueDateStatus(null, false, TODAY)).toBeNull();
  });

  it("returns null for future date (no alert needed)", () => {
    expect(getDueDateStatus(TOMORROW, false, TODAY)).toBeNull();
  });
});

// ── AC#5 ──────────────────────────────────────────────────────────────────────

describe("AC#5 — completed todo ignores due date", () => {
  it("returns null for completed todo with overdue date", () => {
    expect(getDueDateStatus(YESTERDAY, true, TODAY)).toBeNull();
  });

  it("returns null for completed todo due today", () => {
    expect(getDueDateStatus(TODAY, true, TODAY)).toBeNull();
  });
});
