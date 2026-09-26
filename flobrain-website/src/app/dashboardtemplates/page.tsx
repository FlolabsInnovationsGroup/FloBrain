import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FloBrain dashboard demos",
  description: "Explore the FloBrain dashboard versions our designers are building.",
};

type Demo = {
  designer: string;
  version: number;
  url: string;
};

// To add a new demo, add one line here. Nothing else needs to change.
const demos: Demo[] = [
  { designer: "Ceren", version: 1, url: "https://ceren1.flobrain.ai/login" },
  { designer: "Ceren", version: 2, url: "https://ceren2.flobrain.ai/login" },
  { designer: "Dina", version: 1, url: "https://dina1.flobrain.ai/" },
  { designer: "Diogo", version: 1, url: "https://diogo1.flobrain.ai/" },
  { designer: "Diogo", version: 2, url: "https://diogo2.flobrain.ai/" },
  { designer: "Sandeep", version: 1, url: "https://v2.flobrain.ai/" },
  { designer: "Claudia", version: 1,  url: "https://health.flobrain.ai/" },
];

export default function DashboardTemplatesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Dashboard demos</p>
        <h1 className={styles.title}>See what we are building</h1>
        <p className={styles.lead}>
          Each card opens a working FloBrain dashboard from one of our designers. Click around and
          compare them.
        </p>
      </header>

      <ul className={styles.grid}>
        {demos.map((demo) => (
          <li key={demo.url}>
            <a
              className={styles.card}
              href={demo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${demo.designer} version ${demo.version} dashboard`}
            >
              <span className={styles.cardTop}>
                <span className={styles.designer}>{demo.designer}</span>
                <span className={styles.version}>Version {demo.version}</span>
              </span>
              <span className={styles.host}>{new URL(demo.url).hostname}</span>
              <span className={styles.cta}>Open live demo</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
