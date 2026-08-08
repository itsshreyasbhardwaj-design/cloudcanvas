import { useEffect } from "react";
import { useArchitectureStore } from "@/lib/store";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const store = useArchitectureStore.getState();

      if ((e.key === "Delete" || e.key === "Backspace") && !mod) {
        e.preventDefault();
        store.deleteSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        store.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "c") {
        e.preventDefault();
        store.copySelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const anchor = store.clipboard?.nodes[0]?.position ?? { x: 0, y: 0 };
        store.paste({ x: anchor.x + 60, y: anchor.y + 60 });
        return;
      }
      if (e.key === "Escape") {
        store.clearSelection();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
