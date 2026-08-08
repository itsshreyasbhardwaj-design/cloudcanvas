import { getEdgesForNode } from "../types";
import { issue, type ValidationRule } from "../validation-types";

/** A load balancer that routes to nothing serves no purpose and usually means targets weren't wired up. */
export const orphanedLoadBalancerRule: ValidationRule = (graph) => {
  const issues = [];
  for (const node of graph.nodes) {
    if (node.kind !== "networking.load-balancer") continue;
    const outgoing = graph.edges.filter((e) => e.source === node.id && e.kind === "routes-to");
    if (outgoing.length === 0) {
      issues.push(
        issue(
          "orphaned-load-balancer",
          "warning",
          `Load balancer "${node.name}" has no targets connected — it isn't routing traffic anywhere.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};

/** A queue/topic/stream with no producer or consumer is dead infrastructure. */
export const orphanedMessagingRule: ValidationRule = (graph) => {
  const issues = [];
  const messagingKinds = new Set(["messaging.queue", "messaging.pubsub", "messaging.event-bus", "messaging.stream"]);
  for (const node of graph.nodes) {
    if (!messagingKinds.has(node.kind)) continue;
    if (getEdgesForNode(graph, node.id).length === 0) {
      issues.push(
        issue(
          "orphaned-messaging-resource",
          "warning",
          `"${node.name}" has no producers or consumers connected to it.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};

/** A publicly-accessible database with no security group / firewall attached has no access control at all. */
export const publicDatabaseWithoutFirewallRule: ValidationRule = (graph) => {
  const issues = [];
  const databaseCategoryKinds = new Set(["database.postgresql", "database.mysql", "database.redis", "database.nosql"]);
  for (const node of graph.nodes) {
    if (!databaseCategoryKinds.has(node.kind)) continue;
    if (!node.fields.publiclyAccessible) continue;
    const hasFirewall = getEdgesForNode(graph, node.id).some((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      return graph.nodes.find((n) => n.id === otherId)?.kind === "networking.firewall";
    });
    if (!hasFirewall) {
      issues.push(
        issue(
          "public-database-no-firewall",
          "error",
          `"${node.name}" is publicly accessible and has no firewall or security group restricting access to it.`,
          [node.id],
        ),
      );
    }
  }
  return issues;
};
