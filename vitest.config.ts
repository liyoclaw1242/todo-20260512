import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // server tests run in node (default); component/store tests tagged with
    // @vitest-environment jsdom get the browser-like environment.
    environmentMatchGlobs: [
      ["lib/**/*.test.ts", "jsdom"],
      ["components/**/*.test.tsx", "jsdom"],
      ["app/**/*.test.tsx", "jsdom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
