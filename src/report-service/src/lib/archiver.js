const archiver = require("archiver");
var fs = require("fs");
import config from "@lib/config";
import FileProvider from "@lib/fileprovider";
import request from "request";

async function archiveFiles(files, filename, cb) {
  return new Promise((resolve) => {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(config.upload_dir + `/${filename}.zip`);
    const archive = archiver("zip", {
      zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on("close", async function() {
      console.log(archive.pointer() + " total bytes");
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );
      fs.readdir(config.upload_dir, (err, files) => {
        files.forEach((file) => {
          if (file.includes(".pdf"))
            fs.unlinkSync(config.upload_dir + "/" + file);
        });
      });
      return resolve({ success: true, fileGenerated: true });
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on("end", function() {
      console.log("Data has been drained");
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", function(err) {
      if (err.code === "ENOENT") {
        // log warning
        console.log("archiver: ", err.code);
        return resolve({
          success: false,
          error: "FILELOADERROR",
          code: err.code
        });
      } else {
        // throw error
        throw err;
      }
    });

    // good practice to catch this error explicitly
    archive.on("error", function(err) {
      throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);
    files.forEach((f) => {
      // append a file from stream
      const file = config.upload_dir + "/" + f.meta.filename;
      archive.append(fs.createReadStream(file), { name: f.meta.filename });
    });
    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
}

function checkUploadFoler() {
  return new Promise((resolve) => {
    // check if directory exists
    fs.access(config.upload_dir, (err) => {
      if (err) {
        fs.mkdir(config.upload_dir, (err) => {
          if (err) resolve({ success: false, error: err });
          resolve({ success: true });
        });
      } else resolve({ success: true });
    });
  });
}

function push(file) {
  return new Promise(async (resolve, reject) => {
    const folder = await checkUploadFoler();
    if (folder && !folder.success)
      return resolve({ success: false, code: "CANNOTCREATEAFOLDER" });
    fs.writeFile(
      `${config.upload_dir}/${file.filename}`,
      file.body,
      "binary",
      (err, res) => {
        if (err) {
          console.error(err);
          return resolve({
            success: false,
            error: "FILELOADERROR",
            code: err.code || ""
          });
        } else
          resolve({
            success: true
          });
      }
    );
  });
}

async function downloadArchive(data, realm_id, user_id) {
  // meta files should be array of string values (codes)
  if (!data || !data.meta_files || !Array.isArray(data.meta_files))
    return { success: true, empty: true };
  let out = await Promise.all(
    data.meta_files.map(
      async (el) => await FileProvider.getContent({ code: el })
    )
  );
  return new Promise((resolve) => {
    if (out && out.length)
      out.forEach(async (el, i) => {
        request(
          {
            uri: config.fileGateUrl + "/download/" + el.meta.code,
            method: "GET",
            encoding: null,
            json: {}
          },
          async (err, res, body) => {
            if (err) {
              console.log(err);
              return resolve({
                success: false,
                error: "FILELOADERROR",
                code: err.code || ""
              });
            }
            const result = await push({ filename: el.meta.filename, body });
            if (result && !result.success) {
              console.log(result);
              return resolve({
                success: false,
                error: "FILELOADERROR",
                code: result.code || ""
              });
            }
            if (i == out.length - 1) {
              resolve(await archiveFiles(out, data.filename));
            }
          }
        );
      });
    else resolve({ success: true, empty: true });
  });
}

export default {
  downloadArchive
};
