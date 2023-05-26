import config from "@lib/config";
import fs from "fs";
import fileOperations from "../lib/operations";

const YandexDisk = require("yandex-disk").YandexDisk;
const disk = new YandexDisk("jmihvalera1357", "369258147WASD");

function push(file) {
  return new Promise((resolve, reject) => {
    disk.writeFile(`/${file.code}`, file.data, null, err => {
      if (err) reject(err);
      resolve({
        success: true
      });
    });
  });
}

function pull(code) {
  return new Promise(async (resolve, reject) => {
    disk.readFile(`/${code}`, "base64", (err, content) => {
      if (err) reject(err);
      resolve({
        content: content,
        isBase64: true
      });
    });
  });
}

function exists(code) {
  return new Promise((resolve, reject) => {
    disk.exists(`/${code}`, (err, exists) => {
      if (err) reject(err);
      resolve({
        success: exists
      });
    });
  });
}

function del(code) {
  return new Promise((resolve, reject) => {
    disk.remove(`/${code}`, err => {
      if (err) reject(err);
      disk.exists(`/${code}`, (err, exists) => {
        resolve(!exists);
      });
    });
  });
}

async function watermarkFile(code) {
  await downloadFile(code);
  return new Promise(async (resolve, reject) => {
    try {
      await fileOperations.addWatermark(
        `${config.upload_dir}/${code}`,
        `${config.upload_dir}/${code}`
      );
    } catch (e) {
      return reject(e);
    }
    disk.uploadFile(`${config.upload_dir}/${code}`, `${code}`, err => {
      fs.unlink(`${config.upload_dir}/${code}`, (err, res) => {
        if (err) reject(err);
        resolve({
          success: true,
          code: code
        });
      });
    });
  });
}

async function downloadFile(code) {
  return new Promise(async (resolve, reject) => {
    disk.readFile(`/${code}`, "base64", (err, content) => {
      if (err) throw err;
      let file = Buffer.from(content, "base64");
      fs.writeFile(`${config.upload_dir}/${code}`, file, (err, res) => {
        if (err) throw err;
        resolve(true)
      });
    });
  });
}

export default {
  push,
  pull,
  exists,
  del,
  watermarkFile
};