import db from "@lib/db";

async function push(data) {
  let res = await db.provider.create(data);
  return res;
}

async function pull(data) {
  let res = await db.provider.findOne(data);
  return res;
}

async function status(data) {
  let res = await db.provider.findOne(data);
  return res;
}

async function remove(data) {
  let res = await db.provider.update(
    {
      removed: 1
    },
    data
  );
  return res;
}

async function accept(data) {
  for (let item of data) {
    await db.provider.update(
      {
        storage_date: null
      },
      {
        where: {
          code: item.code
        }
      }
    );
  }
  return { success: true };
}

async function getContent(data) {
  let res = await db.provider.findOne(data);
  return res;
}

async function getStaticFiles(data) {
  let res = await db.provider.findOne(data);
  return res;
}

export default {
  push,
  pull,
  status,
  getStaticFiles,
  getContent,
  accept,
  remove
};
