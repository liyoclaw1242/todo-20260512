// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect } from "vitest";
import Page from "./page.js";

// Minimal localStorage mock — resets between tests.
function makeLocalStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => {
      store[k] = v;
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
}

const lsMock = makeLocalStorageMock();
Object.defineProperty(window, "localStorage", {
  value: lsMock,
  writable: false,
});

beforeEach(() => {
  lsMock.clear();
});

// ── AC#1 ─────────────────────────────────────────────────────────────────────
describe("AC#1 — add a todo via the form", () => {
  it("title-only todo appears in the list immediately", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Buy groceries");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("todo with optional due date also appears in the list", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Doctor visit");
    await user.type(screen.getByLabelText(/due date/i), "2026-05-20");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText("Doctor visit")).toBeInTheDocument();
  });

  it("does not add a todo when title is empty", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.queryAllByRole("listitem").length).toBe(0);
  });
});

// ── AC#2 ─────────────────────────────────────────────────────────────────────
describe("AC#2 — toggle a todo complete", () => {
  it("completed todo shows a distinct visual state (line-through / aria-checked)", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Read book");
    await user.click(screen.getByRole("button", { name: /add/i }));

    const checkbox = screen.getByRole("checkbox", { name: /Read book/i });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    // The text should also carry a visual indicator via data attribute or style.
    const item = screen.getByTestId("todo-item");
    expect(item).toHaveAttribute("data-completed", "true");
  });
});

// ── AC#3 ─────────────────────────────────────────────────────────────────────
describe("AC#3 — delete a todo", () => {
  it("deleted todo disappears from the list immediately", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Write tests");
    await user.click(screen.getByRole("button", { name: /add/i }));

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
  });
});

// ── AC#4 ─────────────────────────────────────────────────────────────────────
describe("AC#4 — edit a todo's title and/or due date", () => {
  it("updated title is reflected in the list", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Old title");
    await user.click(screen.getByRole("button", { name: /add/i }));

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const titleEdit = screen.getByDisplayValue("Old title");
    await user.clear(titleEdit);
    await user.type(titleEdit, "New title");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText("New title")).toBeInTheDocument();
    expect(screen.queryByText("Old title")).not.toBeInTheDocument();
  });
});

// ── AC#5 ─────────────────────────────────────────────────────────────────────
// localStorage persistence is tested separately in lib/store.test.ts.
// Here we do a light smoke-test: add a todo, re-render (simulates reload),
// the todo is still present.
describe("AC#5 — todos survive a re-render (localStorage)", () => {
  it("todos loaded from localStorage on mount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);

    await user.type(screen.getByLabelText(/title/i), "Persisted task");
    await user.click(screen.getByRole("button", { name: /add/i }));

    unmount();
    render(<Page />);

    expect(screen.getByText("Persisted task")).toBeInTheDocument();
  });
});
