import { NextResponse } from "next/server";

export async function POST(req) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("tm_auth", "", { path: "/", maxAge: 0 });
  return res;
}
