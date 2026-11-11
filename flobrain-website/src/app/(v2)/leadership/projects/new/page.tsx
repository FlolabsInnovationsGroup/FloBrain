import type { Metadata } from "next";
import { CreateProjectForm } from "../components/CreateProjectForm";

export const metadata: Metadata = {
  title: "Create Project",
};

export default function CreateProjectPage() {
  return <CreateProjectForm />;
}
