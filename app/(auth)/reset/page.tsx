"use client";

import { resetPassword } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useBackdrop } from "@/providers/backdrop-provider";

function checkPassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

const ResetForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { show, hide } = useBackdrop();

  // Guard — redirect to /forgot if no token in sessionStorage
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("reset_token")
        : null;
    if (!token) {
      toast.error("Reset session expired. Please start again.");
      router.replace("/forgot");
    }
  }, [router]);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onMutate: () => show("Resetting password…"),
    onSettled: () => hide(),
    onSuccess: () => {
      toast.success("Password reset successfully");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("reset_token");
        sessionStorage.removeItem("reset_email");
      }
      router.replace("/login");
    },
    onError: (err: string) => {
      toast.error(err || "Failed to reset password");
    },
  });

  const rules = checkPassword(password);
  const allRulesMet = Object.values(rules).every(Boolean);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pw = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (!allRulesMet) {
      toast.error("Password does not meet the requirements");
      return;
    }
    if (pw !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? (sessionStorage.getItem("reset_token") ?? "")
        : "";

    mutation.mutate({ token, newPassword: pw });
  };

  const Rule = ({ met, label }: { met: boolean; label: string }) => (
    <li className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-muted-foreground"}`}>
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0" />
      )}
      {label}
    </li>
  );

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Reset Your Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input
                name="confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="input-base pr-16"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <div className="rounded-lg bg-neutral-50 p-4 text-xs">
            <p className="font-medium mb-2 text-gray-700">Password must include:</p>
            <ul className="space-y-1">
              <Rule met={rules.length} label="At least 8 characters" />
              <Rule met={rules.upper} label="One uppercase letter" />
              <Rule met={rules.number} label="One number" />
              <Rule met={rules.special} label="One special character" />
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending || !allRulesMet}
            className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="text-amber-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

const ResetPage = () => (
  <Suspense>
    <ResetForm />
  </Suspense>
);

export default ResetPage;
