import type { ArchitectureNode } from "../../graph/types";
import type { CloudProviderId, CostEstimate, CostLineItem, CostProvider } from "../types";
import { getCatalogEntry } from "../../resource-model";
import { STATIC_PRICING_TABLE, PRICING_SOURCE_LABEL } from "./pricing-table";

export function createStaticCostProvider(providerId: CloudProviderId): CostProvider {
  const table = STATIC_PRICING_TABLE[providerId];
  return {
    providerId,
    estimate(nodes: ArchitectureNode[]): CostEstimate {
      const lineItems: CostLineItem[] = [];
      for (const node of nodes) {
        const baseline = table[node.kind];
        if (baseline === undefined) continue; // structural resources (vpc, subnet, region…) have no direct cost line
        const entry = getCatalogEntry(node.kind);
        const multiplier = typeof node.fields.count === "number" && node.fields.count > 0 ? node.fields.count : 1;
        const monthlyUsd = Math.round(baseline * multiplier * 100) / 100;
        lineItems.push({
          nodeId: node.id,
          kind: node.kind,
          label: node.name || entry.label,
          monthlyUsd,
          assumptions: [
            `Baseline for ${entry.label} on ${providerId.toUpperCase()}: $${baseline}/mo`,
            multiplier !== 1 ? `Scaled by count = ${multiplier}` : `Single instance`,
          ],
        });
      }
      const monthlyTotal = Math.round(lineItems.reduce((sum, l) => sum + l.monthlyUsd, 0) * 100) / 100;
      return {
        providerId,
        currency: "USD",
        monthlyTotal,
        annualTotal: Math.round(monthlyTotal * 12 * 100) / 100,
        lineItems,
        generatedAt: new Date().toISOString(),
        disclaimer: `Estimate only, based on ${PRICING_SOURCE_LABEL}. Actual cloud bills vary with usage, data transfer, discounts, and provider pricing changes.`,
      };
    },
  };
}
