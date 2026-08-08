import type { Node, Edge } from "@xyflow/react";
import type { ArchitectureNode, ConnectionKind } from "@/lib/graph/types";

export { DEFAULT_CONTAINER_SIZE, FALLBACK_CONTAINER_SIZE } from "@/lib/resource-model/container-sizes";

export interface ResourceNodeData extends Record<string, unknown> {
  architectureNode: ArchitectureNode;
  isValid: boolean;
  issueCount: number;
}

export interface ContainerNodeData extends Record<string, unknown> {
  architectureNode: ArchitectureNode;
}

export type CanvasNode = Node<ResourceNodeData, "resource"> | Node<ContainerNodeData, "container">;
export type CanvasEdge = Edge<{ kind: ConnectionKind }>;

export const RESOURCE_DND_MIME = "application/x-cloudcanvas-resource-kind";
