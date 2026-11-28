import type { Metadata } from "next";
import { redirect } from "next/navigation";
import HomePage from "./home";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeSchema } from "@/lib/schema";
import { buildPageMetadata, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  absoluteTitle: true,
  description:
    "FloBrain is the central intelligence layer for AI-enabled devices and applications. Orchestrate workflows, persist memory, and deploy privacy-first AI at scale.",
});

export default function Home() {
  const userLogged = false;

  if (userLogged) {
    redirect("/home");
  }

  return (
    <>
      <JsonLd data={homeSchema()} />
      <HomePage />
    </>
  );
}
