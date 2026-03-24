"use client";

import { verifyOtp, resendOtp } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 6;

const VerifyPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const getEmail = () =>
    typeof window !== "undefined" ? sessionStorage.getItem("reset_email") ?? "" : "";

  const verify = useMutation({
    mutationFn: (code: string) => verifyOtp({ email: getEmail(), otp: code }),
    onSuccess: (data) => {
      if (data.data?.token) sessionStorage.setItem("reset_token", data.data.token);
      router.replace("/reset");
    },
    onError: () => toast.error("Invalid or expired code. Please try again."),
  });

  const resend = useMutation({
    mutationFn: () => resendOtp({ email: getEmail() }),
    onSuccess: () => {
      toast.success("Verification code resent to your email.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    },
    onError: () => toast.error("Failed to resend code. Please try again."),
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    verify.mutate(code);
  };

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-2xl font-semibold text-gray-900">Verify Your Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-12 rounded-md border border-black/10 text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verify.isPending ? "Verifying…" : "Verify"}
          </button>
        </form>

        {/* Resend */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="text-amber-500 hover:underline disabled:opacity-60"
          >
            {resend.isPending ? "Sending…" : "Resend"}
          </button>
        </p>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">Back to Login</Link>
        </p>
      </div>
    </section>
  );
};

export default VerifyPage;
