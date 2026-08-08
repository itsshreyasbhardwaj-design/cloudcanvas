import type { ResourceCatalogEntry } from "../types";

export const securityCatalog: ResourceCatalogEntry[] = [
  {
    kind: "security.iam",
    category: "security",
    label: "IAM Role / Policy",
    description: "Identity and access management role or policy.",
    icon: "UserCog",
    defaultFields: [{ key: "leastPrivilege", label: "Scoped to least privilege", type: "boolean", default: true }],
  },
  {
    kind: "security.kms",
    category: "security",
    label: "KMS Key",
    description: "Managed encryption key.",
    icon: "KeyRound",
    defaultFields: [{ key: "rotationEnabled", label: "Automatic rotation", type: "boolean", default: true }],
  },
  {
    kind: "security.secrets-manager",
    category: "security",
    label: "Secrets Manager",
    description: "Managed secret storage and rotation.",
    icon: "Lock",
  },
  {
    kind: "security.security-group",
    category: "security",
    label: "Security Group",
    description: "Instance-level network access control.",
    icon: "Shield",
    defaultFields: [{ key: "allowAllInbound", label: "Allow all inbound (0.0.0.0/0)", type: "boolean", default: false }],
  },
];
