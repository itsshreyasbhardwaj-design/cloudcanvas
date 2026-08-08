import type { ArchitectureGraph } from "./types";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  nodeIds: string[];
  edgeIds?: string[];
}

export type ValidationRule = (graph: ArchitectureGraph) => ValidationIssue[];

export function issue(
  code: string,
  severity: ValidationSeverity,
  message: string,
  nodeIds: string[],
  edgeIds?: string[],
): ValidationIssue {
  return { id: `${code}:${nodeIds.join(",")}${edgeIds ? ":" + edgeIds.join(",") : ""}`, severity, code, message, nodeIds, edgeIds };
}
