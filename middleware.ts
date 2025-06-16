import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Criar cliente do Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Atualizar a sessão se existir um token de acesso
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário não estiver autenticado e tentar acessar o dashboard ou onboarding
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname === "/onboarding")
  ) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se o usuário estiver autenticado e tentar acessar login/register
  if (
    session &&
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/register" ||
      req.nextUrl.pathname === "/")
  ) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se o usuário está autenticado e não completou o onboarding
  if (
    session &&
    req.nextUrl.pathname.startsWith("/dashboard") &&
    !session.user.user_metadata?.onboarding_completed &&
    req.nextUrl.pathname !== "/onboarding"
  ) {
    // Determinar tipo de login para o redirecionamento
    const loginType =
      session.user.app_metadata?.provider === "google" ||
      session.user.app_metadata?.provider === "facebook"
        ? session.user.app_metadata.provider
        : "email";

    const redirectUrl = new URL(`/onboarding?type=${loginType}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se o usuário já completou o onboarding e tenta acessar a página de onboarding
  if (
    session &&
    req.nextUrl.pathname === "/onboarding" &&
    session.user.user_metadata?.onboarding_completed
  ) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configurar quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
    "/onboarding",
    "/api/auth/create-user-plan",
    "/api/stripe/checkout",
  ],
};
