import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";

type Product = {
  model: string;
  description?: string;
  manufacture: string;
  hsn: string;
  images?: string;
  category?: string;
  brand?: string;
  metal?: string;
  variants: {
    size: string;
    size_type: string;
    finish: string;
    packing: string;
    image?: string;
    rates?: {
      mrp: string;
      sale_price: string;
      purchase_price: string;
    };
  }[];
};

type ProductDetailProps = {
  Product: Product;
  className?: string;
};

const ProductDetail = ({
  Product: {
    model,
    hsn,
    manufacture,
    variants,
    images,
    brand,
    category,
    description,
    metal,
  },
  
}: ProductDetailProps) => {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div>
        <Link href="/product/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>

      {/* Product Overview */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Main Image */}
          <div className="relative h-[300px] w-full rounded-lg border bg-muted overflow-hidden">
            {images ? (
              <Image src={images} alt={model} fill className="object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{model}</h1>

              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-3">
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium">{category ?? "—"}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">Brand:</span>{" "}
                  <span className="font-medium">{brand ?? "—"}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">Metal:</span>{" "}
                  <span className="font-medium">{metal ?? "—"}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">Manufacturer:</span>{" "}
                  <span className="font-medium">{manufacture}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">HSN:</span>{" "}
                  <span className="font-medium">{hsn}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">Variants:</span>{" "}
                  <span className="font-medium">{variants.length}</span>
                </p>
              </div>
            </div>

            {/* Product Actions */}
            <div className="flex gap-2 mt-4">
              <Button size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Product
              </Button>

              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Variants Table */}
      <Card className="p-4">
        <h2 className="mb-3 text-lg font-semibold">Variants (SKUs)</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Img</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Finish</TableHead>
                <TableHead>Packing</TableHead>
                <TableHead className="text-right">MRP</TableHead>
                <TableHead className="text-right">Sale</TableHead>
                <TableHead className="text-right">Purchase</TableHead>
                <TableHead className="text-right w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {variants.map((v, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="relative h-8 w-8 rounded border overflow-hidden">
                      {v.image && (
                        <Image
                          src={v.image}
                          alt={`${model}-${v.size}`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {v.size} {v.size_type}
                  </TableCell>

                  <TableCell>{v.finish}</TableCell>
                  <TableCell>{v.packing}</TableCell>

                  <TableCell className="text-right">
                    {v.rates?.mrp ?? "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    {v.rates?.sale_price ?? "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    {v.rates?.purchase_price ?? "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;
