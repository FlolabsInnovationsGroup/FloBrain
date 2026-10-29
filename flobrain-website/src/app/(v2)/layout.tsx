import { PageStructure } from "@/components/v2/PageStructure";
import type { ReactNode } from "react";

export default function V2Layout({ children }: { children: ReactNode }) {
  return <PageStructure>{children}</PageStructure>;
}
