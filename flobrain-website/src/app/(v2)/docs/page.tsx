import type { Metadata } from "next";
import { MyDocsOverview } from "./components/MyDocsOverview";

export const metadata: Metadata = {
  title: "My Docs",
};

export default function MyDocsPage() {
  return <MyDocsOverview />;
}
