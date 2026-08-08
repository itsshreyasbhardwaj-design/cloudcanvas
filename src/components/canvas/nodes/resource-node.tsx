import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangle, Globe2 } from "lucide-react";
import { getCatalogEntry } from "@/lib/resource-model";
import { categoryColor } from "@/lib/resource-model/colors";
import { ResourceIcon } from "../resource-icon";
import { cn } from "@/lib/utils";
import type { CanvasNode } from "../types";

function ResourceNodeImpl({ data, selected }: NodeProps<Extract<CanvasNode, { type: "resource" }>>) {
  const { architectureNode, isValid, issueCount } = data;
  const entry = getCatalogEntry(architectureNode.kind);
  const color = categoryColor(entry.category);
  const isPublic = architectureNode.fields.publiclyAccessible === true || architectureNode.fields.isPublic === true;

  return (
    <div
      className={cn(
        "group relative flex min-w-[168px] items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-shadow",
        selected ? "border-cc-accent ring-2 ring-cc-accent/40" : "border-border hover:shadow-md",
      )}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !bg-background" style={{ borderColor: color }} />
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`, color }}
      >
        <ResourceIcon name={entry.icon} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium leading-tight">{architectureNode.name}</div>
        <div className="truncate text-[11px] leading-tight text-muted-foreground">{entry.label}</div>
      </div>
      {isPublic && (
        <span title="Publicly accessible">
          <Globe2 className="h-3.5 w-3.5 shrink-0 text-cc-warning" />
        </span>
      )}
      {!isValid && (
        <span title={`${issueCount} validation issue${issueCount === 1 ? "" : "s"}`}>
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-cc-danger" />
        </span>
      )}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !bg-background" style={{ borderColor: color }} />
    </div>
  );
}

export const ResourceNode = memo(ResourceNodeImpl);
