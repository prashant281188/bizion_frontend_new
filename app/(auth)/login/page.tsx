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
            className="w-full max-w-md animate-fade-up-spring"
          >
            {/* Brand */}
            <div className="mb-10 text-center animate-fade-up-slow delay-60">
              <span className="mx-auto mb-4 block h-1 rounded-full bg-amber-500 animate-bar-grow delay-200" />
              <h1 className="text-3xl font-semibold text-gray-900 animate-fade-up-slow delay-150">
                Welcome Back
              </h1>
              <p className="mt-2 text-muted-foreground animate-fade-up-slow delay-220">
                Sign in to access the HINI admin portal
              </p>
            </div>

            {/* Success overlay */}
            {success && (
              <div
                className="mb-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-green-50 py-8 ring-1 ring-green-200 animate-success-pop"
              >
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-sm font-medium text-green-700">Login successful! Redirecting…</p>
              </div>
            )}

            {/* Login Form */}
            <form
              key={shakeKey}
              ref={formRef}
              className={shakeKey > 0 ? "space-y-5 animate-shake-fast" : "space-y-5"}
              onSubmit={handleSubmit}
            >
              {/* Email */}
              <div className="animate-fade-up-slow delay-280">
                <label className="mb-1 block text-sm font-medium">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="input-base hover:border-amber-300"
                />
              </div>

              {/* Password */}
              <div className="animate-fade-up-slow delay-340">
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-base hover:border-amber-300"
                />
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between text-sm animate-fade-up-slow delay-400">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input type="checkbox" className="accent-amber-500" />
                  Remember me
                </label>
                <Link href="/forgot" className="text-amber-500 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <div className="animate-fade-up-slow delay-460">
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
            <p className="mt-10 text-center text-sm text-muted-foreground animate-fade-in-slow delay-600">
              © 2025–26 HINI. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT: Image panel */}
        <div
          className="relative hidden md:block animate-fade-in-slower delay-100"
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
            className="relative z-10 flex h-full items-end p-12 animate-fade-up-slow delay-400"
          >
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <p className="max-w-md text-lg font-medium text-white leading-relaxed">
                The HINI admin portal — manage products, parties, and your business from one place.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LoginPage;
