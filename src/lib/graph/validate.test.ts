import { describe, expect, it } from "vitest";
import { createEmptyGraph } from "./types";
import { addNode, addEdge } from "./operations";
import { validateArchitecture } from "./validate";

let counter = 0;
const makeId = () => `id_${counter++}`;

describe("validateArchitecture", () => {
  it("flags a self-loop edge as an error", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "a", kind: "compute.vm", name: "A", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addEdge(graph, { id: "e1", source: "a", target: "a", kind: "network" }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "self-loop" && i.severity === "error")).toBe(true);
  });

  it("flags an edge to a missing node as dangling", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "a", kind: "compute.vm", name: "A", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addEdge(graph, { id: "e1", source: "a", target: "ghost", kind: "network" }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "dangling-edge")).toBe(true);
  });

  it("warns when compute isn't placed inside a subnet", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "a", kind: "compute.vm", name: "A", position: { x: 0, y: 0 }, fields: {} }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "missing-networking")).toBe(true);
  });

  it("does not warn about networking once compute is nested inside a subnet inside a vpc", () => {
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
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "missing-networking")).toBe(false);
    expect(issues.some((i) => i.code === "subnet-without-vpc")).toBe(false);
  });

  it("errors on a subnet with no parent vpc", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "subnet", kind: "networking.subnet", name: "Subnet", position: { x: 0, y: 0 }, fields: {} }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "subnet-without-vpc" && i.severity === "error")).toBe(true);
  });

  it("errors on a publicly accessible database with no firewall attached", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      {
        id: "db",
        kind: "database.postgresql",
        name: "DB",
        position: { x: 0, y: 0 },
        fields: { publiclyAccessible: true },
      },
      makeId,
    );
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "public-database-no-firewall" && i.severity === "error")).toBe(true);
  });

  it("does not error on a publicly accessible database with a firewall attached", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      { id: "db", kind: "database.postgresql", name: "DB", position: { x: 0, y: 0 }, fields: { publiclyAccessible: true } },
      makeId,
    );
    graph = addNode(graph, { id: "fw", kind: "networking.firewall", name: "FW", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addEdge(graph, { id: "e1", source: "fw", target: "db", kind: "network" }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "public-database-no-firewall")).toBe(false);
  });

  it("warns on a load balancer with no routing targets", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "lb", kind: "networking.load-balancer", name: "LB", position: { x: 0, y: 0 }, fields: {} }, makeId);
    const issues = validateArchitecture(graph);
    expect(issues.some((i) => i.code === "orphaned-load-balancer")).toBe(true);
  });

  it("returns no issues for a clean, fully wired architecture", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(
      graph,
      { id: "subnet", kind: "networking.subnet", name: "Subnet", position: { x: 0, y: 0 }, fields: { isPublic: false }, parentId: "vpc" },
      makeId,
    );
    graph = addNode(graph, { id: "nat", kind: "networking.nat-gateway", name: "NAT", position: { x: 0, y: 0 }, fields: {} }, makeId);
    graph = addNode(
      graph,
      { id: "lb", kind: "networking.load-balancer", name: "LB", position: { x: 0, y: 0 }, fields: {} },
      makeId,
    );
    graph = addNode(
      graph,
      { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: {}, parentId: "subnet" },
      makeId,
    );
    graph = addEdge(graph, { id: "e1", source: "lb", target: "vm", kind: "routes-to" }, makeId);

    const issues = validateArchitecture(graph);
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });
});
