import * as Sentry from "@sentry/nextjs";
import { getSentryClientOptions } from "@/lib/sentry/config";

Sentry.init({
  ...getSentryClientOptions(),
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
