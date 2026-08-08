import type { ArchitectureGraph } from "../../graph/types";
import type { Policy, PolicyProvider, PolicyViolation } from "../types";
import { DEFAULT_POLICIES } from "./default-policies";

export { DEFAULT_POLICIES } from "./default-policies";

export function createPolicyProvider(customPolicies: Policy[] = []): PolicyProvider {
  const policies = [...DEFAULT_POLICIES, ...customPolicies];
  return {
    listPolicies: () => policies,
    evaluate(graph: ArchitectureGraph): PolicyViolation[] {
      return policies.flatMap((policy) => policy.evaluate(graph));
    },
  };
}
