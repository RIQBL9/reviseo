import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/app/(auth)/signup/SignUpForm";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your personal revision space in a couple of minutes."
    >
      <SignUpForm />
    </AuthShell>
  );
}
