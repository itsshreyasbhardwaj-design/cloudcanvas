import type { ResourceCatalogEntry } from "../types";

export const storageCatalog: ResourceCatalogEntry[] = [
  {
    kind: "storage.object",
    category: "storage",
    label: "Object Storage",
    description: "Bucket-based object storage (S3, Cloud Storage, Blob Storage).",
    icon: "Package",
    defaultFields: [
      { key: "publicAccess", label: "Public access", type: "boolean", default: false },
      { key: "versioning", label: "Versioning enabled", type: "boolean", default: true },
      { key: "encrypted", label: "Encryption at rest", type: "boolean", default: true },
    ],
  },
  {
    kind: "storage.block",
    category: "storage",
    label: "Block Storage",
    description: "Attached block volumes (EBS, Persistent Disk, Managed Disk).",
    icon: "HardDrive",
    defaultFields: [
      { key: "sizeGb", label: "Size (GB)", type: "number", default: 100 },
      { key: "encrypted", label: "Encryption at rest", type: "boolean", default: true },
    ],
  },
  {
    kind: "storage.file",
    category: "storage",
    label: "File Storage",
    description: "Managed shared file system (EFS, Filestore, Azure Files).",
    icon: "FolderOpen",
    defaultFields: [{ key: "throughputMode", label: "Throughput mode", type: "select", default: "bursting", options: [
      { value: "bursting", label: "Bursting" },
      { value: "provisioned", label: "Provisioned" },
    ] }],
  },
];
