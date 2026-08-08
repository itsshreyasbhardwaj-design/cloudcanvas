import { describe, expect, it } from "vitest";
import { createEmptyGraph, getChildren, getNode } from "./types";
import { addNode, addEdge, removeNode, removeEdge, duplicateSubtree, updateNode, findContainerAt, reparentNode } from "./operations";

let counter = 0;
const makeId = () => `id_${counter++}`;

describe("graph operations", () => {
  it("adds and reads back a node", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { kind: "compute.vm", name: "Web Server", position: { x: 0, y: 0 }, fields: {} }, makeId);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0]?.name).toBe("Web Server");
  });

  it("cascades node removal to children and touching edges", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(
      graph,
      { id: "subnet", kind: "networking.subnet", name: "Subnet", position: { x: 0, y: 0 }, fields: {}, parentId: "vpc" },
      makeId,
    );
    graph = addNode(
      graph,
      { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: {}, parentId: "subnet" },
      makeId,
    );
    graph = addNode(graph, { id: "db", kind: "database.postgresql", name: "DB", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addEdge(graph, { id: "e1", source: "vm", target: "db", kind: "network" }, makeId);

    graph = removeNode(graph, "vpc");

    expect(getNode(graph, "vpc")).toBeUndefined();
    expect(getNode(graph, "subnet")).toBeUndefined();
    expect(getNode(graph, "vm")).toBeUndefined();
    expect(getNode(graph, "db")).toBeDefined();
    expect(graph.edges).toHaveLength(0);
  });

  it("duplicates a subtree with fresh ids and preserves internal edges", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(
      graph,
      { id: "vm1", kind: "compute.vm", name: "VM1", position: { x: 10, y: 10 }, fields: {}, parentId: "vpc" },
      makeId,
    );
    graph = addNode(
      graph,
      { id: "vm2", kind: "compute.vm", name: "VM2", position: { x: 20, y: 20 }, fields: {}, parentId: "vpc" },
      makeId,
    );
    graph = addEdge(graph, { id: "e1", source: "vm1", target: "vm2", kind: "network" }, makeId);

    const { graph: nextGraph, newRootId } = duplicateSubtree(graph, "vpc", makeId);

    expect(newRootId).not.toBe("vpc");
    const clonedChildren = getChildren(nextGraph, newRootId);
    expect(clonedChildren).toHaveLength(2);
    // the edge between vm1 and vm2 should be recreated between their clones
    const clonedIds = new Set(clonedChildren.map((n) => n.id));
    const clonedEdge = nextGraph.edges.find((e) => clonedIds.has(e.source) && clonedIds.has(e.target));
    expect(clonedEdge).toBeDefined();
  });

  it("removes an edge without touching nodes", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "a", kind: "compute.vm", name: "A", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(graph, { id: "b", kind: "compute.vm", name: "B", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addEdge(graph, { id: "e1", source: "a", target: "b", kind: "network" }, makeId);
    graph = removeEdge(graph, "e1");
    expect(graph.edges).toHaveLength(0);
    expect(graph.nodes).toHaveLength(2);
  });

  it("updateNode patches fields without mutating the original graph", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "a", kind: "compute.vm", name: "A", position: { x: 0, y: 0 }, fields: {} }, makeId);
    const next = updateNode(graph, "a", { name: "Renamed" });
    expect(getNode(graph, "a")?.name).toBe("A");
    expect(getNode(next, "a")?.name).toBe("Renamed");
  });

  it("reparentNode sets a node's parentId", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(graph, { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = reparentNode(graph, "vm", "vpc");
    expect(getNode(graph, "vm")?.parentId).toBe("vpc");
  });
});

describe("findContainerAt", () => {
  it("returns undefined for a point outside every container", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    expect(findContainerAt(graph, { x: 9999, y: 9999 })).toBeUndefined();
  });

  it("returns the containing VPC for a point inside its default bounds", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    // default VPC size is 600x400
    expect(findContainerAt(graph, { x: 50, y: 50 })).toBe("vpc");
  });

  it("prefers the deepest nested container when a point falls inside both a vpc and a subnet within it", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(
      graph,
      { id: "subnet", kind: "networking.subnet", name: "Subnet", position: { x: 20, y: 20 }, fields: {}, parentId: "vpc" },
      makeId,
    );
    // subnet's absolute position is (20,20), default subnet size 360x240, so (50,50) is inside both
    expect(findContainerAt(graph, { x: 50, y: 50 })).toBe("subnet");
    // (500,50) is inside the VPC (600x400) but outside the subnet's 360-wide box starting at x=20
    expect(findContainerAt(graph, { x: 500, y: 50 })).toBe("vpc");
  });
});
