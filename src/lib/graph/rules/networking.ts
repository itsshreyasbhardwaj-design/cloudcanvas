import { getCatalogEntry } from "../../resource-model";
import { getNode } from "../types";
import { issue, type ValidationRule } from "../validation-types";

const NON_NETWORKED_CATEGORIES = new Set(["compute", "database"]);

function ancestorKinds(graph: Parameters<ValidationRule>[0], nodeId: string): string[] {
  const kinds: string[] = [];
  let current = getNode(graph, nodeId)?.parentId;
  while (current) {
    const node = getNode(graph, current);
    if (!node) break;
    kinds.push(node.kind);
    current = node.parentId;
  }
  return kinds;
}

/** Compute and database resources should live inside a subnet, not float unplaced. */
export const missingNetworkingRule: ValidationRule = (graph) => {
  const issues = [];
  for (const node of graph.nodes) {
    const entry = getCatalogEntry(node.kind);
    if (!NON_NETWORKED_CATEGORIES.has(entry.category)) continue;
    const ancestors = ancestorKinds(graph, node.id);
    if (!ancestors.includes("networking.subnet")) {
      issues.push(
        issue(
          "missing-networking",
          "warning",
          `${node.name} isn't placed inside a subnet. Compute and database resources should live inside networking to model real reachability.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};

/** A subnet must be nested (directly or transitively) inside a VPC. */
export const subnetWithoutVpcRule: ValidationRule = (graph) => {
  const issues = [];
  for (const node of graph.nodes) {
    if (node.kind !== "networking.subnet") continue;
    const ancestors = ancestorKinds(graph, node.id);
    if (!ancestors.includes("networking.vpc")) {
      issues.push(
        issue(
          "subnet-without-vpc",
          "error",
          `Subnet "${node.name}" isn't inside a VPC. A subnet cannot exist without a parent VPC.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};

/** A public subnet should have an internet gateway path; a private subnet with a NAT claim should have a NAT gateway. */
export const missingGatewayRule: ValidationRule = (graph) => {
  const issues = [];
  const hasInternetGateway = graph.nodes.some((n) => n.kind === "networking.internet-gateway");
  const hasNatGateway = graph.nodes.some((n) => n.kind === "networking.nat-gateway");
  for (const node of graph.nodes) {
    if (node.kind !== "networking.subnet") continue;
    if (node.fields.isPublic && !hasInternetGateway) {
      issues.push(
        issue(
          "missing-internet-gateway",
          "warning",
          `"${node.name}" is marked public but the architecture has no internet gateway.`,
          [node.id],
        ),
      );
    }
    if (!node.fields.isPublic && !hasNatGateway) {
      issues.push(
        issue(
          "missing-nat-gateway",
          "info",
          `Private subnet "${node.name}" has no NAT gateway — resources inside it won't be able to reach the internet outbound.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};
