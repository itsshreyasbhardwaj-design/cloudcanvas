import type { ResourceCatalogEntry } from "../types";

export const aiCatalog: ResourceCatalogEntry[] = [
  {
    kind: "ai.model-endpoint",
    category: "ai",
    label: "Model Endpoint",
    description: "Hosted inference endpoint for a trained model.",
    icon: "BrainCircuit",
  },
  {
    kind: "ai.vector-database",
    category: "ai",
    label: "Vector Database",
    description: "Similarity-search optimized data store for embeddings.",
    icon: "Orbit",
  },
  {
    kind: "ai.gpu-instance",
    category: "ai",
    label: "GPU Instance",
    description: "GPU-accelerated compute for training or inference.",
    icon: "Cpu",
  },
  {
    kind: "ai.model-gateway",
    category: "ai",
    label: "Model Gateway",
    description: "Routes and rate-limits requests across model providers.",
    icon: "Router",
  },
];
