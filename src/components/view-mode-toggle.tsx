"use client";

import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useViewMode } from "@/components/view-mode-provider";

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();
  const isGrid = viewMode === "grid";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setViewMode(isGrid ? "list" : "grid")}
      aria-label={isGrid ? "Switch to list view" : "Switch to grid view"}
      title={isGrid ? "Switch to list view" : "Switch to grid view"}
    >
      {isGrid ? (
        <List className="h-5 w-5" />
      ) : (
        <LayoutGrid className="h-5 w-5" />
      )}
    </Button>
  );
}
