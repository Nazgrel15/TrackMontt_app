import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  res.cookies.set("tm_auth", "", { path: "/", maxAge: 0 });
  return res;
}
