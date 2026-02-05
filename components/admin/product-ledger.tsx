import React from "react";
import { CardHeader, Card, CardTitle } from "../ui/card";

const ProductLedger = () => {
  return (
    <Card className="card col-span-4 lg:col-span-2 ">
      <CardHeader>
        <CardTitle className="text-xl">Product Price Detail</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ProductLedger;
