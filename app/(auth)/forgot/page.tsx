"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const ForgotPage = () => {
  return (
     <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your registered email and we’ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-md border border-black/10 px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 px-6 py-3
                       text-sm font-semibold text-black transition hover:bg-amber-600"
          >
            Send Reset Link
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Remembered your password?{" "}
            <Link href="/login" className="text-amber-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
};

export default ForgotPage;
