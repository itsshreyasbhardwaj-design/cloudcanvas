import { getNode, type ArchitectureGraph } from "@/lib/graph/types";
import { isContainerKind } from "@/lib/graph/operations";
import { validateArchitecture } from "@/lib/graph/validate";
import type { CanvasNode, CanvasEdge } from "./types";
import { DEFAULT_CONTAINER_SIZE } from "./types";

function depthOf(graph: ArchitectureGraph, id: string): number {
  let depth = 0;
  let current = getNode(graph, id)?.parentId;
  while (current) {
    depth += 1;
    current = getNode(graph, current)?.parentId;
  }
  return depth;
}

/** React Flow expects a parent node to appear before its children in the array. */
function sortByDepth(graph: ArchitectureGraph) {
  return [...graph.nodes].sort((a, b) => depthOf(graph, a.id) - depthOf(graph, b.id));
}

export function graphToReactFlow(graph: ArchitectureGraph): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const issues = validateArchitecture(graph);
  const errorCountByNode = new Map<string, number>();
  for (const issue of issues) {
    if (issue.severity !== "error") continue;
    for (const id of issue.nodeIds) errorCountByNode.set(id, (errorCountByNode.get(id) ?? 0) + 1);
  }

  const nodes: CanvasNode[] = sortByDepth(graph).map((n) => {
    if (isContainerKind(n.kind)) {
      const size = n.size ?? DEFAULT_CONTAINER_SIZE[n.kind] ?? { width: 400, height: 260 };
      return {
        id: n.id,
        type: "container",
        position: n.position,
        parentId: n.parentId,
        extent: n.parentId ? "parent" : undefined,
        zIndex: -1,
        style: { width: size.width, height: size.height },
        data: { architectureNode: n },
      };
    }
    const issueCount = errorCountByNode.get(n.id) ?? 0;
    return {
      id: n.id,
      type: "resource",
      position: n.position,
      parentId: n.parentId,
      extent: n.parentId ? "parent" : undefined,
      data: { architectureNode: n, isValid: issueCount === 0, issueCount },
    };
  });

  const edges: CanvasEdge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    data: { kind: e.kind },
    style: { stroke: "var(--cc-canvas-edge)" },
    animated: e.kind === "publishes-to" || e.kind === "subscribes-to",
  }));

  return { nodes, edges };
}
