"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RESOURCE_CATALOG, getCatalogByCategory, searchCatalog, RESOURCE_CATEGORY_LABELS } from "@/lib/resource-model";
import type { ResourceCategory } from "@/lib/resource-model/types";
import { categoryColor } from "@/lib/resource-model/colors";
import { ResourceIcon } from "@/components/canvas/resource-icon";
import { RESOURCE_DND_MIME } from "@/components/canvas/types";
import { useArchitectureStore } from "@/lib/store";

const CATEGORIES = Object.keys(RESOURCE_CATEGORY_LABELS) as ResourceCategory[];

export function ResourceLibrary() {
  const [query, setQuery] = useState("");
  const addResource = useArchitectureStore((s) => s.addResource);
  const nodeCount = useArchitectureStore((s) => s.graph.nodes.length);

  const filtered = useMemo(() => (query ? searchCatalog(query) : RESOURCE_CATALOG), [query]);
  const filteredKinds = useMemo(() => new Set(filtered.map((e) => e.kind)), [filtered]);

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card/40">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <Accordion multiple defaultValue={CATEGORIES} className="px-2 py-1">
          {CATEGORIES.map((category) => {
            const entries = getCatalogByCategory(category).filter((e) => filteredKinds.has(e.kind));
            if (entries.length === 0) return null;
            const color = categoryColor(category);
            return (
              <AccordionItem key={category} value={category} className="border-none">
                <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {RESOURCE_CATEGORY_LABELS[category]}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1 pb-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.kind}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(RESOURCE_DND_MIME, entry.kind);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => addResource(entry.kind, { x: 120 + (nodeCount % 6) * 24, y: 120 + (nodeCount % 6) * 24 })}
                      className="flex cursor-grab items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-[13px] hover:border-border hover:bg-accent active:cursor-grabbing"
                      title={entry.description}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                        style={{ backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`, color }}
                      >
                        <ResourceIcon name={entry.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{entry.label}</span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
