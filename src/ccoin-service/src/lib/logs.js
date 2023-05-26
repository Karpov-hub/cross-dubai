import db from "@lib/db";

async function push(transfer_id, code, message, data, request) {
  await db.transfer_log.create({
    transfer_id,
    code,
    message,
    data: JSON.stringify(data),
    request: JSON.stringify(request)
  });
}

export default {
  push
};
