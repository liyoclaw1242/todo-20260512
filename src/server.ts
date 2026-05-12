import { createServer as createHttpServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";

/**
 * Build the HTTP server. Pure factory — does not call listen() so tests can
 * invoke it with an ephemeral port via `server.listen(0)`.
 */
export function createServer(): Server {
  return createHttpServer(handler);
}

function handler(req: IncomingMessage, res: ServerResponse): void {
  const url = req.url ?? "/";

  if (req.method === "GET" && url === "/health") {
    return json(res, 200, { status: "ok" });
  }

  json(res, 404, { error: "not found" });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

// Run the server when invoked directly (pnpm dev).
const isMain = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`;
if (isMain) {
  const port = Number(process.env.PORT ?? 3000);
  createServer().listen(port, () => {
    console.log(`listening on http://127.0.0.1:${port}`);
  });
}
