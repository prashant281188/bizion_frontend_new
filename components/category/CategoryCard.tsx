import React from "react";
import Image from "next/image";
import Link from "next/link";
import { titleCase } from "@/utils";

type CategoryCardProps = {
  title: string;
  image: string;
  subtitle?: string;
  link: string;
};

const CategoryCard = ({ title, image, subtitle, link }: CategoryCardProps) => {
  return (
    <>
     
      <Link href={`/products?categoryId=${link}`}>
        <div className="group relative h-40 sm:h-52 md:h-56 w-full overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300">
          {/* Background Image */}
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Hover accent border */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-amber-500/60 transition-all duration-300" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-base font-semibold text-white leading-tight">
                  {titleCase(title)}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-white/70 line-clamp-1">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 h-0.5 w-0 rounded-full bg-amber-500 group-hover:w-full transition-all duration-500" />
          </div>
        </div>
      </Link>
    </>
  );
};

export default CategoryCard;
