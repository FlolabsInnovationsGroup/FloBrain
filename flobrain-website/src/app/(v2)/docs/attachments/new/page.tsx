import type { Metadata } from "next";
import { NewAttachmentUpload } from "./NewAttachmentUpload";

export const metadata: Metadata = {
  title: "New Attachment",
};

export default function NewAttachmentPage() {
  return <NewAttachmentUpload />;
}
