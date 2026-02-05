import Link from "next/link";
import React from "react";

const PublicFooter = () => {
  return (
    <footer className="w-full bg-neutral-50">
      <div className="container mx-auto px-6 py-16">
        {/* Top Divider */}
        <div className="mb-12 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        {/* Footer Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-amber-500">●</span> HINI
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Premium architectural hardware crafted for modern interiors,
              trusted by professionals across India.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Collections
            </h3>
            <ul className="space-y-2">
              {[
                "Door Handles",
                "Cabinet Handles",
                "Profile Handles",
                "Aluminium Profiles",
                "Bathroom Accessories",
                "All Categories",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                "Contact Us",
                "Request Catalogue",
                "Warranty Policy",
                "Installation Guide",
                "FAQs",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Business
            </h3>
            <ul className="space-y-2">
              {[
                "Admin Login",
                "Retailer Login",
                "Sales Portal",
                "Become a Dealer",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025–26 HINI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-black">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-black">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
