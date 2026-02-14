import Image from "next/image";
import Link from "next/link";
import React from "react";
const products = [
  {
    name: "Linear Door Handle",
    image: "/images/products/handle-1.jpg",
    category: "Door Handle",
    finish: "Matt Black",
    link: "products/1",
  },
  {
    name: "Slim Cabinet Handle",
    image: "/images/products/handle-2.jpg",
    category: "Cabinet Handle",
    finish: "Brushed Brass",
    link: "products/2",
  },
  {
    name: "Profile Handle Pro",
    image: "/images/products/handle-3.jpg",
    category: "Profile Handle",
    finish: "Aluminium",
    link: "products/3",
  },
  {
    name: "Luxury Pull Handle",
    image: "/images/products/handle-4.jpg",
    category: "Door Handle",
    finish: "Rose Gold",
    link: "products/4",
  },
];
const PublicProdcutsPage = () => {
  return (
    <>
      <section className="relative w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Our Collections
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Explore premium architectural hardware crafted for modern spaces
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            className="w-full md:max-w-sm rounded-md border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500">
              <option>All Categories</option>
              <option>Door Handles</option>
              <option>Cabinet Handles</option>
              <option>Profile Handles</option>
              <option>Bathroom Accessories</option>
            </select>

            <select className="rounded-md border border-black/10 px-4 py-2 text-sm focus:ring-amber-500">
              <option>All Finishes</option>
              <option>Matt Black</option>
              <option>Brushed Brass</option>
              <option>Chrome</option>
              <option>Rose Gold</option>
            </select>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>
    </>
  );
};

interface ProductCardProps {
  name: string;
  image: string;
  category: string;
  finish: string;
  link: string;
}

function ProductCard({
  name,
  image,
  category,
  finish,
  link,
}: ProductCardProps) {
  return (
    <div className="group rounded-2xl bg-white ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={link}>
        <div className="aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={image}
            alt={name}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{category}</p>
          <p className="mt-1 text-xs text-muted-foreground">{finish}</p>
        </div>
      </Link>
    </div>
  );
}

export default PublicProdcutsPage;
