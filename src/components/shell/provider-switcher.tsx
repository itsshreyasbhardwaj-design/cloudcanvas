"use client";

import { Check, ChevronDown, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listCloudProviders } from "@/lib/providers/registry";
import { useArchitectureStore } from "@/lib/store";

export function ProviderSwitcher() {
  const provider = useArchitectureStore((s) => s.provider);
  const setProvider = useArchitectureStore((s) => s.setProvider);
  const providers = listCloudProviders();
  const active = providers.find((p) => p.id === provider);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Cloud className="h-3.5 w-3.5" />
            {active?.label ?? provider}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        {providers.map((p) => (
          <DropdownMenuItem key={p.id} onClick={() => setProvider(p.id)} className="justify-between text-sm">
            {p.label}
            {p.id === provider && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
