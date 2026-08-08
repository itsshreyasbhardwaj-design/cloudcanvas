import { getNode } from "../types";
import { issue, type ValidationRule } from "../validation-types";

/** Edges must reference nodes that actually exist in the graph. */
export const danglingEdgeRule: ValidationRule = (graph) => {
  const issues = [];
  for (const edge of graph.edges) {
    const source = getNode(graph, edge.source);
    const target = getNode(graph, edge.target);
    if (!source || !target) {
      issues.push(
        issue(
          "dangling-edge",
          "error",
          `Connection references a resource that no longer exists.`,
          [source?.id, target?.id].filter((x): x is string => Boolean(x)),
          [edge.id],
        ),
      );
    }
  }
  return issues;
};

/** A resource connected to itself is never a valid infrastructure relationship. */
export const selfLoopRule: ValidationRule = (graph) => {
  const issues = [];
  for (const edge of graph.edges) {
    if (edge.source === edge.target) {
      const node = getNode(graph, edge.source);
      issues.push(
        issue(
          "self-loop",
          "error",
          `${node?.name ?? "This resource"} is connected to itself, which isn't a valid connection.`,
          [edge.source],
          [edge.id],
        ),
      );
    }
  }
  return issues;
};

/** Two identical edges between the same pair of resources add no information and usually indicate a mistake. */
export const duplicateEdgeRule: ValidationRule = (graph) => {
  const seen = new Map<string, string>();
  const issues = [];
  for (const edge of graph.edges) {
    const key = `${edge.source}->${edge.target}:${edge.kind}`;
    const existing = seen.get(key);
    if (existing) {
      issues.push(
        issue(
          "duplicate-edge",
          "warning",
          `There are multiple identical connections between the same two resources.`,
          [edge.source, edge.target],
          [existing, edge.id],
        ),
      );
    } else {
      seen.set(key, edge.id);
    }
  }
  return issues;
};

/** A node's `parentId` chain must terminate, not loop back on itself. */
export const containmentCycleRule: ValidationRule = (graph) => {
  const issues = [];
  for (const node of graph.nodes) {
    const visited = new Set<string>();
    let current: string | undefined = node.id;
    while (current) {
      if (visited.has(current)) {
        issues.push(
          issue(
            "containment-cycle",
            "error",
            `${node.name} has a containment loop (it is nested inside something that is nested inside itself), which is an impossible configuration.`,
            [node.id],
          ),
        );
        break;
      }
      visited.add(current);
      current = getNode(graph, current)?.parentId;
    }
  }
  return issues;
};
