import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
export function proxy(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const isDevelopment = process.env.NODE_ENV === "development";
  // The live picker is local tooling; production keeps its strict nonce policy.
  const scriptPolicy = isDevelopment
    ? "'unsafe-eval' http://localhost:8400"
    : "'strict-dynamic'";
  const liveConnection = isDevelopment ? " http://localhost:8400" : "";
  const policy = `default-src 'self'; script-src 'self' 'nonce-${nonce}' ${scriptPolicy}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'${liveConnection}; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
