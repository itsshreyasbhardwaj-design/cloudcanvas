import type { ResourceKind } from "../resource-model/types";

export type Environment = "development" | "staging" | "production";

/**
 * A node in the architecture graph. `position` is canvas layout state;
 * everything else describes actual infrastructure. `parentId` expresses
 * containment (a subnet inside a VPC, a VM inside a subnet) — this is
 * what makes the graph a real infrastructure model instead of a
 * collection of boxes and lines.
 */
export interface ArchitectureNode {
  id: string;
  kind: ResourceKind;
  name: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  parentId?: string;
  environment?: Environment;
  fields: Record<string, string | number | boolean>;
  annotation?: string;
}

export type ConnectionKind =
  | "network" // generic reachability, e.g. VM -> DB
  | "routes-to" // LB -> targets
  | "contains" // structural containment (rendered, not a real edge in most cases)
  | "publishes-to" // producer -> queue/topic
  | "subscribes-to"; // consumer <- queue/topic

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  kind: ConnectionKind;
  label?: string;
}

export interface ArchitectureGraph {
  id: string;
  name: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  updatedAt: string;
}

export function createEmptyGraph(id: string, name: string): ArchitectureGraph {
  return { id, name, nodes: [], edges: [], updatedAt: new Date(0).toISOString() };
}

export function getChildren(graph: ArchitectureGraph, parentId: string | undefined): ArchitectureNode[] {
  return graph.nodes.filter((n) => n.parentId === parentId);
}

export function getNode(graph: ArchitectureGraph, id: string): ArchitectureNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export function getEdgesForNode(graph: ArchitectureGraph, nodeId: string): ArchitectureEdge[] {
  return graph.edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

export function getNeighbors(graph: ArchitectureGraph, nodeId: string): ArchitectureNode[] {
  const ids = new Set<string>();
  for (const e of graph.edges) {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  }
  return graph.nodes.filter((n) => ids.has(n.id));
}

/** Sums a node's position with every ancestor's, since (like React Flow) a child's position is relative to its parent. */
export function getAbsolutePosition(graph: ArchitectureGraph, nodeId: string): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let current: string | undefined = nodeId;
  while (current) {
    const node = getNode(graph, current);
    if (!node) break;
    x += node.position.x;
    y += node.position.y;
    current = node.parentId;
  }
  return { x, y };
}
