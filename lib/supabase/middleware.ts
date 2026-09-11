import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => path === pathname || (path !== "/" && pathname.startsWith(path)));
}

/**
 * Refreshes the Supabase auth session on every request and enforces the
 * route-protection rules described in CLAUDE.md:
 *  - signed-out users can only see public paths
 *  - signed-in users who haven't onboarded are routed to /onboarding
 *  - signed-in, onboarded users are kept out of auth/onboarding screens
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname);

    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Only check onboarding status for app routes — skip for the public
    // landing page, auth callback, etc.
    const needsOnboardingCheck = pathname.startsWith("/dashboard") ||
      pathname.startsWith("/subjects") ||
      pathname.startsWith("/revision") ||
      pathname.startsWith("/practice") ||
      pathname.startsWith("/progress") ||
      pathname.startsWith("/friends") ||
      pathname.startsWith("/leaderboard") ||
      pathname.startsWith("/settings");

    if (needsOnboardingCheck || pathname.startsWith("/onboarding")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      const onboardingCompleted = profile?.onboarding_completed ?? false;

      if (needsOnboardingCheck && !onboardingCompleted) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (pathname.startsWith("/onboarding") && onboardingCompleted) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
