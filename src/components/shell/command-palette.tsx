"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { RESOURCE_CATALOG, RESOURCE_CATEGORY_LABELS } from "@/lib/resource-model";
import { listCloudProviders } from "@/lib/providers/registry";
import { ResourceIcon } from "@/components/canvas/resource-icon";
import { useArchitectureStore, useUiStore } from "@/lib/store";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const toggle = useUiStore((s) => s.toggleCommandPalette);
  const { setTheme, resolvedTheme } = useTheme();
  const addResource = useArchitectureStore((s) => s.addResource);
  const setProvider = useArchitectureStore((s) => s.setProvider);
  const resetGraph = useArchitectureStore((s) => s.resetGraph);
  const undo = useArchitectureStore((s) => s.undo);
  const redo = useArchitectureStore((s) => s.redo);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search resources…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
            Toggle dark / light mode
          </CommandItem>
          <CommandItem onSelect={() => run(undo)}>Undo</CommandItem>
          <CommandItem onSelect={() => run(redo)}>Redo</CommandItem>
          <CommandItem onSelect={() => run(() => resetGraph())}>New architecture</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Switch provider">
          {listCloudProviders().map((p) => (
            <CommandItem key={p.id} onSelect={() => run(() => setProvider(p.id))}>
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Add resource">
          {RESOURCE_CATALOG.map((entry) => (
            <CommandItem
              key={entry.kind}
              value={`${entry.label} ${RESOURCE_CATEGORY_LABELS[entry.category]}`}
              onSelect={() => run(() => addResource(entry.kind, { x: 160, y: 160 }))}
            >
              <ResourceIcon name={entry.icon} className="h-4 w-4" />
              {entry.label}
              <span className="ml-auto text-xs text-muted-foreground">{RESOURCE_CATEGORY_LABELS[entry.category]}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
