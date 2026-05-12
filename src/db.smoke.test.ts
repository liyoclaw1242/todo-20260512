/**
 * Smoke test for tauri-plugin-sql wiring (AC#2).
 *
 * tauri-plugin-sql communicates with the Rust backend via Tauri's IPC.
 * At runtime, @tauri-apps/api/core's invoke() resolves through
 * window.__TAURI_INTERNALS__.invoke(). In the vitest/jsdom environment
 * there is no live Tauri runtime, so we install a fake on that global —
 * exactly as we would mock `fetch` when unit-testing an HTTP client.
 *
 * The test verifies:
 *   (a) the package is importable and the Database class exists,
 *   (b) Database.load() correctly goes through the IPC and returns a handle,
 *   (c) db.select() correctly surfaces the row data from the fake backend.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import Database from "@tauri-apps/plugin-sql";

/** Minimal fake of window.__TAURI_INTERNALS__ (the real IPC boundary). */
function makeTauriInternals() {
  return {
    invoke: vi.fn(
      (
        cmd: string,
        _args?: Record<string, unknown>
      ): Promise<unknown> => {
        if (cmd === "plugin:sql|load") {
          return Promise.resolve("sqlite::memory:");
        }
        if (cmd === "plugin:sql|select") {
          return Promise.resolve([{ value: 1 }]);
        }
        return Promise.resolve(null);
      }
    ),
  };
}

beforeEach(() => {
  // Install fake Tauri runtime on the jsdom window object.
  (window as unknown as Record<string, unknown>)["__TAURI_INTERNALS__"] =
    makeTauriInternals();
});

describe("tauri-plugin-sql smoke", () => {
  it("Database class is importable from @tauri-apps/plugin-sql", () => {
    expect(typeof Database).toBe("function");
  });

  it("Database.load resolves without error for sqlite::memory:", async () => {
    const db = await Database.load("sqlite::memory:");
    expect(db).toBeDefined();
  });

  it("db.select runs a trivial query and returns rows", async () => {
    const db = await Database.load("sqlite::memory:");
    const rows = await db.select<{ value: number }[]>("SELECT 1 AS value");
    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0]).toBeDefined();
    expect(rows[0]!.value).toBe(1);
  });
});
