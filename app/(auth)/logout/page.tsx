"use client";

import { logout } from "@/lib/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const REDIRECT_DELAY = 4000;

const LogoutPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(Math.round(REDIRECT_DELAY / 1000));

  useEffect(() => {
    logout().finally(() => {
      queryClient.clear();
      const timer = setTimeout(() => router.replace("/login"), REDIRECT_DELAY);
      return () => clearTimeout(timer);
    });
  }, [router, queryClient]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6 overflow-hidden">
      <div
        className="w-full max-w-md text-center rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm animate-fade-up-spring"
      >
        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200 animate-success-pop-slow delay-150"
        >
          <LogOut className="h-6 w-6 text-amber-500" />
        </div>

        {/* Accent bar */}
        <span className="mx-auto mb-4 block h-1 rounded-full bg-amber-500 animate-bar-grow delay-200" />

        <h1 className="text-2xl font-semibold text-gray-900 animate-fade-up-slow delay-250">
          Signed Out Successfully
        </h1>

        <p className="mt-3 text-sm text-muted-foreground animate-fade-up-slow delay-320">
          Your session has ended securely. If you are on a shared device,
          close this browser tab to protect your account.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 animate-fade-up-slow delay-400">
          <Link
            href="/login"
            className="group relative overflow-hidden rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <span className="relative">Sign In Again</span>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-black/10 px-6 py-3 text-sm transition hover:border-amber-500 hover:text-amber-600 active:scale-[0.98]"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Countdown */}
        <p className="mt-6 text-xs text-muted-foreground animate-fade-in-slow delay-550">
          {countdown > 0
            ? `Redirecting to login in ${countdown}s…`
            : "Redirecting…"}
        </p>

        {/* Progress bar */}
        <div className="mt-3 mx-auto h-0.5 w-32 overflow-hidden rounded-full bg-black/5 animate-fade-in-slow delay-600">
          <div
            className="h-full w-full bg-amber-500 rounded-full animate-shrink-bar"
            style={{ "--duration": `${REDIRECT_DELAY}ms` } as React.CSSProperties}
          />
        </div>
      </div>
    </section>
  );
};

export default LogoutPage;
