import React from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";

const ProductVendor = () => {
  return (
    <Card className="card col-span-4 lg:col-span-2 ">
      <CardHeader>
        <CardTitle className="text-xl">Product Vendor Detail</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ProductVendor;
