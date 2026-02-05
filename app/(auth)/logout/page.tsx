import Link from "next/link";
import React from "react";

const LogoutPage = () => {
  return  <section className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center rounded-2xl bg-white p-10 ring-1 ring-black/5 shadow-sm">

        {/* Accent */}
        <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />

        <h1 className="text-2xl font-semibold text-gray-900">
          You’ve Been Logged Out
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Your session has ended securely.  
          For your safety, please close the browser if you are on a shared device.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-600"
          >
            Sign In Again
          </Link>

          <Link
            href="/"
            className="rounded-full border border-black/10 px-6 py-3 text-sm transition hover:border-black"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Auto redirect info */}
        <p className="mt-6 text-xs text-muted-foreground">
          Redirecting to login in a few seconds…
        </p>
      </div>
    </section>;
};

export default LogoutPage;
