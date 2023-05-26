import fs from "fs";
import fileOperations from "../lib/operations";
import config from "@lib/config";

function push(file) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${config.upload_dir}/${file.code}`, file.data, (err, res) => {
      if (err) reject(err);
      else
        resolve({
          success: true
        });
    });
  });
}

function pull(code) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config.upload_dir}/${code}`, (err, res) => {
      if (err) reject(err);
      else
        resolve({
          content: res,
          isBase64: false
        });
    });
  });
}

function exists(code) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config.upload_dir}/${code}`, "utf8", (err, res) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function del(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(`${config.upload_dir}/${filename}`, (err, res) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

async function watermarkFile(code) {
  try {
    await fileOperations.addWatermark(
      `${config.upload_dir}/${code}`,
      `${config.upload_dir}/${code}`
    );
  } catch (e) {
    throw e;
  }
  return {
    success: true,
    code: code
  };
}

export default {
  push,
  pull,
  exists,
  del,
  watermarkFile
};
