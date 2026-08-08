"use client";

import type { ReactNode } from "react";
import { Panel } from "@xyflow/react";
import { Undo2, Redo2, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useArchitectureStore } from "@/lib/store";

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function CanvasToolbar() {
  const undo = useArchitectureStore((s) => s.undo);
  const redo = useArchitectureStore((s) => s.redo);
  const duplicateSelected = useArchitectureStore((s) => s.duplicateSelected);
  const deleteSelected = useArchitectureStore((s) => s.deleteSelected);
  const past = useArchitectureStore((s) => s.past);
  const future = useArchitectureStore((s) => s.future);
  const selectedNodeIds = useArchitectureStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useArchitectureStore((s) => s.selectedEdgeIds);

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;

  return (
    <Panel position="top-center">
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-md">
        <ToolbarButton label="Undo (⌘Z)" onClick={undo} disabled={past.length === 0}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo (⌘⇧Z)" onClick={redo} disabled={future.length === 0}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <ToolbarButton label="Duplicate (⌘D)" onClick={duplicateSelected} disabled={selectedNodeIds.length === 0}>
          <Copy className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Delete" onClick={deleteSelected} disabled={!hasSelection}>
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </Panel>
  );
}
