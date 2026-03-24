"use client";

import { logout } from "@/lib/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

const REDIRECT_DELAY = 4000;

const LogoutPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(Math.round(REDIRECT_DELAY / 1000));

  useEffect(() => {
    logout().finally(() => {
      const timer = setTimeout(() => router.replace("/login"), REDIRECT_DELAY);
      return () => clearTimeout(timer);
    });
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6 overflow-hidden">
      <div
        className="w-full max-w-md text-center rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm"
        style={{ animation: "fade-up 0.55s cubic-bezier(.22,.68,0,1.2) both" }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200"
          style={{ animation: "success-pop 0.5s ease both", animationDelay: "150ms" }}
        >
          <LogOut className="h-6 w-6 text-amber-500" />
        </div>

        {/* Accent bar */}
        <span
          className="mx-auto mb-4 block h-1 rounded-full bg-amber-500"
          style={{ animation: "bar-grow 0.6s ease both", animationDelay: "200ms" }}
        />

        <h1
          className="text-2xl font-semibold text-gray-900"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "250ms" }}
        >
          Signed Out Successfully
        </h1>

        <p
          className="mt-3 text-sm text-muted-foreground"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "320ms" }}
        >
          Your session has ended securely. If you are on a shared device,
          close this browser tab to protect your account.
        </p>

        {/* Actions */}
        <div
          className="mt-8 flex flex-col gap-3"
          style={{ animation: "fade-up 0.5s ease both", animationDelay: "400ms" }}
        >
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
        <p
          className="mt-6 text-xs text-muted-foreground"
          style={{ animation: "fade-in 0.6s ease both", animationDelay: "550ms" }}
        >
          {countdown > 0
            ? `Redirecting to login in ${countdown}s…`
            : "Redirecting…"}
        </p>

        {/* Progress bar */}
        <div
          className="mt-3 mx-auto h-0.5 w-32 overflow-hidden rounded-full bg-black/5"
          style={{ animation: "fade-in 0.6s ease both", animationDelay: "600ms" }}
        >
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{
              animation: `shrink-bar ${REDIRECT_DELAY}ms linear both`,
              width: "100%",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default LogoutPage;
