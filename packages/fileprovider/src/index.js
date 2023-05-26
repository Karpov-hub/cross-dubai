import config from "@lib/config";
import Connectors from "./connectors/index.js";
const uuidv1 = require("uuid/v1");
import Queue from "@lib/queue";

const Connector = Connectors[config.fileProviderType || "local"];

async function push(file, holdTimeout) {
  var uuid = uuidv1();
  let addHoldTime = new Date();

  let pushFile = {};

  if (!Buffer.isBuffer(file.data)) {
    let decodedFile = await splitBase64(file.data);

    file.originalData = Buffer.from(decodedFile.data, "base64");
    file.size = Buffer.byteLength(file.originalData);
    file.mime_type = decodedFile.type;
    pushFile = {
      code: uuid,
      data: file.originalData
    };
  } else
    pushFile = {
      code: uuid,
      data: file.data
    };

  let isPushed = await Connector.push(pushFile);

  let data = {
    code: uuid,
    filename: file.name,
    file_size: file.size,
    mime_type: file.mime_type,
    upload_date: new Date(),
    storage_date: addHoldTime.setSeconds(addHoldTime.getSeconds() + holdTimeout)
  };
  let res;

  if (isPushed)
    res = await Queue.newJob("file-service", {
      method: "push",
      data
    });

  if (res)
    return {
      success: true,
      code: uuid,
      size: file.size
    };
  throw "FILESERVICEPUSHERROR";
}

async function pull(code) {
  let fileCode = code.code;

  let data = {
    where: {
      code: fileCode
    }
  };

  let res = await Queue.newJob("file-service", {
    method: "pull",
    data
  });

  let pulledFile = {
    name: res.result.filename,
    size: res.result.file_size,
    mime_type: res.result.mime_type,
    data: config.fileGateUrl + "/download/" + fileCode //`data:${res.dataValues.mime_type};base64,${base64Data}`
  };
  return pulledFile;
}

async function getContent(file) {
  let fileCode = file.code;
  let data = {
    where: {
      code: fileCode
    }
  };

  let res = await Queue.newJob("file-service", {
    method: "getContent",
    data
  });

  if (!res) throw "FILENOTFOUND";
  let pulledFileData = await Connector.pull(fileCode);

  return {
    meta: res.result,
    data: pulledFileData
  };
}

async function getStaticFiles(file) {
  let filename = file.filename;
  let data = {
    where: {
      filename
    }
  };
  let res = await Queue.newJob("file-service", {
    method: "getStaticFiles",
    data
  });
  if (!res) throw "FILENOTFOUND";
  let pulledFileData = await Connector.pull(res.code);

  return {
    meta: res.toJSON(),
    data: pulledFileData
  };
}

async function status(code) {
  let fileCode = code.code;
  if (!(await Connector.exists(fileCode))) throw "FILENOTFOUND";

  let data = {
    where: {
      code: fileCode
    }
  };

  let res = await Queue.newJob("file-service", {
    method: "status",
    data
  });

  return {
    name: res.result.filename,
    size: res.result.file_size
  };
}

async function del(code) {
  let fileCode = code.code;

  let isDelete = await Connector.del(fileCode);

  let data = {
    where: {
      code: fileCode
    }
  };

  await Queue.newJob("file-service", {
    method: "remove",
    data
  });

  if (isDelete)
    return {
      success: true,
      code: fileCode
    };
  return {
    success: false
  };
}

async function accept(files) {
  await Queue.newJob("file-service", {
    method: "accept",
    data: files
  });

  return {
    success: true
  };
}

async function watermarkFile(code) {
  return await Connector.watermarkFile(code.code);
}

function splitBase64(dataString) {
  let response = {};
  let beginTypeIndex = dataString.indexOf(":") + 1;
  let endTypeIndex = dataString.indexOf(";");
  let indexBase64 = dataString.indexOf(",") + 1;

  response.type = dataString.slice(beginTypeIndex, endTypeIndex);
  response.data = dataString.substr(indexBase64);

  return response;
}

export default {
  push,
  pull,
  status,
  del,
  accept,
  watermarkFile,
  getContent,
  getStaticFiles
};
