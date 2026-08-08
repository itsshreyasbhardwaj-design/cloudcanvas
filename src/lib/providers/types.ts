import type { ArchitectureGraph, ArchitectureNode } from "../graph/types";
import type { ResourceFieldSchema, ResourceKind } from "../resource-model/types";

export type CloudProviderId = "aws" | "gcp" | "azure";

export interface ProviderRegion {
  id: string;
  label: string;
}

/** How a generic ResourceKind maps onto one provider's concrete implementation. */
export interface ProviderResourceMapping {
  kind: ResourceKind;
  /** Provider-native type identifier, e.g. "aws.ec2.instance". Used for display only. */
  nativeType: string;
  nativeLabel: string;
  terraformType?: string;
  pulumiType?: string;
  fields?: ResourceFieldSchema[];
}

/**
 * Identifies a cloud vendor and exposes its resource mappings and regions.
 * The rest of the app never branches on `provider.id` — it asks the
 * provider for what it needs (a mapping, a region list) instead.
 */
export interface CloudProvider {
  id: CloudProviderId;
  label: string;
  regions: ProviderRegion[];
  getMapping(kind: ResourceKind): ProviderResourceMapping | undefined;
  listMappings(): ProviderResourceMapping[];
}

/** Resolves and validates resource configuration against a provider's concrete constraints. */
export interface ResourceProvider {
  providerId: CloudProviderId;
  resolveFields(kind: ResourceKind, fields: Record<string, unknown>): Record<string, unknown>;
}

export interface CostAssumption {
  label: string;
}

export interface CostLineItem {
  nodeId: string;
  kind: ResourceKind;
  label: string;
  monthlyUsd: number;
  assumptions: string[];
}

export interface CostEstimate {
  providerId: CloudProviderId;
  currency: "USD";
  monthlyTotal: number;
  annualTotal: number;
  lineItems: CostLineItem[];
  generatedAt: string;
  /** Always populated — cost figures are estimates, never presented as an exact bill. */
  disclaimer: string;
}

export interface CostProvider {
  providerId: CloudProviderId;
  estimate(nodes: ArchitectureNode[]): CostEstimate;
}

export type DeploymentStage = "validate" | "plan" | "approve" | "apply";

export interface DeploymentPlanChange {
  nodeId: string;
  action: "create" | "update" | "delete" | "replace";
  summary: string;
}

export interface DeploymentPlan {
  providerId: CloudProviderId;
  changes: DeploymentPlanChange[];
  generatedAt: string;
}

export interface DeploymentResult {
  success: boolean;
  appliedAt: string;
  changes: DeploymentPlanChange[];
  logs: string[];
}

/**
 * Deployment is intentionally a plan/apply split with no default
 * "apply" implementation wired up anywhere in Phase 1 — safe-deployment
 * is a later phase, and this interface exists now so nothing upstream
 * has to change shape when it's implemented.
 */
export interface DeploymentProvider {
  providerId: CloudProviderId;
  plan(graph: ArchitectureGraph): DeploymentPlan;
  apply(plan: DeploymentPlan): Promise<DeploymentResult>;
}

export type PolicySeverity = "error" | "warning" | "info";

export interface PolicyViolation {
  policyId: string;
  severity: PolicySeverity;
  message: string;
  nodeIds: string[];
}

export interface Policy {
  id: string;
  label: string;
  description: string;
  severity: PolicySeverity;
  evaluate(graph: ArchitectureGraph): PolicyViolation[];
}

export interface PolicyProvider {
  listPolicies(): Policy[];
  evaluate(graph: ArchitectureGraph): PolicyViolation[];
}
