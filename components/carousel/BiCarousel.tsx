"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCarouselData } from "@/hooks/useCarouselData";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

export function BiCarousel() {
  const { data, isLoading } = useCarouselData();

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {isLoading ? (
          <CarouselItem>
            <div className="relative h-[70vh] w-full bg-neutral-900 flex items-center">
              <div className="container mx-auto px-6 max-w-3xl space-y-4">
                <Skeleton className="h-1 w-14 rounded-full bg-amber-500/40" />
                <Skeleton className="h-12 w-2/3 bg-white/10" />
                <Skeleton className="h-6 w-1/2 bg-white/10" />
                <Skeleton className="h-11 w-44 rounded-full bg-white/10" />
              </div>
            </div>
          </CarouselItem>
        ) : (
          data?.map((slide, index) => (
            <CarouselItem key={index}>
              <div
                className="relative h-[70vh] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full items-center">
                  <div className="container mx-auto px-6 max-w-3xl">
                    <span className="mb-5 block h-1 w-14 rounded-full bg-amber-500" />

                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
                      {slide.title}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/products"
                        className="inline-flex items-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 shadow-lg hover:shadow-amber-500/30"
                      >
                        Explore Collection
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Slide dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {data.map((_, i) => (
                    <span
                      key={i}
                      className={`block h-1 rounded-full transition-all duration-300 ${
                        i === index ? "w-8 bg-amber-500" : "w-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))
        )}
      </CarouselContent>
      <CarouselPrevious className="left-6 bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 hover:text-white" />
      <CarouselNext className="right-6 bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 hover:text-white" />
    </Carousel>
  );
}
