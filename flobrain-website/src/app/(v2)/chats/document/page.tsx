import type { Metadata } from "next";
import { DocumentUploadScreen } from "@/components/v2/chats/DocumentUploadScreen";

export const metadata: Metadata = {
  title: "Chat with a document",
};

export default function ChatDocumentPage() {
  return <DocumentUploadScreen />;
}
