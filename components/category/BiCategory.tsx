import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";

type BiCategoryProps = {
  title: string;
  image: string;
  subtitle?: string;
  onClick?: () => void;
  link: string;
};
const BiCategory = ({ title, image, subtitle, link }: BiCategoryProps) => {
  return (
    <Link href={`/products/?category=${link}`}>
      <Card className="group py-0 cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          {/* Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="px-4 pb-4 text-center">
          <h3 className="text-lg font-semibold  ">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BiCategory;
