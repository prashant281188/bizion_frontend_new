import BiBreadcrumb from "@/components/ui/common/BiBreadcrumb";
import React from "react";
import ProductDetail from "../components/ProductDetail";

const productDemo = {
  model: "SH-2001",
  manufacture: "Flybird Interior Pvt Ltd.",
  hsn: "8302",
  category:"Profile",
  metal:"Aluminum",
  brand : "Flybird",

  variants: [
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Rose Gold",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Gold",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Black",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Sand",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Grey",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Blue",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Pink",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Brown",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic White",
      packing: "15 Pcs.",
    },
    {
      size: "3048",
      size_type: "mm",
      finish: "Ceramic Green",
      packing: "15 Pcs.",
    },
    

  ],
};
const page = () => {
  return (
    <div className="max-w-9xl mx-auto gap-4 grid">
      <BiBreadcrumb />
      
      <ProductDetail Product={productDemo} />
    </div>
  );
};

export default page;
