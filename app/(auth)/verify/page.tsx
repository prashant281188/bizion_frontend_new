"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from "react";

const page = () => {
const [code, setCode] = useState(["", "", "", "", "", ""])

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // auto focus next
    if (value && index < code.length - 1) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }
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

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              maxLength={1}
              className="h-12 w-12 rounded-md border border-black/10 text-center
                         text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          ))}
        </div>

        {/* Submit */}
        <button
          className="w-full rounded-full bg-amber-500 px-6 py-3
                     text-sm font-semibold text-black transition hover:bg-amber-600"
        >
          Verify
        </button>

        {/* Resend */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Didn’t receive the code?{" "}
          <button className="text-amber-500 hover:underline">
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

export default page;
