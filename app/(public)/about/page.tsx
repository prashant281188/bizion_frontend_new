import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Hini | About Us",
};

const highlights = [
  { title: "Premium Quality", desc: "Durable materials, refined finishes, and consistent performance." },
  { title: "Design-Driven", desc: "Modern aesthetics aligned with functional excellence." },
  { title: "Trusted Partners", desc: "Working closely with professionals and retailers across India." },
  { title: "Wide Range", desc: "Complete hardware solutions for every space and style." },
];

const stats = [
  { value: "500+", label: "Product Models" },
  { value: "20+", label: "Brand Partners" },
  { value: "10K+", label: "Retailers Served" },
  { value: "15+", label: "Years in Business" },
];

const AboutPage = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">About HINI</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Premium architectural hardware crafted for modern interiors, trusted by professionals across India.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="w-full bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
            {/* Left */}
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Our Story</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                HINI is a premium architectural hardware brand dedicated to enhancing modern interiors
                through thoughtful design, precision engineering, and uncompromising quality.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                From door and cabinet handles to aluminium profiles and accessories, our collections
                are crafted to meet the expectations of architects, interior designers, builders, and
                retailers across India.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {highlights.map((h) => (
                  <div key={h.title} className="rounded-xl bg-neutral-50 p-4 ring-1 ring-black/5">
                    <div className="mb-2 h-0.5 w-8 rounded-full bg-amber-500" />
                    <h4 className="text-sm font-semibold text-gray-900">{h.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                >
                  View Our Collections
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Right: staggered images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
                <Image
                  src="/products/dummy_photo.png"
                  width={600}
                  height={700}
                  alt="Premium interior hardware"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
                <Image
                  src="/products/dummy_photo.png"
                  width={600}
                  height={700}
                  alt="Modern hardware detailing"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full bg-neutral-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white p-6 text-center ring-1 ring-black/5 shadow-sm"
              >
                <p className="text-3xl font-bold text-amber-500">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-white py-20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Ready to Elevate Your Space?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explore our premium hardware collections or get in touch for project support and
            dealer partnerships.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
