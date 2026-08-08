import type { CloudProvider } from "../types";
import { GCP_MAPPINGS } from "./mappings";

export const gcpProvider: CloudProvider = {
  id: "gcp",
  label: "Google Cloud",
  regions: [
    { id: "us-central1", label: "Iowa (us-central1)" },
    { id: "us-west1", label: "Oregon (us-west1)" },
    { id: "europe-west1", label: "Belgium (europe-west1)" },
    { id: "asia-southeast1", label: "Singapore (asia-southeast1)" },
  ],
  getMapping: (kind) => GCP_MAPPINGS.find((m) => m.kind === kind),
  listMappings: () => GCP_MAPPINGS,
};
