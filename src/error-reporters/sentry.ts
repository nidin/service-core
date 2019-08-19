import * as OriginalSentry from "@sentry/node";
import chalk from "chalk";
import { env } from "@01/env";

let isSentryEnabled = false;
const {
  SENTRY_DSN = "",
  APP_VERSION = "",
  NODE_ENV = "",
  CLUSTER_NAME = ""
} = process.env;
const isProd = env("NODE_ENV", "development") === "production";
const warn = () =>
  console.log(
    `🚨 ${chalk.bgRed(
      chalk.bold.white(
        " Sentry not configured properly, Check env[SENTRY_DSN] "
      )
    )}`
  );

if (SENTRY_DSN) {
  isSentryEnabled = true;
  OriginalSentry.init({
    dsn: SENTRY_DSN,
    release: APP_VERSION
  });
  OriginalSentry.configureScope((scope: OriginalSentry.Scope) => {
    scope.setTags({
      APP_VERSION,
      NODE_ENV,
      CLUSTER_NAME
    });
  });
} else {
  if (isProd) {
    warn();
  }
}
const dummyFn = () => {};
const dummy = new Proxy(
  {},
  {
    get: () => dummyFn,
    apply: () => {}
  }
);
export const Sentry = new Proxy(OriginalSentry, {
  get: (target: any, prop) => {
    if (isSentryEnabled) {
      return target[prop];
    }
    if (isProd) {
      warn();
    }
    return target[prop] instanceof Function ? dummyFn : dummy;
  }
});
