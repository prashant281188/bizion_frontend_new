"use client";

import { login } from "@/lib/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
      router.push("/admin/dashboard");
      toast.success("Logged In...");
    },
    onError: (error: Error) => {
      toast.error("Login Failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    mutation.mutate({ email, password });
  };
  return (
    <section className="min-h-screen w-full bg-white">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* LEFT: Login Form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Brand */}
            <div className="mb-10 text-center">
              <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
              <h1 className="text-3xl font-semibold text-gray-900">
                Welcome Back
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to continue to HINI
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Role Selector (Optional but recommended for you) */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Login As
                </label>
                <select className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:ring-amber-500">
                  <option>Admin</option>
                  <option>Retailer</option>
                  <option>Sales</option>
                  <option>Accountant</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-amber-500" />
                  Remember me
                </label>
                <Link
                  href={"/forgot"}
                  className="text-amber-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-600"
              >
                Sign In
              </button>
            </form>

            {/* Footer */}
            <p className="mt-10 text-center text-sm text-muted-foreground">
              © 2025–26 HINI. All rights reserved.
            </p>
          </div>
        </div>

        {/* RIGHT: Image */}
        <div className="relative hidden md:block">
          <Image
            fill
            src="/products/1.jpg"
            alt="Premium architectural hardware"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

          {/* Branding Text */}
          <div className="relative z-10 flex h-full items-end p-12">
            <p className="max-w-md text-lg text-white">
              Premium architectural hardware crafted for modern interiors —
              trusted by professionals across India.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
