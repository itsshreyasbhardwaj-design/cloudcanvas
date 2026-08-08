import type { CloudProvider } from "../types";
import { AWS_MAPPINGS } from "./mappings";

export const awsProvider: CloudProvider = {
  id: "aws",
  label: "Amazon Web Services",
  regions: [
    { id: "us-east-1", label: "US East (N. Virginia)" },
    { id: "us-west-2", label: "US West (Oregon)" },
    { id: "eu-west-1", label: "EU (Ireland)" },
    { id: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  ],
  getMapping: (kind) => AWS_MAPPINGS.find((m) => m.kind === kind),
  listMappings: () => AWS_MAPPINGS,
};
