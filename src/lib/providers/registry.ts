import type { CloudProvider, CloudProviderId, CostProvider, PolicyProvider } from "./types";
import { awsProvider } from "./aws";
import { gcpProvider } from "./gcp";
import { azureProvider } from "./azure";
import { createStaticCostProvider } from "./cost";
import { createPolicyProvider } from "./policy";

const CLOUD_PROVIDERS: Record<CloudProviderId, CloudProvider> = {
  aws: awsProvider,
  gcp: gcpProvider,
  azure: azureProvider,
};

const COST_PROVIDERS: Record<CloudProviderId, CostProvider> = {
  aws: createStaticCostProvider("aws"),
  gcp: createStaticCostProvider("gcp"),
  azure: createStaticCostProvider("azure"),
};

const sharedPolicyProvider: PolicyProvider = createPolicyProvider();

export function getCloudProvider(id: CloudProviderId): CloudProvider {
  return CLOUD_PROVIDERS[id];
}

export function listCloudProviders(): CloudProvider[] {
  return Object.values(CLOUD_PROVIDERS);
}

export function getCostProvider(id: CloudProviderId): CostProvider {
  return COST_PROVIDERS[id];
}

export function getPolicyProvider(): PolicyProvider {
  return sharedPolicyProvider;
}
