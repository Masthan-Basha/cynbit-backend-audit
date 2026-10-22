import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const server = createApp({ config }).listen(config.port, () =>
  console.log(JSON.stringify({ msg: "listening", port: config.port }))
);

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => server.close(() => process.exit(0))); // graceful shutdown
}
