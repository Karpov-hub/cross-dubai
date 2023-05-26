import config from "@lib/config";
import express from "express";
import bodyParser from "body-parser";
import Server from "./lib/Server";
import Middleware from "./middleware";

const app = express();

app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

for (let mw in Middleware) {
  app.use(Middleware[mw].run);
}

app.use(new Server());

if (
  !process.env.NODE_ENV ||
  !["test", "localtest"].includes(process.env.NODE_ENV)
) {
  const server = app.listen(config.port, () => {
    console.log("server is running at %s", server.address().port);
  });
}

export default app;
