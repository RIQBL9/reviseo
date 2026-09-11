import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/app/(auth)/login/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <AuthShell title="Welcome back" description="Log in to pick up your revision where you left off.">
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
