import { BiCarousel } from "@/components/carousel/BiCarousel";
import React from "react";
import CategorySection from "@/components/category-section";
import BrandSection from "@/components/brand-section";
import { Metadata } from "next";

export const metadata:Metadata={
  title: "Hini | Premium Hardware Collection"
}
const HomePage = () => {
  return (
    <div className="bg-white">
      <BiCarousel />
      <CategorySection />
      <BrandSection />
    </div>
  );
};

export default HomePage;
