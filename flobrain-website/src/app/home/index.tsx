import Link from "next/link";
import {
  Bot,
  Brain,
  ChartLine,
  Check,
  CloudCog,
  LockKeyhole,
  Mic,
  PlugZap,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const TRUSTED_BY = ["Neurocare Labs", "Horizon Mobility", "MESH Robotics", "Halo Assist"];

const FEATURES = [
  {
    title: "Agentic Workflows",
    description: "Compose voice, memory, and automation in one visual execution graph.",
    icon: Workflow,
  },
  {
    title: "Multi-Model Router",
    description: "Route each request to the best model based on latency, quality, and cost.",
    icon: Bot,
  },
  {
    title: "Context Memory",
    description: "Persistent user context that can be synced across web, mobile, and wearables.",
    icon: Brain,
  },
  {
    title: "Realtime Telemetry",
    description: "Observe every interaction in production with low-latency event streaming.",
    icon: ChartLine,
  },
  {
    title: "Privacy Controls",
    description: "Fine-grained retention and redaction settings for sensitive conversations.",
    icon: LockKeyhole,
  },
  {
    title: "Unified Integrations",
    description: "Connect CRMs, calendars, and device APIs through one integration layer.",
    icon: PlugZap,
  },
] as const;

const SOLUTIONS = [
  {
    name: "Care & Health",
    details: "Adaptive assistants for remote care, triage, and chronic support journeys.",
    icon: ShieldCheck,
    tags: ["HIPAA-ready", "Multilingual", "Voice-first"],
  },
  {
    name: "Consumer Products",
    details: "Ambient intelligence for apps, wearables, and in-home AI experiences.",
    icon: Sparkles,
    tags: ["Mobile SDK", "Wearables", "Realtime sync"],
  },
  {
    name: "Enterprise Ops",
    details: "Automate repetitive workflows while keeping humans in the loop.",
    icon: CloudCog,
    tags: ["RBAC", "Audit trail", "No-code flows"],
  },
] as const;

const IMPLEMENTATION_STEPS = [
  "Connect your data sources and APIs in minutes.",
  "Design orchestrated flows with built-in model and memory blocks.",
  "Deploy securely across channels with observability from day one.",
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-8 text-white sm:px-6 md:pt-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#130a22]/90 px-6 py-10 shadow-[0_0_80px_rgba(168,85,247,0.15)] md:px-10 md:py-14">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              <ScanLine className="size-3.5" />
              CAIPO Platform
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              Build intelligent product experiences with one AI operating layer.
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
              Caipo gives teams a production-ready stack for voice, memory, and automation so you
              can ship adaptive assistants faster across web, mobile, and embedded devices.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[#a855f7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9333ea]"
              >
                Start free
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                Book demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {TRUSTED_BY.map((company) => (
                <span
                  key={company}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120a20]/90 p-5">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
              <span>Live session</span>
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Online
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Input</p>
                <p className="mt-1 text-sm text-zinc-100">"Create a morning care routine plan."</p>
              </div>
              <div className="rounded-xl border border-violet-300/20 bg-violet-400/10 p-4">
                <p className="flex items-center gap-2 text-sm text-violet-200">
                  <Mic className="size-4" />
                  Voice + context pipeline activated
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-200">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-300" />
                    Memory profile matched
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-300" />
                    Personalized workflow generated
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-300" />
                    Multi-channel handoff prepared
                  </li>
                </ul>
              </div>
              <p className="text-xs text-zinc-400">Average response latency: 142ms</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-3xl font-semibold">Everything needed to ship AI reliably</h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-zinc-400">
          Purpose-built modules for teams that need secure, observable, and fast AI delivery from
          prototype to production.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_30px_rgba(124,58,237,0.09)]"
            >
              <Icon className="size-6 text-violet-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-zinc-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {SOLUTIONS.map(({ name, details, icon: Icon, tags }) => (
          <article
            key={name}
            className="rounded-2xl border border-white/10 bg-[#120a20]/85 p-6 shadow-[0_0_24px_rgba(168,85,247,0.1)]"
          >
            <Icon className="size-6 text-fuchsia-300" />
            <h3 className="mt-4 text-xl font-semibold">{name}</h3>
            <p className="mt-2 text-sm text-zinc-300">{details}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border border-white/10 bg-[#10081d]/85 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">How teams launch with Caipo</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {IMPLEMENTATION_STEPS.map((step, index) => (
            <article key={step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm text-zinc-200">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-fuchsia-300/20 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 p-8 text-center">
        <h2 className="text-3xl font-semibold">Ready to build your CAIPO experience?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-200">
          Launch in days with a developer-friendly API, production controls, and scalable model
          orchestration.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#18072b] transition hover:bg-zinc-200"
          >
            Create account
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
