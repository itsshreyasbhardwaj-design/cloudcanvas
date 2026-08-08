import type { ResourceCatalogEntry } from "../types";

export const messagingCatalog: ResourceCatalogEntry[] = [
  {
    kind: "messaging.queue",
    category: "messaging",
    label: "Queue",
    description: "Point-to-point message queue (SQS, Cloud Tasks, Service Bus).",
    icon: "ListOrdered",
  },
  {
    kind: "messaging.pubsub",
    category: "messaging",
    label: "Pub/Sub Topic",
    description: "Fan-out publish/subscribe messaging.",
    icon: "Radio",
  },
  {
    kind: "messaging.event-bus",
    category: "messaging",
    label: "Event Bus",
    description: "Event routing between producers and consumers.",
    icon: "Workflow",
  },
  {
    kind: "messaging.stream",
    category: "messaging",
    label: "Stream",
    description: "Ordered, replayable event stream (Kinesis, Pub/Sub, Event Hubs).",
    icon: "Waves",
  },
];
