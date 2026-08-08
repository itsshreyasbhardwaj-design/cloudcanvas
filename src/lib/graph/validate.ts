import type { ArchitectureGraph } from "./types";
import type { ValidationIssue, ValidationRule } from "./validation-types";
import { danglingEdgeRule, selfLoopRule, duplicateEdgeRule, containmentCycleRule } from "./rules/connectivity";
import { missingNetworkingRule, subnetWithoutVpcRule, missingGatewayRule } from "./rules/networking";
import { orphanedLoadBalancerRule, orphanedMessagingRule, publicDatabaseWithoutFirewallRule } from "./rules/dependencies";

export * from "./validation-types";

const DEFAULT_RULES: ValidationRule[] = [
  danglingEdgeRule,
  selfLoopRule,
  duplicateEdgeRule,
  containmentCycleRule,
  missingNetworkingRule,
  subnetWithoutVpcRule,
  missingGatewayRule,
  orphanedLoadBalancerRule,
  orphanedMessagingRule,
  publicDatabaseWithoutFirewallRule,
];

export function validateArchitecture(
  graph: ArchitectureGraph,
  rules: ValidationRule[] = DEFAULT_RULES,
): ValidationIssue[] {
  return rules.flatMap((rule) => rule(graph));
}

export function countBySeverity(issues: ValidationIssue[]) {
  return {
    error: issues.filter((i) => i.severity === "error").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };
}
