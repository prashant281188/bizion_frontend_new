"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "Premium Hardware Solutions",
    description: "Door handles, cabinet fittings & architectural hardware",
    image: "/images/slide-1.jpg",
    cta: "Explore Products",
  },
  {
    title: "Designed for Modern Interiors",
    description: "Minimal. Durable. Precision engineered.",
    image: "/images/slide-2.jpg",
    cta: "View Collections",
  },
  {
    title: "Trusted by Builders & Architects",
    description: "Quality that lasts for years",
    image: "/images/slide-3.jpg",
    cta: "Contact Us",
  },
];

export function BiCarousel() {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <div
              className="relative h-[70vh] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full items-center">
                <div className="container mx-auto px-6 max-w-3xl">
                  {/* Accent line */}
                  <span className="mb-4 block h-1 w-14 rounded-full bg-amber-500" />

                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-gray-200 mb-8">
                    {slide.description}
                  </p>

                  <Button
                    size="lg"
                    className="bg-amber-500 text-black hover:bg-amber-600 shadow-lg"
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-6 bg-white/80 hover:bg-white" />
      <CarouselNext className="right-6 bg-white/80 hover:bg-white" />
    </Carousel>
  );
}
