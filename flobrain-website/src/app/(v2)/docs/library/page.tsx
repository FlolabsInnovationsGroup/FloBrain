import type { Metadata } from "next";
import { LibraryOverview } from "./LibraryOverview";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return <LibraryOverview />;
}
