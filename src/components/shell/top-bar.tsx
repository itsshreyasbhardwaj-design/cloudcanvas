"use client";

import { useMemo } from "react";
import { Command, LayoutGrid } from "lucide-react";
import { ProviderSwitcher } from "./provider-switcher";
import { ValidationSummary } from "./validation-summary";
import { ThemeToggle } from "./theme-toggle";
import { useArchitectureStore, useUiStore } from "@/lib/store";
import { getCostProvider } from "@/lib/providers/registry";

export function TopBar() {
  const graph = useArchitectureStore((s) => s.graph);
  const provider = useArchitectureStore((s) => s.provider);
  const toggleCommandPalette = useUiStore((s) => s.toggleCommandPalette);

  const estimate = useMemo(() => getCostProvider(provider).estimate(graph.nodes), [provider, graph.nodes]);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-3">
      <div className="flex items-center gap-1.5 pr-2 text-sm font-semibold">
        <LayoutGrid className="h-4 w-4 text-cc-accent" />
        CloudCanvas
      </div>
      <span className="truncate text-sm text-muted-foreground">{graph.name}</span>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground sm:flex" title={estimate.disclaimer}>
          ~${estimate.monthlyTotal.toLocaleString()}/mo (est.)
        </span>
        <ValidationSummary />
        <ProviderSwitcher />
        <button
          type="button"
          className="hidden h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground hover:bg-accent sm:flex"
          onClick={toggleCommandPalette}
        >
          <Command className="h-3.5 w-3.5" /> K
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
