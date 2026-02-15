import ProductForm from "@/components/admin/form/ProductForm";
import BiBreadcrumb from "@/components/ui/common/BiBreadcrumb";
import PageHeader from "@/components/navigation/public/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import React from "react";

const page = () => {
  return (
    <div className="max-w-9xl mx-auto gap-4 grid">
      <BiBreadcrumb />
      <div>
        <Link href="/admin/products/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
      <PageHeader title="Add New Product" description="Create New Product" />
      <ProductForm />
    </div>
  );
};

export default page;
