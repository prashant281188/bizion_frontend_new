import { BiCarousel } from "@/components/carousel/BiCarousel";
import React from "react";
import CategorySection from "@/components/public/category-section";
import BrandSection from "@/components/public/brand-section";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import NewProductsSection from "@/components/home/NewProductsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hini | Premium Hardware Collection",
  description:
    "Discover Hini's premium hardware collection — door handles, cabinet fittings, aluminium profiles, and architectural hardware crafted for quality and style.",
  openGraph: {
    title: "Hini | Premium Hardware Collection",
    description:
      "Discover Hini's premium hardware collection — door handles, cabinet fittings, aluminium profiles, and architectural hardware.",
    url: "/",
  },
  twitter: {
    title: "Hini | Premium Hardware Collection",
    description:
      "Discover Hini's premium hardware collection — door handles, cabinet fittings, aluminium profiles, and architectural hardware.",
  },
};

const HomePage = () => {
  return (
    <div className="bg-white">
      <BiCarousel />
      <CategorySection />
      <FeaturedProductsSection />
      <NewProductsSection />
      <BrandSection />
    </div>
  );
};

export default HomePage;
