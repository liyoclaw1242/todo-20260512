import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createServer } from "./server.js";

describe("GET /health", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  it("returns 200 with status:ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const res = await fetch(`${baseUrl}/nonexistent`);
    expect(res.status).toBe(404);
  });
});

describe("GET / (main page)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  it("returns 200 HTML with a search input visible", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toContain("text/html");
    const html = await res.text();
    expect(html).toContain('<input');
    expect(html).toContain('type="search"');
  });
});

describe("GET / — AC#5: inline script uses only standard DOM APIs (no JS errors)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  it("page HTML does not use eval or document.write", async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    expect(html).not.toContain("eval(");
    expect(html).not.toContain("document.write(");
  });

  it("inline script uses addEventListener (no deprecated onX attribute on input)", async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    // The input element itself must NOT have an oninput= attribute (that
    // would require the HTML parser to evaluate JS in attribute context,
    // which is less reliable cross-browser). Behaviour must be wired via
    // addEventListener in the <script> block.
    expect(html).not.toMatch(/input[^>]+oninput\s*=/);
    expect(html).toContain("addEventListener");
  });
});

describe("GET /todos", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  });

  it("returns 200 with todos:[]", async () => {
    const res = await fetch(`${baseUrl}/todos`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ todos: [] });
  });
});
