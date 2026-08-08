import type { ResourceCatalogEntry } from "../types";

export const observabilityCatalog: ResourceCatalogEntry[] = [
  {
    kind: "observability.logging",
    category: "observability",
    label: "Log Aggregator",
    description: "Centralized log collection (CloudWatch Logs, Cloud Logging).",
    icon: "ScrollText",
  },
  {
    kind: "observability.metrics",
    category: "observability",
    label: "Metrics",
    description: "Time-series metrics collection.",
    icon: "LineChart",
  },
  {
    kind: "observability.tracing",
    category: "observability",
    label: "Distributed Tracing",
    description: "Request tracing across services.",
    icon: "GitBranch",
  },
  {
    kind: "observability.monitoring",
    category: "observability",
    label: "Monitoring / Alerting",
    description: "Dashboards and alert rules.",
    icon: "ActivitySquare",
  },
];
