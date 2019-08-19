import { Sentry } from "./sentry";
import * as SentryTypes from "@sentry/node";

type Scope = SentryTypes.Scope;

interface KnownError extends Error {
  code: string;
  reason?: any;
}

export function reportError(error: KnownError) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  const { version, platform, arch } = process;
  const uptime = process.uptime();
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();

  const reason = error.reason ? error.reason : { message: "Unknown" };
  const extras = {
    reason,
    version,
    uptime,
    cpuUsage,
    memoryUsage,
    platform,
    arch,
    port: process.env.NODE_RUNTIME_PORT
  };

  const tags = {
    error_code: error.code
  };

  Sentry.configureScope((scope: Scope) => {
    scope.setFingerprint([reason.message]);
    scope.setExtras(extras);
    scope.setTags(tags);
    Sentry.captureException(error);
  });
}
