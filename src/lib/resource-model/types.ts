/**
 * Canonical resource taxonomy. Every provider adapter maps its own
 * provider-specific resource types onto this fixed set of kinds, and
 * everything else in the app (graph, validation, policy, canvas UI)
 * only ever speaks in terms of `ResourceKind` — never a provider's
 * native type name. This is what keeps provider logic out of the core.
 */
export type ResourceCategory =
  | "compute"
  | "networking"
  | "database"
  | "storage"
  | "security"
  | "observability"
  | "messaging"
  | "ai";

export type ResourceKind =
  // compute
  | "compute.vm"
  | "compute.container"
  | "compute.kubernetes"
  | "compute.serverless-function"
  // networking
  | "networking.vpc"
  | "networking.subnet"
  | "networking.load-balancer"
  | "networking.nat-gateway"
  | "networking.internet-gateway"
  | "networking.firewall"
  | "networking.dns"
  | "networking.availability-zone"
  | "networking.region"
  // database
  | "database.postgresql"
  | "database.mysql"
  | "database.redis"
  | "database.nosql"
  | "database.data-warehouse"
  // storage
  | "storage.object"
  | "storage.block"
  | "storage.file"
  // security
  | "security.iam"
  | "security.kms"
  | "security.secrets-manager"
  | "security.security-group"
  // observability
  | "observability.logging"
  | "observability.metrics"
  | "observability.tracing"
  | "observability.monitoring"
  // messaging
  | "messaging.queue"
  | "messaging.pubsub"
  | "messaging.event-bus"
  | "messaging.stream"
  // ai
  | "ai.model-endpoint"
  | "ai.vector-database"
  | "ai.gpu-instance"
  | "ai.model-gateway"
  // structural (annotations, not deployable resources)
  | "structural.annotation"
  | "structural.label";

export interface ResourceFieldSchema {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  options?: { value: string; label: string }[];
  default?: string | number | boolean;
  required?: boolean;
  helpText?: string;
}

/**
 * A generic, provider-agnostic catalog entry. This is what populates
 * the resource library UI. Each entry may resolve to a different
 * provider-specific definition depending on which CloudProvider is
 * active for the architecture (or a given node).
 */
export interface ResourceCatalogEntry {
  kind: ResourceKind;
  category: ResourceCategory;
  label: string;
  description: string;
  icon: string; // lucide-react icon name
  defaultFields?: ResourceFieldSchema[];
  /** Kinds this resource is commonly connected to — used by validation hints. */
  commonlyConnectsTo?: ResourceKind[];
  /** Structural container kinds (vpc, subnet, region, az) render differently on canvas. */
  isContainer?: boolean;
}

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  compute: "Compute",
  networking: "Networking",
  database: "Database",
  storage: "Storage",
  security: "Security",
  observability: "Observability",
  messaging: "Messaging",
  ai: "AI",
};
