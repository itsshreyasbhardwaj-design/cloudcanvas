import type { CloudProvider } from "../types";
import { AZURE_MAPPINGS } from "./mappings";

export const azureProvider: CloudProvider = {
  id: "azure",
  label: "Microsoft Azure",
  regions: [
    { id: "eastus", label: "East US" },
    { id: "westus2", label: "West US 2" },
    { id: "westeurope", label: "West Europe" },
    { id: "southeastasia", label: "Southeast Asia" },
  ],
  getMapping: (kind) => AZURE_MAPPINGS.find((m) => m.kind === kind),
  listMappings: () => AZURE_MAPPINGS,
};
