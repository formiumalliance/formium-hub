// src/app/login/page.tsx
import { LoginForm } from "@/components/forms/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign In — Formium Hub" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Formium Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your workspace
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
