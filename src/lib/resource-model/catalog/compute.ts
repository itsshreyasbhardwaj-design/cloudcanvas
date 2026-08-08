import type { ResourceCatalogEntry } from "../types";

export const computeCatalog: ResourceCatalogEntry[] = [
  {
    kind: "compute.vm",
    category: "compute",
    label: "Virtual Machine",
    description: "General-purpose virtual server (EC2, Compute Engine, VM).",
    icon: "Server",
    defaultFields: [
      { key: "instanceSize", label: "Instance size", type: "select", required: true, default: "medium", options: [
        { value: "small", label: "Small (2 vCPU / 4GB)" },
        { value: "medium", label: "Medium (4 vCPU / 16GB)" },
        { value: "large", label: "Large (8 vCPU / 32GB)" },
        { value: "xlarge", label: "X-Large (16 vCPU / 64GB)" },
      ] },
      { key: "count", label: "Instance count", type: "number", default: 1, required: true },
    ],
    commonlyConnectsTo: ["networking.load-balancer", "networking.subnet", "database.postgresql"],
  },
  {
    kind: "compute.container",
    category: "compute",
    label: "Container",
    description: "Managed container service (ECS, Cloud Run, Container Instances).",
    icon: "Box",
    defaultFields: [
      { key: "cpu", label: "vCPU", type: "number", default: 1 },
      { key: "memoryGb", label: "Memory (GB)", type: "number", default: 2 },
      { key: "minInstances", label: "Min instances", type: "number", default: 1 },
      { key: "maxInstances", label: "Max instances", type: "number", default: 3 },
    ],
    commonlyConnectsTo: ["networking.load-balancer", "database.postgresql", "messaging.queue"],
  },
  {
    kind: "compute.kubernetes",
    category: "compute",
    label: "Kubernetes Cluster",
    description: "Managed Kubernetes (EKS, GKE, AKS).",
    icon: "Ship",
    defaultFields: [
      { key: "nodeCount", label: "Node count", type: "number", default: 3 },
      { key: "nodeSize", label: "Node size", type: "select", default: "medium", options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ] },
    ],
    commonlyConnectsTo: ["networking.load-balancer", "networking.vpc", "observability.monitoring"],
  },
  {
    kind: "compute.serverless-function",
    category: "compute",
    label: "Serverless Function",
    description: "Function-as-a-service (Lambda, Cloud Functions, Azure Functions).",
    icon: "Zap",
    defaultFields: [
      { key: "memoryMb", label: "Memory (MB)", type: "number", default: 512 },
      { key: "timeoutSec", label: "Timeout (sec)", type: "number", default: 30 },
    ],
    commonlyConnectsTo: ["messaging.event-bus", "database.nosql", "storage.object"],
  },
];
