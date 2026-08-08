import type { ArchitectureGraph } from "../../graph/types";
import type { Policy } from "../types";

const DATABASE_KINDS = new Set(["database.postgresql", "database.mysql", "database.redis", "database.nosql"]);
const STORAGE_KINDS = new Set(["storage.object", "storage.block", "storage.file"]);

export const noPublicDatabasesPolicy: Policy = {
  id: "no-public-databases",
  label: "Databases must not be publicly accessible",
  description: "Flags any database resource with publiclyAccessible set to true.",
  severity: "error",
  evaluate(graph: ArchitectureGraph) {
    return graph.nodes
      .filter((n) => DATABASE_KINDS.has(n.kind) && n.fields.publiclyAccessible === true)
      .map((n) => ({
        policyId: "no-public-databases",
        severity: "error" as const,
        message: `"${n.name}" is a database marked as publicly accessible.`,
        nodeIds: [n.id],
      }));
  },
};

export const storageMustBeEncryptedPolicy: Policy = {
  id: "storage-must-be-encrypted",
  label: "All storage must use encryption",
  description: "Flags storage resources with encryption explicitly disabled.",
  severity: "error",
  evaluate(graph: ArchitectureGraph) {
    return graph.nodes
      .filter((n) => STORAGE_KINDS.has(n.kind) && n.fields.encrypted === false)
      .map((n) => ({
        policyId: "storage-must-be-encrypted",
        severity: "error" as const,
        message: `"${n.name}" does not have encryption at rest enabled.`,
        nodeIds: [n.id],
      }));
  },
};

export const productionRequiresMonitoringPolicy: Policy = {
  id: "production-requires-monitoring",
  label: "Production resources require monitoring",
  description: "Flags production-environment nodes that have no observability resource connected anywhere in the architecture.",
  severity: "warning",
  evaluate(graph: ArchitectureGraph) {
    const hasAnyMonitoring = graph.nodes.some((n) => n.kind === "observability.monitoring" || n.kind === "observability.metrics");
    if (hasAnyMonitoring) return [];
    const productionNodes = graph.nodes.filter((n) => n.environment === "production");
    if (productionNodes.length === 0) return [];
    return [
      {
        policyId: "production-requires-monitoring",
        severity: "warning" as const,
        message: `This architecture has ${productionNodes.length} production resource(s) but no monitoring or metrics resource anywhere.`,
        nodeIds: productionNodes.map((n) => n.id),
      },
    ];
  },
};

export const productionRequiresRedundancyPolicy: Policy = {
  id: "production-requires-redundancy",
  label: "Production workloads must have redundancy",
  description: "Flags production databases without a multi-AZ replica and production compute with only a single instance.",
  severity: "warning",
  evaluate(graph: ArchitectureGraph) {
    const violations = [];
    for (const n of graph.nodes) {
      if (n.environment !== "production") continue;
      if (DATABASE_KINDS.has(n.kind) && n.fields.multiAz !== true) {
        violations.push({
          policyId: "production-requires-redundancy",
          severity: "warning" as const,
          message: `Production database "${n.name}" has no multi-AZ replica configured.`,
          nodeIds: [n.id],
        });
      }
      if (n.kind === "compute.vm" && (typeof n.fields.count !== "number" || n.fields.count < 2)) {
        violations.push({
          policyId: "production-requires-redundancy",
          severity: "warning" as const,
          message: `Production compute "${n.name}" runs a single instance with no redundancy.`,
          nodeIds: [n.id],
        });
      }
    }
    return violations;
  },
};

export const DEFAULT_POLICIES: Policy[] = [
  noPublicDatabasesPolicy,
  storageMustBeEncryptedPolicy,
  productionRequiresMonitoringPolicy,
  productionRequiresRedundancyPolicy,
];
