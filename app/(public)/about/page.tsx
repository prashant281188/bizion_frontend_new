import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "HINI | About Us",
  description: "Learn about HINI by Himani Enterprises — a premium architectural hardware brand serving designers, builders, and retailers across India.",
};

const highlights = [
  { title: "Uncompromising Quality", desc: "Every product is held to strict tolerances — durable finishes, precise tolerances, and consistent performance across the range." },
  { title: "Design-Led Thinking", desc: "Form follows function at HINI. Our collections are shaped by real-world use and refined by modern aesthetic sensibility." },
  { title: "Built for Professionals", desc: "Architects, interior designers, and contractors rely on HINI to specify hardware that performs as well as it looks." },
  { title: "Complete Range", desc: "From door and cabinet handles to aluminium profiles and bathroom fittings — one source for every hardware need." },
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
      <section className="relative w-full bg-neutral-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-amber-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">About HINI</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            Precision hardware. Purposeful design. Trusted by professionals building India&apos;s modern interiors.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="w-full bg-white py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid items-center gap-10 sm:gap-16 md:grid-cols-2">
            {/* Left */}
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Our Story</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                HINI is the hardware brand of Himani Enterprises, built on over 15 years of
                experience supplying architectural fittings to retailers, builders, and design
                professionals across India. What started as a regional distribution business grew
                into a curated brand committed to bringing better hardware to the market.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We work directly with leading manufacturers to bring you door handles, cabinet
                hardware, aluminium profiles, and bathroom accessories that meet the demands of
                contemporary architecture — without compromise on finish, durability, or design.
              </p>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  href="/catalog"
                  className="inline-flex items-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                >
                  Browse Catalogue
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
                >
                  Get in Touch
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
      <section className="w-full bg-neutral-50 py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
      <section className="w-full bg-white py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Let&apos;s Work Together
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you are specifying hardware for a project, looking to stock HINI in your store,
            or exploring bulk supply, we are ready to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              View Catalogue
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-500 hover:text-amber-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
