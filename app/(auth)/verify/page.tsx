"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 6;

const VerifyPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      // TODO: call verify API with code
      router.replace("/reset");
    } catch {
      toast.error("Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    inputs.current[0]?.focus();
    toast.success("Verification code resent");
    // TODO: call resend API
  };

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Verify Your Account
          </h1>
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying…" : "Verify"}
          </button>
        </form>

        {/* Resend */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-amber-500 hover:underline">
            Resend
          </button>
        </p>

        {/* Back */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default VerifyPage;
