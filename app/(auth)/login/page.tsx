"use client";

import { login } from "@/lib/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

const LoginPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      setSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setTimeout(() => router.replace("/admin/dashboard"), 900);
    },
    onError: (err: string) => {
      toast.error(err || "Invalid credentials");
      setShakeKey((k) => k + 1); // re-mount triggers shake re-animation
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    mutation.mutate({ email, password });
  };

  return (
    <section className="min-h-screen w-full bg-white overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* LEFT: Login Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div
            className="w-full max-w-md"
            style={{ animation: "fade-up 0.55s cubic-bezier(.22,.68,0,1.2) both" }}
          >
            {/* Brand */}
            <div
              className="mb-10 text-center"
              style={{ animation: "fade-up 0.5s ease both", animationDelay: "60ms" }}
            >
              <span
                className="mx-auto mb-4 block h-1 rounded-full bg-amber-500"
                style={{ animation: "bar-grow 0.6s ease both", animationDelay: "200ms" }}
              />
              <h1
                className="text-3xl font-semibold text-gray-900"
                style={{ animation: "fade-up 0.5s ease both", animationDelay: "150ms" }}
              >
                Welcome Back
              </h1>
              <p
                className="mt-2 text-muted-foreground"
                style={{ animation: "fade-up 0.5s ease both", animationDelay: "220ms" }}
              >
                Sign in to continue to HINI
              </p>
            </div>

            {/* Success overlay */}
            {success && (
              <div
                className="mb-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-50 py-8 ring-1 ring-green-200"
                style={{ animation: "success-pop 0.4s ease both" }}
              >
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-sm font-medium text-green-700">Login successful! Redirecting…</p>
              </div>
            )}

            {/* Login Form */}
            <form
              key={shakeKey}
              ref={formRef}
              className="space-y-5"
              onSubmit={handleSubmit}
              style={
                shakeKey > 0
                  ? { animation: "shake 0.45s ease both" }
                  : undefined
              }
            >
              {/* Email */}
              <div style={{ animation: "fade-up 0.5s ease both", animationDelay: "280ms" }}>
                <label className="mb-1 block text-sm font-medium">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:border-amber-300"
                />
              </div>

              {/* Password */}
              <div style={{ animation: "fade-up 0.5s ease both", animationDelay: "340ms" }}>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:border-amber-300"
                />
              </div>

              {/* Remember / Forgot */}
              <div
                className="flex items-center justify-between text-sm"
                style={{ animation: "fade-up 0.5s ease both", animationDelay: "400ms" }}
              >
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input type="checkbox" className="accent-amber-500" />
                  Remember me
                </label>
                <Link href="/forgot" className="text-amber-500 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <div style={{ animation: "fade-up 0.5s ease both", animationDelay: "460ms" }}>
                <button
                  type="submit"
                  disabled={mutation.isPending || success}
                  className="group relative w-full overflow-hidden rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* shimmer sweep on hover */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

                  <span className="relative flex items-center justify-center gap-2">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Redirecting…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer */}
            <p
              className="mt-10 text-center text-sm text-muted-foreground"
              style={{ animation: "fade-in 0.6s ease both", animationDelay: "600ms" }}
            >
              © 2025–26 HINI. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT: Image panel */}
        <div
          className="relative hidden md:block"
          style={{ animation: "fade-in 0.8s ease both", animationDelay: "100ms" }}
        >
          <Image
            fill
            src="/products/dummy_photo.png"
            alt="Premium architectural hardware"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

          {/* Decorative amber glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />

          {/* Branding text */}
          <div
            className="relative z-10 flex h-full items-end p-12"
            style={{ animation: "fade-up 0.7s ease both", animationDelay: "400ms" }}
          >
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <p className="max-w-md text-lg font-medium text-white leading-relaxed">
                Premium architectural hardware crafted for modern interiors —
                trusted by professionals across India.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LoginPage;
