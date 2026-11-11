import * as Sentry from "@sentry/nextjs";
import { getSentryEdgeOptions } from "@/lib/sentry/config";

Sentry.init(getSentryEdgeOptions());
