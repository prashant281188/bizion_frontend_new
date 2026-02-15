import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PublicProductCard = () => {
  return (
    <div className=" border shadow rounded-lg hover:shadow-lg overflow-clip">
      <Image src={"/products/1.jpg"} alt="product-1" width={500} height={500} />
      <div className="px-4 pt-4 text-slate-600 text-sm">
        <h3 className="text-xl tracking-wide font-semibold text-gray-700">
          HC-1902
        </h3>
        <h3 className="text-sm tracking-wide text-gray-500">Brand</h3>
        <div className="text-sm">Size : 96 mm, 160 mm 224 mm, 288 mm</div>
        <div className="text-sm">Finish : Gold, RG, ST, Black</div>
        <div className="text-xs">Metal : Aluminium</div>
        <div className="text-xs">Application : Wardrobe, Cabinet</div>
      </div>
      <div className="pb-4 pt-2">
        <Link href={"products/123"} className=" px-4 text-sm text-blue-500 flex items-center gap-2 hover:text-green-500">View Details <ArrowRight size={16}/></Link>
      </div>
    </div>
  );
};

export default PublicProductCard;
