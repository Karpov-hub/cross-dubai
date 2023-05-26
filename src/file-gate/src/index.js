import express from "express";
import FileProvider from "@lib/fileprovider";
import bodyParser from "body-parser";
import MemStore from "@lib/memstore";
import cors from "cors";
import config from "@lib/config";
var path = require("path");
var fs = require("fs");

const app = express();

app.use(cors());

app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

app.get("/download/file/:filename", async (req, res) => {
  await responseFile(config.upload_dir, `${req.params.filename}.zip`, res);
  fs.readdir(config.upload_dir, (err, files) => {
    files.forEach((file) => {
      if (file.includes(".zip")) fs.unlinkSync(config.upload_dir + "/" + file);
    });
  });
});

app.get("/download/:code", async (req, res) => {
  downloadFile(req, res, true);
});

app.get("/download/:code/:userToken", async (req, res) => {
  downloadFile(req, res, false);
});

function responseFile(basePath, fileName, res) {
  var fullFileName = path.join(basePath, fileName);

  return new Promise((resolve) => {
    fs.exists(fullFileName, function(exist) {
      if (exist) {
        var filename = path.basename(fullFileName);

        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + filename
        );
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Type", "application/octet-stream");

        resolve(res.sendFile(fullFileName));
      } else {
        resolve(res.sendStatus(404));
      }
    });
  });
}

async function downloadFile(req, res, withoutUserToken) {
  if (!withoutUserToken) {
    // const userId = await checkUserPermissions(req.params.userToken);
    // if (!userId) {
    //   res.send({ error: "ACCESSDENIEDFORUSER" });
    // }
  }

  let file = await FileProvider.getContent(req.params);
  res.set(
    "Content-Disposition",
    `attachment; filename=${encodeURI(file.meta.filename)}`
  );
  file.data.stream.pipe(res);
  file.data.stream.on("end", () => {
    res.end();
  });
}

app.get("/view/:filename/", async (req, res) => {
  let file = await FileProvider.getStaticFiles(req.params);
  res.set("Content-Disposition", "inline");
  file.data.stream.pipe(res);
  file.data.stream.on("end", () => {
    res.end();
  });
});

async function checkUserPermissions(userToken) {
  const userId = await MemStore.get(`usr${userToken}`);
  if (userId) {
    await MemStore.set(`usr${userToken}`, userId, config.user_token_lifetime);
  }
  return userId;
}

if (
  !process.env.NODE_ENV ||
  !["test", "localtest"].includes(process.env.NODE_ENV)
) {
  const server = app.listen(8012, () => {
    console.log("File-gate 1 is running at %s", server.address().port);
  });
}

export default app;
