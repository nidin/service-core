const { EventEmitter } = require("events");
import chalk from "chalk";
import { envInt, env } from "@01/env";

const PERFORMANCE_PROFILE_THRESHOLD = envInt(
  "PERFORMANCE_PROFILE_THRESHOLD",
  50
);

const isDev = env("NODE_ENV", "development") === "development";

type Data = {
  name: string;
  location: string;
  req: {
    request_id: string;
    path: string;
  };
  time: number;
};

// Profiler proxy
export function profile(handler: any) {
  return new Proxy(handler, {
    apply: (target, _this, [req, res, next]) => {
      const start: number = Date.now();
      if (!req || !res) {
        console.log(handler);
        throw new Error("Function must take 2 or 3 arguments");
      }
      if (next) {
        return target.apply(_this, [
          req,
          res,
          function requestHandler(this: any) {
            const name: string = handler.name || "anonymous";
            let location: string | undefined = undefined;
            if (name === "anonymous" && isDev) {
              // If handler name is anonymous, generate location of the handler.
              try {
                throw new Error("InternalError");
              } catch (e) {
                location = e.stack.split("\n")[2];
              }
            }

            profiles.emit("middleware", {
              req,
              name,
              location,
              time: Date.now() - start
            });
            next.apply(this, arguments);
          }
        ]);
      }
      res.once("finish", () =>
        profiles.emit("route", {
          req,
          name: handler.name || "anonymous",
          time: Date.now() - start
        })
      );
      return target.apply(_this, [req, res]);
    }
  });
}

const profiles = new EventEmitter();
profiles.on("route", (data: Data) => {
  if (data.time > PERFORMANCE_PROFILE_THRESHOLD) {
    console.log(
      chalk.bgBlue(chalk.white(" PERFORMANCE ")),
      chalk.blue(
        `request_id=${data.req.request_id} ${data.req.path} [${data.time}ms]`
      )
    );
  }
});

profiles.on("middleware", (data: Data) => {
  if (data.time > PERFORMANCE_PROFILE_THRESHOLD) {
    console.log(
      chalk.bgBlue(chalk.white(" PERFORMANCE ")),
      chalk.blue(
        `request_id=${data.req.request_id} ${data.req.path} [${data.name}] [${
          data.time
        }ms]`
      )
    );
    if (data.location) {
      console.log(chalk.blue(data.location));
    }
  }
});
