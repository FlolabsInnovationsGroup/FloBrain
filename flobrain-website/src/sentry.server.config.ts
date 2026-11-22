import * as Sentry from "@sentry/nextjs";
import { getSentryServerOptions } from "@/lib/sentry/config";

Sentry.init(getSentryServerOptions());
