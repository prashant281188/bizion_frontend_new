"use client";

import { Smile } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const PublicNavbar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full">
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm ring-1 ring-black/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <Smile className="h-7 w-7 text-amber-500" />
              <span className="text-gray-900">HINI</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative text-sm transition
                      ${active 
                        ? "font-semibold text-gray-900"
                        : "font-medium text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    {link.label}

                    {/* Underline */}
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-amber-500 transition-all duration-300
                        ${active ? "w-full" : "w-0 group-hover:w-full"}
                      `}
                    />
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 hover:shadow-md"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PublicNavbar;
