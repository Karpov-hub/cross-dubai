import fs from "fs";
import config from "@lib/config";
import * as Minio from "minio";

let minioClient = new Minio.Client(config.minio);

function createBucket() {
  return new Promise((resolve, reject) => {
    minioClient.makeBucket("upload", "us-east-1", function(err) {
      if (err) reject(err);
      console.log('Bucket created successfully in "us-east-1".');
      resolve(true);
    });
  });
}

function bucketExists() {
  return new Promise((resolve, reject) => {
    minioClient.bucketExists("upload", function(err, exists) {
      if (err) reject(err);
      if (exists)
        resolve({
          exists: true
        });
      else
        resolve({
          exists: false
        });
    });
  });
}

async function push(file) {
  let bucketExist = await bucketExists();
  if (!bucketExist.exists) await createBucket();

  return new Promise((resolve, reject) => {
    minioClient.putObject("upload", `${file.code}`, file.data, (err, etag) => {
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
    minioClient.getObject("upload", `${code}`, (err, stream) => {
      if (err) reject(err);
      else
        resolve({
          stream,
          isBase64: false
        });
    });
  });
}

function exists(code) {
  return new Promise((resolve, reject) => {
    minioClient.getObject("upload", `${code}`, function(err, dataStream) {
      if (err) {
        return console.log(err);
      }
      dataStream.on("error", function(err) {
        reject(err);
      });
      dataStream.on("data", function(chunk) {
        resolve(true);
      });
    });
  });
}

function del(filename) {
  return new Promise((resolve, reject) => {
    minioClient.removeObject("upload", `${filename}`, (err, etag) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

async function watermarkFile(code) {
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
