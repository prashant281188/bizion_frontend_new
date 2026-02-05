import React from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Input } from "../ui/input";
import Link from "next/link";

const ProductList = () => {
  return (
    <div className="w-full max-h-[500px]">
      <div className="flex items-center space-x-4  justify-start">
        <div>
          <Input
            type="text"
            placeholder="Search Product"
            className="rounded-none"
          />
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="rounded-none">
                <PlusCircle />
                Category
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-none" align="start">
              <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>Cabinet Handle</CommandItem>
                    <CommandItem>Door Handle</CommandItem>
                    <CommandItem>Front Screw Handle</CommandItem>
                    <CommandItem>Profile Handle</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="rounded-none">
                <PlusCircle />
                Finish
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-none" align="start">
              <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup >
                    <CommandItem>PVD Rose Gold</CommandItem>
                    <CommandItem>PVD Gold</CommandItem>
                    <CommandItem>PVD Black</CommandItem>
                    <CommandItem>Black</CommandItem>
                    <CommandItem>AB</CommandItem>
                    <CommandItem>Rose Gold</CommandItem>
                    <CommandItem>Calculator</CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                 
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Table>
        <TableCaption>Product Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Packing</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="text-muted-foreground">
            <TableCell className="uppercase">
              <Link href={"/product/id"}  >Model</Link>
            </TableCell>
            <TableCell>Cabinet Handle</TableCell>
            <TableCell>Pcs.</TableCell>
            <TableCell>114.50</TableCell>
            <TableCell>25</TableCell>
            <TableCell>400</TableCell>
          </TableRow>
          
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ProductList;
