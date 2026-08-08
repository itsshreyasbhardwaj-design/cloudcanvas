"use client";

import { useCallback, useMemo, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useArchitectureStore } from "@/lib/store";
import { getAbsolutePosition } from "@/lib/graph/types";
import { isContainerKind, findContainerAt } from "@/lib/graph/operations";
import type { ResourceKind } from "@/lib/resource-model/types";
import { graphToReactFlow } from "./convert";
import { ResourceNode } from "./nodes/resource-node";
import { ContainerNode } from "./nodes/container-node";
import { RESOURCE_DND_MIME } from "./types";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { CanvasToolbar } from "./canvas-toolbar";

const nodeTypes = { resource: ResourceNode, container: ContainerNode };
export { RESOURCE_DND_MIME };

function CanvasInner() {
  const graph = useArchitectureStore((s) => s.graph);
  const select = useArchitectureStore((s) => s.select);
  const moveNode = useArchitectureStore((s) => s.moveNode);
  const removeNodes = useArchitectureStore((s) => s.removeNodes);
  const disconnect = useArchitectureStore((s) => s.disconnect);
  const connect = useArchitectureStore((s) => s.connect);
  const addResource = useArchitectureStore((s) => s.addResource);
  const reparent = useArchitectureStore((s) => s.reparent);

  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();

  const { nodes, edges } = useMemo(() => graphToReactFlow(graph), [graph]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          moveNode(change.id, change.position);
        } else if (change.type === "remove") {
          removeNodes([change.id]);
        }
      }
    },
    [moveNode, removeNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removedIds = changes.filter((c) => c.type === "remove").map((c) => c.id);
      if (removedIds.length > 0) disconnect(removedIds);
    },
    [disconnect],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      connect(connection.source, connection.target, "network");
    },
    [connect],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      select(
        selectedNodes.map((n) => n.id),
        selectedEdges.map((e) => e.id),
      );
    },
    [select],
  );

  const onNodeDragStop = useCallback(
    (_event: unknown, node: { id: string; position: { x: number; y: number } }) => {
      if (isContainerKind(graph.nodes.find((n) => n.id === node.id)?.kind as ResourceKind)) return;
      const absolute = { x: node.position.x, y: node.position.y };
      const currentParent = graph.nodes.find((n) => n.id === node.id)?.parentId;
      if (currentParent) {
        const parentAbs = getAbsolutePosition(graph, currentParent);
        absolute.x += parentAbs.x;
        absolute.y += parentAbs.y;
      }
      const newParent = findContainerAt(graph, absolute);
      if (newParent !== currentParent) {
        const parentAbs = newParent ? getAbsolutePosition(graph, newParent) : { x: 0, y: 0 };
        reparent(node.id, newParent);
        moveNode(node.id, { x: absolute.x - parentAbs.x, y: absolute.y - parentAbs.y });
      }
    },
    [graph, reparent, moveNode],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData(RESOURCE_DND_MIME) as ResourceKind;
      if (!kind) return;
      const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const parentId = findContainerAt(graph, flowPosition);
      const position = parentId
        ? { x: flowPosition.x - getAbsolutePosition(graph, parentId).x, y: flowPosition.y - getAbsolutePosition(graph, parentId).y }
        : flowPosition;
      addResource(kind, position, parentId);
    },
    [addResource, graph, screenToFlowPosition],
  );

  return (
    <div ref={wrapperRef} className="relative h-full w-full bg-cc-canvas-bg" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeDragStop={onNodeDragStop}
        multiSelectionKeyCode={["Meta", "Control"]}
        deleteKeyCode={null}
        minZoom={0.15}
        maxZoom={2}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--cc-canvas-dot)" />
        <Controls showInteractive={false} className="!rounded-lg !border !border-border !bg-card !shadow-md" />
        <MiniMap
          className="!rounded-lg !border !border-border !bg-card"
          maskColor="color-mix(in oklch, var(--cc-canvas-bg) 70%, transparent)"
          nodeColor={() => "var(--cc-accent)"}
        />
        <CanvasToolbar />
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
