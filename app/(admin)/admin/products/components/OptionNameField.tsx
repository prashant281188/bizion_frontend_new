/**
 * OptionNameField.tsx
 *
 * A compound select field for choosing a product option name (e.g. "Size",
 * "Colour"). Behaviour:
 *
 *  1. Renders a <Select> populated with all existing option names fetched
 *     from the database.
 *  2. The last item in the list is "+ Add new option…". Choosing it reveals
 *     an inline text input so the user can type and save a brand-new name
 *     without leaving the form.
 *  3. Once saved, the new name is added to the DB (via the `onCreate` prop)
 *     and immediately selected.
 *
 * The `skipEffectRef` guard prevents the sync effect from re-opening the
 * "new name" input right after the user just saved it.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OptionNameFieldProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  /** Names of all existing options from the DB */
  options: string[];
  /** Called when the user confirms a brand-new option name */
  onCreate: (name: string) => Promise<void>;
}

export function OptionNameField({
  value,
  onChange,
  error,
  options,
  onCreate,
}: OptionNameFieldProps) {
  const isKnown = options.includes(value);

  // Show the inline text input when the current value is not in the DB yet
  const [showNew, setShowNew] = useState(!!value && !isKnown);
  const [newName, setNewName] = useState(!isKnown ? value : "");
  const [creating, setCreating] = useState(false);

  /**
   * When `value` changes externally (e.g. react-hook-form reset) and it's
   * not in the options list, open the "new name" input pre-filled with it.
   * The ref prevents this effect from firing right after the user has just
   * saved a new name (which would immediately re-open the input).
   */
  const skipEffectRef = useRef(false);
  useEffect(() => {
    if (skipEffectRef.current) {
      skipEffectRef.current = false;
      return;
    }
    if (value && !options.includes(value)) {
      setShowNew(true);
      setNewName(value);
    } else {
      setShowNew(false);
    }
  }, [value, options]);

  const handleSelect = (v: string) => {
    if (v === "__new__") {
      // User chose "Add new option…" — show the inline input
      setShowNew(true);
      setNewName("");
    } else {
      setShowNew(false);
      onChange(v);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await onCreate(name);
      // Skip the effect so it doesn't re-open the new-name input
      skipEffectRef.current = true;
      onChange(name);
      setShowNew(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={showNew ? "__new__" : value || ""}
        onValueChange={handleSelect}
      >
        <SelectTrigger className={cn("rounded-lg bg-white", error && "border-red-400")}>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
          <SelectItem value="__new__">+ Add new option…</SelectItem>
        </SelectContent>
      </Select>

      {/* Inline new-name input — only shown when user picked "Add new" */}
      {showNew && (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCreate(); }
            }}
            placeholder="New option name"
            className={cn("rounded-lg bg-white flex-1", error && "border-red-400")}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            disabled={!newName.trim() || creating}
            onClick={handleCreate}
            className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black shrink-0"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}
    </div>
  );
}
