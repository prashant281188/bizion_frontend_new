"use client";

import { resetPassword } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { toast } from "sonner";

const ResetForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.replace("/login");
    },
    onError: (err: string) => {
      toast.error(err || "Failed to reset password");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const token = searchParams.get("token") ?? "";
    mutation.mutate({ token, newPassword: password });
  };

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <div className="rounded-lg bg-neutral-50 p-4 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Password must include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
