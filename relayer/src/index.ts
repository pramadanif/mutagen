import { config } from "./config.js";
import { runOracleCycle } from "./oracle.js";
import { startServer } from "./server.js";
import { log } from "./logger.js";

async function main() {
  startServer();
  await runOracleCycle();
  setInterval(() => {
    void runOracleCycle();
  }, config.intervalMs);
}

main().catch((err) => {
  log("error", "relayer_fatal", { error: String(err) });
  process.exit(1);
});
