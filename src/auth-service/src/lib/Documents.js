import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import FileProvider from "@lib/fileprovider";
import uuid from "uuid/v4";

async function uploadDocument(data, realmId, userId) {
  try {
    let files_name = null,
      files_code = null;
    if (data && userId) {
      if (data && data.files[0]) {
        files_name = data.files[0].name;
        files_code = data.files[0].code;
      }
      let dbData = {
        id: uuid(),
        user_id: userId,
        type: data.type,
        status: data.status || 2,
        name: files_name,
        doc_code: files_code,
        ctime: new Date(),
        mtime: new Date(),
        removed: 0
      };
      let result = await db.user_documents.create(dbData);
      if (result) {
        return { success: true };
      } else {
        throw "CANNOTADDNEWDOCUMENT";
      }
    } else throw "EMPTYDATAORUSERID";
  } catch (e) {
    let error = {
      code: "ERRORWHILEUPLOADDOCUMENT",
      message: "auth-service, uploadDocument func. " + e
    };
    console.log(error);
    throw error;
  }
}

async function getUserDocuments(data, realmId, userId) {
  try {
    if (userId) {
      let res = await db.user_documents.findAll({
        where: { user_id: userId },
        attributes: ["id", "name", "type", "status"]
      });
      if (res) {
        return {
          success: true,
          userDocList: res
        };
      } else {
        throw "ERROR";
      }
    } else throw "EMPTYUSERID";
  } catch (e) {
    let error = {
      code: "ERRORGETTINGLISTOFDOCUMENTS",
      message: "auth-service, getUserDocuments func. " + e
    };
    console.log(error);
    throw error;
  }
}

async function updateDocument(data, realmId, userId) {
  try {
    if (data && userId) {
      let dbData = {
        type: data.type,
        status: data.status,
        name: data.files[0].name,
        doc_code: data.files[0].code,
        mtime: new Date()
      };
      let result = await db.user_documents.update(dbData, {
        where: { id: data.id }
      });
      if (result) {
        return { success: true };
      } else {
        throw "CANNOTUPDATEUSERDOCUMENT";
      }
    } else throw "EMPTYDATAORUSERID";
  } catch (e) {
    let error = {
      code: "ERRORWHILEUPDATEDOCUMENT",
      message: "auth-service, updateDocument func. " + e
    };
    console.log(error);
    throw error;
  }
}

export default {
  uploadDocument,
  getUserDocuments,
  updateDocument
};
