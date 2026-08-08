"use client";

import { TopBar } from "./top-bar";
import { CommandPalette } from "./command-palette";
import { ResourceLibrary } from "@/components/resource-library/resource-library";
import { Canvas } from "@/components/canvas/canvas";

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <ResourceLibrary />
        <main className="min-w-0 flex-1">
          <Canvas />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
