import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Pagination = ({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (value: number) => void;
  page: number;
  totalPages: number;
}) => {
  return (
    <section className="container mx-auto px-6 pb-24 flex justify-between items-center">
      <Button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <ArrowLeft /> Prev
      </Button>
      <span>
        Page {page} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || totalPages === 0}
      >
        Next <ArrowRight />
      </Button>
    </section>
  );
};

export default Pagination;
