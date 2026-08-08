import * as Icons from "lucide-react";
import { Box } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export function ResourceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, ComponentType<LucideProps>>)[name] ?? Box;
  return <Icon {...props} />;
}
