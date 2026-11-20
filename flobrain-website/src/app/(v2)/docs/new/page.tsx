
import type { Metadata } from "next";
import { NewDocEditor } from "./NewDocEditor";

export const metadata: Metadata = {
  title: "New Doc",
};

export default function NewDocPage() {
  return <NewDocEditor />;
}
