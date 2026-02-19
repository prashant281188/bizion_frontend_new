import { BiCarousel } from "@/components/carousel/BiCarousel";
import React from "react";
import CategorySection from "@/components/category-section";
import BrandSection from "@/components/brand-section";

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
