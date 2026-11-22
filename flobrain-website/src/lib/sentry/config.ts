import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";

const isDevelopment = process.env.NODE_ENV === "development";
const defaultTracesSampleRate = isDevelopment ? 1.0 : 0.1;

function getApiTraceTargets(): Array<string | RegExp> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const targets: Array<string | RegExp> = ["localhost", /^\//];

  if (apiUrl) {
    try {
      targets.push(new URL(apiUrl).origin);
    } catch {
      targets.push(apiUrl);
    }
  }

  return targets;
}

function tracesSampler(samplingContext: {
  name?: string;
  attributes?: Record<string, unknown>;
  parentSampled?: boolean;
}): number | boolean {
  const name = samplingContext.name ?? "";
  const op = String(samplingContext.attributes?.["sentry.op"] ?? "");

  if (
    op.startsWith("gen_ai") ||
    name.includes("gen_ai") ||
    samplingContext.attributes?.["gen_ai.conversation.id"]
  ) {
    return 1.0;
  }

  if (name.includes("/brain") || name.includes("brain")) {
    return 1.0;
  }

  return defaultTracesSampleRate;
}

const sharedOptions = {
  dsn,
  enabled: Boolean(dsn),
  environment,
  tracesSampleRate: defaultTracesSampleRate,
  tracesSampler,
  streamGenAiSpans: true,
  tracePropagationTargets: getApiTraceTargets(),
} satisfies Partial<BrowserOptions & NodeOptions & EdgeOptions>;

export function getSentryClientOptions(): BrowserOptions {
  return {
    ...sharedOptions,
    enableLogs: true,
  };
}

export function getSentryServerOptions(): NodeOptions {
  return {
    ...sharedOptions,
    enableLogs: true,
  };
}

export function getSentryEdgeOptions(): EdgeOptions {
  return {
    ...sharedOptions,
    enableLogs: true,
  };
}
