import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(
    `[CollabPay] Server running on http://localhost:${config.port} (${config.nodeEnv})`
  );
});
