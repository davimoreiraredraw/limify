import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  // Após o processamento do código pelo Supabase, redirecionamos o usuário
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
