import { create } from "zustand";
import {
  createEmptyGraph,
  addNode,
  removeNode,
  updateNode,
  addEdge,
  removeEdge,
  duplicateSubtree,
  reparentNode,
  type ArchitectureGraph,
  type ArchitectureNode,
  type ArchitectureEdge,
  type ConnectionKind,
} from "../graph";
import type { ResourceKind } from "../resource-model/types";
import { getCatalogEntry } from "../resource-model";
import type { CloudProviderId } from "../providers/types";
import { makeId } from "./id";

const MAX_HISTORY = 100;

interface Clipboard {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

interface ArchitectureStoreState {
  graph: ArchitectureGraph;
  past: ArchitectureGraph[];
  future: ArchitectureGraph[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  clipboard: Clipboard | null;
  provider: CloudProviderId;

  setProvider: (provider: CloudProviderId) => void;
  loadGraph: (graph: ArchitectureGraph) => void;
  resetGraph: (name?: string) => void;

  addResource: (kind: ResourceKind, position: { x: number; y: number }, parentId?: string) => string;
  removeNodes: (nodeIds: string[]) => void;
  updateNodeFields: (nodeId: string, fields: Record<string, string | number | boolean>) => void;
  renameNode: (nodeId: string, name: string) => void;
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;
  reparent: (nodeId: string, parentId: string | undefined) => void;

  connect: (source: string, target: string, kind: ConnectionKind) => void;
  disconnect: (edgeIds: string[]) => void;

  select: (nodeIds: string[], edgeIds?: string[]) => void;
  toggleSelect: (nodeId: string) => void;
  clearSelection: () => void;

  duplicateSelected: () => void;
  copySelected: () => void;
  paste: (position: { x: number; y: number }) => void;
  deleteSelected: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function pushHistory(state: ArchitectureStoreState): Pick<ArchitectureStoreState, "past" | "future"> {
  const past = [...state.past, state.graph].slice(-MAX_HISTORY);
  return { past, future: [] };
}

export const useArchitectureStore = create<ArchitectureStoreState>((set, get) => ({
  graph: createEmptyGraph(makeId("arch"), "Untitled Architecture"),
  past: [],
  future: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  clipboard: null,
  provider: "aws",

  setProvider: (provider) => set({ provider }),

  loadGraph: (graph) => set({ graph, past: [], future: [], selectedNodeIds: [], selectedEdgeIds: [] }),

  resetGraph: (name = "Untitled Architecture") =>
    set({ graph: createEmptyGraph(makeId("arch"), name), past: [], future: [], selectedNodeIds: [], selectedEdgeIds: [] }),

  addResource: (kind, position, parentId) => {
    const entry = getCatalogEntry(kind);
    const id = makeId("res");
    const fields: Record<string, string | number | boolean> = {};
    for (const field of entry.defaultFields ?? []) {
      if (field.default !== undefined) fields[field.key] = field.default;
    }
    set((state) => ({
      ...pushHistory(state),
      graph: addNode(
        state.graph,
        { id, kind, name: entry.label, position, parentId, fields },
        makeId,
      ),
    }));
    return id;
  },

  removeNodes: (nodeIds) => {
    set((state) => {
      let graph = state.graph;
      for (const id of nodeIds) graph = removeNode(graph, id);
      return {
        ...pushHistory(state),
        graph,
        selectedNodeIds: state.selectedNodeIds.filter((id) => !nodeIds.includes(id)),
      };
    });
  },

  updateNodeFields: (nodeId, fields) => {
    set((state) => {
      const existing = state.graph.nodes.find((n) => n.id === nodeId);
      if (!existing) return state;
      return {
        ...pushHistory(state),
        graph: updateNode(state.graph, nodeId, { fields: { ...existing.fields, ...fields } }),
      };
    });
  },

  renameNode: (nodeId, name) => {
    set((state) => ({ ...pushHistory(state), graph: updateNode(state.graph, nodeId, { name }) }));
  },

  moveNode: (nodeId, position) => {
    // Position updates are frequent (drag) and intentionally excluded from undo history.
    set((state) => ({ graph: updateNode(state.graph, nodeId, { position }) }));
  },

  reparent: (nodeId, parentId) => {
    set((state) => ({ ...pushHistory(state), graph: reparentNode(state.graph, nodeId, parentId) }));
  },

  connect: (source, target, kind) => {
    if (source === target) return;
    set((state) => ({
      ...pushHistory(state),
      graph: addEdge(state.graph, { source, target, kind }, makeId),
    }));
  },

  disconnect: (edgeIds) => {
    set((state) => {
      let graph = state.graph;
      for (const id of edgeIds) graph = removeEdge(graph, id);
      return { ...pushHistory(state), graph, selectedEdgeIds: state.selectedEdgeIds.filter((id) => !edgeIds.includes(id)) };
    });
  },

  select: (nodeIds, edgeIds = []) => set({ selectedNodeIds: nodeIds, selectedEdgeIds: edgeIds }),

  toggleSelect: (nodeId) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.includes(nodeId)
        ? state.selectedNodeIds.filter((id) => id !== nodeId)
        : [...state.selectedNodeIds, nodeId],
    })),

  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  duplicateSelected: () => {
    const { selectedNodeIds } = get();
    if (selectedNodeIds.length === 0) return;
    set((state) => {
      let graph = state.graph;
      const newIds: string[] = [];
      for (const id of selectedNodeIds) {
        const result = duplicateSubtree(graph, id, makeId);
        graph = result.graph;
        newIds.push(result.newRootId);
      }
      return { ...pushHistory(state), graph, selectedNodeIds: newIds };
    });
  },

  copySelected: () => {
    const { graph, selectedNodeIds, selectedEdgeIds } = get();
    if (selectedNodeIds.length === 0) return;
    const nodes = graph.nodes.filter((n) => selectedNodeIds.includes(n.id));
    const edges = graph.edges.filter((e) => selectedEdgeIds.includes(e.id));
    set({ clipboard: { nodes, edges } });
  },

  paste: (position) => {
    const { clipboard } = get();
    if (!clipboard || clipboard.nodes.length === 0) return;
    set((state) => {
      const idMap = new Map<string, string>();
      clipboard.nodes.forEach((n) => idMap.set(n.id, makeId("res")));
      const anchor = clipboard.nodes[0]!.position;
      const pastedNodes: ArchitectureNode[] = clipboard.nodes.map((n) => ({
        ...n,
        id: idMap.get(n.id)!,
        position: { x: position.x + (n.position.x - anchor.x), y: position.y + (n.position.y - anchor.y) },
        parentId: n.parentId && idMap.has(n.parentId) ? idMap.get(n.parentId) : undefined,
      }));
      const pastedEdges: ArchitectureEdge[] = clipboard.edges
        .filter((e) => idMap.has(e.source) && idMap.has(e.target))
        .map((e) => ({ ...e, id: makeId(), source: idMap.get(e.source)!, target: idMap.get(e.target)! }));
      return {
        ...pushHistory(state),
        graph: {
          ...state.graph,
          nodes: [...state.graph.nodes, ...pastedNodes],
          edges: [...state.graph.edges, ...pastedEdges],
          updatedAt: new Date().toISOString(),
        },
        selectedNodeIds: pastedNodes.map((n) => n.id),
      };
    });
  },

  deleteSelected: () => {
    const { selectedNodeIds, selectedEdgeIds } = get();
    if (selectedNodeIds.length > 0) get().removeNodes(selectedNodeIds);
    if (selectedEdgeIds.length > 0) get().disconnect(selectedEdgeIds);
  },

  undo: () => {
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return { graph: previous, past: state.past.slice(0, -1), future: [state.graph, ...state.future].slice(0, MAX_HISTORY) };
    });
  },

  redo: () => {
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return { graph: next, future: state.future.slice(1), past: [...state.past, state.graph].slice(-MAX_HISTORY) };
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
