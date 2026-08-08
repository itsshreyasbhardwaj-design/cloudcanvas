import { describe, expect, it } from "vitest";
import { getCloudProvider, listCloudProviders, getCostProvider, getPolicyProvider } from "./registry";
import { RESOURCE_CATALOG } from "../resource-model";
import { createEmptyGraph } from "../graph/types";
import { addNode } from "../graph/operations";

let counter = 0;
const makeId = () => `id_${counter++}`;

describe("provider registry", () => {
  it("exposes exactly aws, gcp, and azure", () => {
    const ids = listCloudProviders()
      .map((p) => p.id)
      .sort();
    expect(ids).toEqual(["aws", "azure", "gcp"]);
  });

  it("every non-structural catalog resource kind has a mapping on every provider", () => {
    const deployableKinds = RESOURCE_CATALOG.filter((e) => !e.isContainer).map((e) => e.kind);
    for (const providerId of ["aws", "gcp", "azure"] as const) {
      const provider = getCloudProvider(providerId);
      for (const kind of deployableKinds) {
        expect(provider.getMapping(kind), `${providerId} is missing a mapping for ${kind}`).toBeDefined();
      }
    }
  });

  it("cost estimates always carry a disclaimer and a non-negative total", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: { count: 3 } }, makeId);
    const estimate = getCostProvider("aws").estimate(graph.nodes);
    expect(estimate.disclaimer.length).toBeGreaterThan(0);
    expect(estimate.monthlyTotal).toBeGreaterThan(0);
    expect(estimate.annualTotal).toBeCloseTo(estimate.monthlyTotal * 12, 2);
    expect(estimate.lineItems[0]?.assumptions.some((a) => a.includes("count = 3"))).toBe(true);
  });

  it("skips structural (containerless-cost) resources in cost line items", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(graph, { id: "vpc", kind: "networking.vpc", name: "VPC", position: { x: 0, y: 0 }, fields: {} }, makeId);
    const estimate = getCostProvider("aws").estimate(graph.nodes);
    expect(estimate.lineItems).toHaveLength(0);
    expect(estimate.monthlyTotal).toBe(0);
  });

  it("policy provider flags a publicly accessible database", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      { id: "db", kind: "database.postgresql", name: "DB", position: { x: 0, y: 0 }, fields: { publiclyAccessible: true } },
      makeId,
    );
    const violations = getPolicyProvider().evaluate(graph);
    expect(violations.some((v) => v.policyId === "no-public-databases")).toBe(true);
  });

  it("policy provider flags unencrypted storage", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      { id: "bucket", kind: "storage.object", name: "Bucket", position: { x: 0, y: 0 }, fields: { encrypted: false } },
      makeId,
    );
    const violations = getPolicyProvider().evaluate(graph);
    expect(violations.some((v) => v.policyId === "storage-must-be-encrypted")).toBe(true);
  });

  it("policy provider requires monitoring for production workloads", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: {}, environment: "production" },
      makeId,
    );
    const violations = getPolicyProvider().evaluate(graph);
    expect(violations.some((v) => v.policyId === "production-requires-monitoring")).toBe(true);
  });

  it("does not flag production monitoring once a monitoring resource exists", () => {
    let graph = createEmptyGraph("g1", "Test");
    graph = addNode(
      graph,
      { id: "vm", kind: "compute.vm", name: "VM", position: { x: 0, y: 0 }, fields: { count: 2 }, environment: "production" },
      makeId,
    );
    graph = addNode(
      graph,
      { id: "mon", kind: "observability.monitoring", name: "Monitoring", position: { x: 0, y: 0 }, fields: {} },
      makeId,
    );
    const violations = getPolicyProvider().evaluate(graph);
    expect(violations.some((v) => v.policyId === "production-requires-monitoring")).toBe(false);
  });
});
