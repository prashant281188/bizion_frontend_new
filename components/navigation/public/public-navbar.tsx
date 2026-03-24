"use client";

import { Smile, Menu, X, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const PublicNavbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className=" sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm ring-1 ring-black/5">
      <nav className="w-full">
        <div className="container px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <Smile className="h-7 w-7 text-amber-500" />
              <span className="text-gray-900">HINI</span>
            </Link>

            {/* Desktop Nav */}
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
                    <span
                      className={`absolute -bottom-1 left-0 h-[2px] bg-amber-500 transition-all duration-300
                        ${active ? "w-full" : "w-0 group-hover:w-full"}
                      `}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            {isAuthenticated ? (
              <Link
                href="/admin/dashboard"
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
              >
                <UserCircle className="h-5 w-5 text-amber-500" />
                {user?.email}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 hover:shadow-md"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-black/5">
            <div className="container flex flex-col px-4 sm:px-6 py-4 space-y-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-base transition
                      ${active
                        ? "font-semibold text-amber-500"
                        : "text-gray-700 hover:text-amber-500"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-gray-700"
                >
                  <UserCircle className="h-5 w-5 text-amber-500" />
                  {user?.email}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default PublicNavbar;