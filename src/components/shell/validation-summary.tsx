"use client";

import { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateArchitecture, countBySeverity } from "@/lib/graph/validate";
import { useArchitectureStore } from "@/lib/store";

export function ValidationSummary() {
  const graph = useArchitectureStore((s) => s.graph);
  const issues = useMemo(() => validateArchitecture(graph), [graph]);
  const counts = countBySeverity(issues);
  const hasIssues = issues.length > 0;

  return (
    <Popover>
      <PopoverTrigger className="flex h-8 items-center gap-2 rounded-md border border-border bg-transparent px-2.5 text-xs font-medium hover:bg-accent">
          {hasIssues ? (
            <>
              {counts.error > 0 && (
                <span className="flex items-center gap-1 text-cc-danger">
                  <AlertCircle className="h-3.5 w-3.5" /> {counts.error}
                </span>
              )}
              {counts.warning > 0 && (
                <span className="flex items-center gap-1 text-cc-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> {counts.warning}
                </span>
              )}
              {counts.info > 0 && (
                <span className="flex items-center gap-1 text-cc-info">
                  <Info className="h-3.5 w-3.5" /> {counts.info}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1 text-cc-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> No issues
            </span>
          )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b border-border px-3 py-2 text-sm font-medium">Architecture validation</div>
        {issues.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">No structural issues detected.</div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y divide-border">
              {issues.map((issue) => (
                <li key={issue.id} className="flex items-start gap-2 px-3 py-2 text-xs">
                  {issue.severity === "error" && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cc-danger" />}
                  {issue.severity === "warning" && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cc-warning" />}
                  {issue.severity === "info" && <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cc-info" />}
                  <span className="text-foreground/90">{issue.message}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
