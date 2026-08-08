import type { ResourceCatalogEntry } from "../types";

export const databaseCatalog: ResourceCatalogEntry[] = [
  {
    kind: "database.postgresql",
    category: "database",
    label: "PostgreSQL",
    description: "Managed relational database (RDS, Cloud SQL, Azure Database).",
    icon: "Database",
    defaultFields: [
      { key: "tier", label: "Tier", type: "select", default: "standard", options: [
        { value: "burstable", label: "Burstable (dev/test)" },
        { value: "standard", label: "Standard" },
        { value: "high-memory", label: "High memory" },
      ] },
      { key: "storageGb", label: "Storage (GB)", type: "number", default: 50 },
      { key: "multiAz", label: "Multi-AZ replica", type: "boolean", default: false },
      { key: "publiclyAccessible", label: "Publicly accessible", type: "boolean", default: false },
    ],
  },
  {
    kind: "database.mysql",
    category: "database",
    label: "MySQL",
    description: "Managed MySQL-compatible relational database.",
    icon: "Database",
    defaultFields: [
      { key: "storageGb", label: "Storage (GB)", type: "number", default: 50 },
      { key: "multiAz", label: "Multi-AZ replica", type: "boolean", default: false },
      { key: "publiclyAccessible", label: "Publicly accessible", type: "boolean", default: false },
    ],
  },
  {
    kind: "database.redis",
    category: "database",
    label: "Redis",
    description: "In-memory cache / data store.",
    icon: "Zap",
    defaultFields: [
      { key: "nodeType", label: "Node type", type: "select", default: "small", options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
      ] },
      { key: "clusterMode", label: "Cluster mode", type: "boolean", default: false },
    ],
  },
  {
    kind: "database.nosql",
    category: "database",
    label: "NoSQL Database",
    description: "Managed document/key-value store (DynamoDB, Firestore, Cosmos DB).",
    icon: "Layers",
    defaultFields: [{ key: "billingMode", label: "Billing mode", type: "select", default: "on-demand", options: [
      { value: "on-demand", label: "On-demand" },
      { value: "provisioned", label: "Provisioned" },
    ] }],
  },
  {
    kind: "database.data-warehouse",
    category: "database",
    label: "Data Warehouse",
    description: "Analytical warehouse (Redshift, BigQuery, Synapse).",
    icon: "Warehouse",
    defaultFields: [{ key: "storageTb", label: "Storage (TB)", type: "number", default: 1 }],
  },
];
