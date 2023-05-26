import db from "@lib/db";

async function setProcessed(data, realmId, userId) {
  let res = await changeStatus(data, 2);
  if (res && res.success) return { success: true };
}

async function setRefund(data, realmId, userId) {
  let res = await changeStatus(data, 6);
  if (res && res.success) return { success: true };
}

async function setCanceled(data, realmId, userId) {
  let res = await changeStatus(data, 7);
  if (res && res.success) return { success: true };
}

async function changeStatus(data, status) {
  if (!data.id) throw "INVALIDDATA";

  let res = await db.transfer.update(
    { status },
    {
      where: { ref_id: data.id }
    }
  );
  if (res && res.length) return { success: true };
  throw "ERROR";
}

export default {
  setProcessed,
  setRefund,
  setCanceled
};
