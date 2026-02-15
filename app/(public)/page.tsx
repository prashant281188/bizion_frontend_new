"use client";

import { Card } from "@/components/ui/card";
import { BiCarousel } from "@/components/carousel/BiCarousel";
import BiCategory from "@/components/ui/common/BiCategory";
import Image from "next/image";
import React from "react";

const categories = [
  {
    title: "Door Handles",
    image: "/cateogries/cabinet-handle.jpg",
    subtitle: "Premium finishes",
    link: "/products",
  },
  {
    title: "Cabinet Handles",
    image: "/cateogries/mortice-handle.jpg",
    subtitle: "Modern & classic",
    link: "/products",
  },
  {
    title: "Profiles",
    image: "/cateogries/profile-handle.jpg",
    subtitle: "Aluminium solutions",
    link: "/products",
  },
  {
    title: "Accessories",
    image: "/cateogries/cabinet-handle.jpg",
    subtitle: "Functional details",
    link: "/products",
  },
  {
    title: "Cabinet Handles 1",
    image: "/cateogries/mortice-handle.jpg",
    subtitle: "Modern & classic",
    link: "/products",
  },
  {
    title: "Profiles 1",
    image: "/cateogries/profile-handle.jpg",
    subtitle: "Aluminium solutions",
    link: "/products",
  },
  {
    title: "Accessories 1",
    image: "/cateogries/cabinet-handle.jpg",
    subtitle: "Functional details",
    link: "/products",
  },
];

const brands = [
  { name: "Godrej", logo: "/images/brands/godrej.png" },
  { name: "Hettich", logo: "/images/brands/hettich.png" },
  { name: "Hafele", logo: "/images/brands/hafele.png" },
  { name: "Blum", logo: "/images/brands/blum.png" },
  { name: "Ebco", logo: "/images/brands/ebco.png" },
  { name: "Dormakaba", logo: "/images/brands/dormakaba.png" },
];

const HomePage = () => {
  return (
    <div className="bg-white">
      <BiCarousel />
      
      <section className="relative w-full bg-neutral-50 py-24">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="mb-16 text-center">
            <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-amber-500" />

            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Crafted for Every Space
            </h2>

            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Premium architectural hardware collections designed to elevate
              modern interiors
            </p>
          </div>

          {/* Grid Wrapper for better centering on large screens */}
          <div className="mx-auto ">
            {/* Categories Grid */}
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ">
              {categories.map((cat) => (
                <BiCategory
                  key={cat.title}
                  title={cat.title}
                  image={cat.image}
                  subtitle={cat.subtitle}
                  link={cat.link}
                  onClick={() => console.log(cat.title)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle background depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.06),transparent_60%)]" />
      </section>

      <section className="relative w-full bg-white-50 py-24">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="mb-14 text-center">
            <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Trusted Brands We Offer
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Partnering with industry-leading hardware manufacturers
            </p>
          </div>

          {/* Brand Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <Card
                key={brand.name}
                className="group flex items-center justify-center rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={140}
                  height={60}
                  className="object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                />
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
