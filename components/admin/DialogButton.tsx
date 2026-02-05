"use client";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";

interface DialogButtonProps {
  tooltip: string;
  form: React.ReactNode;
}

const DialogButton = ({ form, tooltip }: DialogButtonProps) => {
  const [open, setOpen] = useState(false);
  const handlePopover = () => {
    setOpen(!open);
  };
  return (
    <div>
      <TooltipProvider>
        <Dialog open={open} onOpenChange={setOpen}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handlePopover();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogTitle>{tooltip}</DialogTitle>
            {form}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
};

export default DialogButton;
