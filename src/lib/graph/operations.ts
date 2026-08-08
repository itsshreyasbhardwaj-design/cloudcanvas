import type { ArchitectureEdge, ArchitectureGraph, ArchitectureNode, ConnectionKind } from "./types";
import { getChildren, getAbsolutePosition } from "./types";
import type { ResourceKind } from "../resource-model/types";
import { DEFAULT_CONTAINER_SIZE, FALLBACK_CONTAINER_SIZE } from "../resource-model/container-sizes";

export function addNode(
  graph: ArchitectureGraph,
  node: Omit<ArchitectureNode, "id"> & { id?: string },
  makeId: () => string,
): ArchitectureGraph {
  const newNode: ArchitectureNode = { ...node, id: node.id ?? makeId() };
  return { ...graph, nodes: [...graph.nodes, newNode], updatedAt: new Date().toISOString() };
}

/** Removing a node cascades to its descendants (containment) and any edges touching any of them. */
export function removeNode(graph: ArchitectureGraph, nodeId: string): ArchitectureGraph {
  const toRemove = new Set<string>([nodeId]);
  let frontier = [nodeId];
  while (frontier.length > 0) {
    const next = frontier.flatMap((id) => getChildren(graph, id).map((n) => n.id));
    next.forEach((id) => toRemove.add(id));
    frontier = next;
  }
  return {
    ...graph,
    nodes: graph.nodes.filter((n) => !toRemove.has(n.id)),
    edges: graph.edges.filter((e) => !toRemove.has(e.source) && !toRemove.has(e.target)),
    updatedAt: new Date().toISOString(),
  };
}

export function updateNode(
  graph: ArchitectureGraph,
  nodeId: string,
  patch: Partial<Omit<ArchitectureNode, "id">>,
): ArchitectureGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)),
    updatedAt: new Date().toISOString(),
  };
}

export function addEdge(
  graph: ArchitectureGraph,
  edge: Omit<ArchitectureEdge, "id"> & { id?: string },
  makeId: () => string,
): ArchitectureGraph {
  const newEdge: ArchitectureEdge = { ...edge, id: edge.id ?? makeId() };
  return { ...graph, edges: [...graph.edges, newEdge], updatedAt: new Date().toISOString() };
}

export function removeEdge(graph: ArchitectureGraph, edgeId: string): ArchitectureGraph {
  return { ...graph, edges: graph.edges.filter((e) => e.id !== edgeId), updatedAt: new Date().toISOString() };
}

/** Duplicates a node (and, recursively, its contained children) with a positional offset. Edges between duplicated nodes are recreated; edges to un-duplicated nodes are dropped. */
export function duplicateSubtree(
  graph: ArchitectureGraph,
  rootNodeId: string,
  makeId: () => string,
  offset = { x: 40, y: 40 },
): { graph: ArchitectureGraph; newRootId: string } {
  const idMap = new Map<string, string>();
  const collect = (id: string): ArchitectureNode[] => {
    const node = graph.nodes.find((n) => n.id === id);
    if (!node) return [];
    const children = getChildren(graph, id).flatMap((c) => collect(c.id));
    return [node, ...children];
  };
  const subtreeNodes = collect(rootNodeId);
  subtreeNodes.forEach((n) => idMap.set(n.id, makeId()));

  const clonedNodes: ArchitectureNode[] = subtreeNodes.map((n) => ({
    ...n,
    id: idMap.get(n.id)!,
    name: n.id === rootNodeId ? `${n.name} (copy)` : n.name,
    position: { x: n.position.x + offset.x, y: n.position.y + offset.y },
    parentId: n.parentId && idMap.has(n.parentId) ? idMap.get(n.parentId) : n.parentId,
  }));

  const clonedEdges: ArchitectureEdge[] = graph.edges
    .filter((e) => idMap.has(e.source) && idMap.has(e.target))
    .map((e) => ({ ...e, id: makeId(), source: idMap.get(e.source)!, target: idMap.get(e.target)! }));

  return {
    graph: {
      ...graph,
      nodes: [...graph.nodes, ...clonedNodes],
      edges: [...graph.edges, ...clonedEdges],
      updatedAt: new Date().toISOString(),
    },
    newRootId: idMap.get(rootNodeId)!,
  };
}

export function reparentNode(graph: ArchitectureGraph, nodeId: string, parentId: string | undefined): ArchitectureGraph {
  return updateNode(graph, nodeId, { parentId });
}

export function connectableKinds(): ConnectionKind[] {
  return ["network", "routes-to", "publishes-to", "subscribes-to"];
}

export function isContainerKind(kind: ResourceKind): boolean {
  return kind.startsWith("networking.vpc") || kind.startsWith("networking.subnet") || kind.startsWith("networking.region") || kind.startsWith("networking.availability-zone");
}

/**
 * Finds which container (vpc/subnet/region/az) an absolute canvas point falls inside,
 * preferring the most deeply nested match — e.g. a point inside a subnet that is itself
 * inside a VPC resolves to the subnet, not the VPC. Used to auto-nest a resource when it's
 * dropped or dragged onto the canvas.
 */
export function findContainerAt(graph: ArchitectureGraph, point: { x: number; y: number }): string | undefined {
  let best: { id: string; depth: number } | undefined;
  for (const container of graph.nodes.filter((n) => isContainerKind(n.kind))) {
    const abs = getAbsolutePosition(graph, container.id);
    const size = container.size ?? DEFAULT_CONTAINER_SIZE[container.kind] ?? FALLBACK_CONTAINER_SIZE;
    const within = point.x >= abs.x && point.x <= abs.x + size.width && point.y >= abs.y && point.y <= abs.y + size.height;
    if (!within) continue;

    let depth = 0;
    let current = container.parentId;
    while (current) {
      depth += 1;
      current = graph.nodes.find((n) => n.id === current)?.parentId;
    }
    if (!best || depth > best.depth) best = { id: container.id, depth };
  }
  return best?.id;
}
