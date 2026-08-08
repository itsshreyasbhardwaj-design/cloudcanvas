import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { getCatalogEntry } from "@/lib/resource-model";
import { categoryColor } from "@/lib/resource-model/colors";
import { ResourceIcon } from "../resource-icon";
import { cn } from "@/lib/utils";
import type { CanvasNode } from "../types";

function ContainerNodeImpl({ data, selected }: NodeProps<Extract<CanvasNode, { type: "container" }>>) {
  const { architectureNode } = data;
  const entry = getCatalogEntry(architectureNode.kind);
  const color = categoryColor(entry.category);

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-xl border-2 border-dashed bg-transparent",
        selected ? "border-cc-accent" : "",
      )}
      style={{
        borderColor: selected ? undefined : `color-mix(in oklch, ${color} 45%, transparent)`,
        backgroundColor: `color-mix(in oklch, ${color} 4%, transparent)`,
      }}
    >
      <div
        className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
        style={{ backgroundColor: `color-mix(in oklch, ${color} 20%, transparent)`, color }}
      >
        <ResourceIcon name={entry.icon} className="h-3.5 w-3.5" />
        <span>{architectureNode.name}</span>
        {typeof architectureNode.fields.cidr === "string" && (
          <span className="font-mono opacity-70">{architectureNode.fields.cidr}</span>
        )}
      </div>
    </div>
  );
}

export const ContainerNode = memo(ContainerNodeImpl);
