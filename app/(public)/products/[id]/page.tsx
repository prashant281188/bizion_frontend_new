import { Button } from "@/components/ui/button";
import Image from "next/image";

import Link from "next/link";
import React from "react";
function VariantGroup({
  title,
  options,
  color,
}: {
  title: string;
  options: string[];
  color?: boolean;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            className={`rounded-full px-4 py-2 text-sm ring-1 ring-black/10 transition
              hover:ring-amber-500 ${color ? "capitalize" : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const ProductDetailPage = () => {
  return (
    <>
      <section className="w-full bg-white py-24">
        <div className="container mx-auto px-6">
          <Button variant={"secondary"} >
            <Link href={"/products"}> Back to Products</Link>
          </Button>
          <div className="pt-4 grid gap-16 md:grid-cols-2">
            {/* LEFT: Image Gallery */}
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-black/5">
                <Image
                  src="/images/products/handle-main.jpg"
                  alt="Product"
                  className="h-full w-full object-cover"
                  fill
                />
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex gap-4">
                {["1", "2", "3"].map((i) => (
                  <button
                    key={i}
                    className="aspect-square w-20 overflow-hidden rounded-xl ring-1 ring-black/5 hover:ring-amber-500"
                  >
                    <Image
                      src={`/images/products/handle-${i}.jpg`}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      fill
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div>
              <span className="inline-block mb-3 h-1 w-12 rounded-full bg-amber-500" />

              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                Linear Door Handle – Premium Series
              </h1>

              <p className="mt-3 text-muted-foreground">
                Modern architectural door handle designed for residential and
                commercial interiors with premium finishes.
              </p>

              {/* Variant Selectors */}
              <div className="mt-10 space-y-6">
                <VariantGroup
                  title="Model"
                  options={["SH-2001", "SH-2006", "SH-2026"]}
                />
                <VariantGroup
                  title="Size"
                  options={["150 mm", "200 mm", "250 mm"]}
                />
                <VariantGroup
                  title="Finish"
                  options={[
                    "Matt Black",
                    "Brushed Brass",
                    "Rose Gold",
                    "Chrome",
                  ]}
                  color
                />
              </div>

              {/* SKU & Stock */}
              <div className="mt-8 rounded-xl bg-neutral-50 p-4 ring-1 ring-black/5">
                <p className="text-sm">
                  <span className="font-medium">SKU:</span> SH-2001-MB-200
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-medium">Availability:</span>{" "}
                  <span className="text-green-600 font-medium">In Stock</span>
                </p>
              </div>

              {/* CTA */}
              <div className="mt-8 flex gap-4">
                <button className="rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-black hover:bg-amber-600">
                  Enquire Now
                </button>
                <button className="rounded-full border border-black/10 px-8 py-3 text-sm hover:border-black">
                  Download Catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl font-semibold mb-6">
            Product Specifications
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Material", "Zinc Alloy"],
              ["Usage", "Door"],
              ["Finish Options", "Multiple"],
              ["Mounting", "Screw Fix"],
              ["Warranty", "5 Years"],
              ["Country of Origin", "India"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between rounded-lg bg-white p-4 ring-1 ring-black/5"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
