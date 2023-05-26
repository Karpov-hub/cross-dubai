import express from "express";
import bodyParser from "body-parser";
import config from "config";
import Callback from "./callback";

const app = express();

app.use(bodyParser.json({ limit: "1mb" }));
app.use(
  bodyParser.urlencoded({ limit: "1mb", extended: true, parameterLimit: 8000 })
);

app.use("/callback", new Callback());

if (
  !process.env.NODE_ENV ||
  !["test", "localtest"].includes(process.env.NODE_ENV)
) {
  const server = app.listen(config.port, () => {
    console.log(
      "Crypto callback service is running at %s",
      server.address().port
    );
  });
}

export default app;
