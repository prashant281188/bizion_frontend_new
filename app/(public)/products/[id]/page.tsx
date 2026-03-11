"use client";

import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/useProduct";
import { titleCase } from "@/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const ProductDetailPage = () => {
  const { id } = useParams();

  const { data, isLoading } = useProduct(id as string);
  const [image, setImage] = useState("/products/1.jpg");

  let uniqueSizes: string[] = [];
  let uniqueFinishes: string[] = [];
  if (data?.variants) {
    uniqueSizes = Array.from(
      new Set(
        data?.variants
          .map((d) => d.size)
          .filter((size): size is string => size !== undefined),
      ),
    );
    uniqueFinishes = Array.from(
      new Set(
        data?.variants
          .map((d) => d.finish)
          .filter((finish): finish is string => finish !== undefined),
      ),
    ).sort();
  }

  // useEffect(() => {

  //     if (data?.variants) {
  //       uniqueSizes = Array.from(
  //         new Set(
  //           data?.variants
  //             .map((d) => d.size)
  //             .filter((size): size is string => size !== undefined),
  //         ),
  //       );
  //       uniqueFinishes = Array.from(
  //         new Set(
  //           data?.variants
  //             .map((d) => d.finish)
  //             .filter((finish): finish is string => finish !== undefined),
  //         ),
  //       ).sort();
  //     }

  // }, []);

  return (
    <>
      {isLoading ? <>Loading....</> : <></>}

      <section className="w-full bg-white py-10">
        <div className="container mx-auto px-6">
          <Button variant={"secondary"}>
            <Link href={"/products"} className="flex gap-2 items-center">
              <ArrowLeft />
              <span>Back</span>
            </Link>
          </Button>
          <div className="pt-4 grid gap-16 md:grid-cols-2">
            {/* LEFT: Image Gallery */}
            <div className="">
              <div className="min-h-auto max-h-[500px] overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-black/5">
                <Image
                  src={image}
                  alt="Product"
                  className="h-full w-full object-cover"
                  height={1000}
                  width={1000}
                />
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex flex-wrap gap-4 ">
                {["2", "3", "4", "5"].map((i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setImage(`/products/${i}.jpg`)}
                    className="aspect-square w-12 overflow-hidden rounded-xl ring-1 ring-black/5 hover:ring-amber-500"
                  >
                    <Image
                      src={`/products/${i}.jpg`}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      height={1000}
                      width={1000}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="">
              <h1 className="text-sm flex w-auto justify-center  items-center py-1 rounded-full border-amber-500 border-[1px] text-amber-500 ">
                {titleCase(data?.brand.name)}
              </h1>
              <h1 className="pt-4 text-3xl md:text-4xl font-semibold text-gray-900">
                {titleCase(data?.model)}
              </h1>

              <p className="mt-3 text-muted-foreground">
                Modern architectural door handle designed for residential and
                commercial interiors with premium finishes.
              </p>
              <h1 className="text-amber-500/80 mt-4  mb-2">
                Sizes Available :
              </h1>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes ? (
                  <>
                    {uniqueSizes?.map((size) => (
                      <span
                        key={size}
                        className="px-2 py-1 text-sm rounded-full w-20 flex justify-center hover:bg-amber-500 hover:text-white border-[0.01rem] border-amber-500 mr-2 "
                      >
                        {size} {data?.sizeType}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="px-2 py-1 text-sm rounded-full w-20 flex justify-center hover:bg-amber-500 hover:text-white border-[0.01rem] border-amber-500 mr-2">
                    N/A
                  </span>
                )}
              </div>
              <h1 className="text-amber-500/80 mt-4  mb-2">
                Finishes Available :
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {uniqueFinishes ? (
                  <>
                    {uniqueFinishes?.map((finish) => (
                      <span
                        key={finish}
                        className="px-2 py-1 text-sm rounded-full justify-center text-center hover:bg-amber-500 hover:text-white border-[0.01rem] border-amber-500 mr-2 "
                      >
                        {finish}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="px-2 py-1 text-sm rounded-full w-20 flex justify-center hover:bg-amber-500 hover:text-white border-[0.01rem] border-amber-500 mr-2">
                    N/A
                  </span>
                )}
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
