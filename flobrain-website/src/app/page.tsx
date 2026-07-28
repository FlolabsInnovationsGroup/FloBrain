import { redirect } from "next/navigation";
import HomePage from "./home";

export const metadata = {
  title: "Home",
  description:
    "FloBrain is the central intelligence layer for AI-enabled devices and applications. Orchestrate workflows, persist memory, and deploy privacy-first AI at scale.",
};

export default function Home() {
  const userLogged = false;

  if (userLogged) {
    redirect("/home");
  }

  return <HomePage />;
}
