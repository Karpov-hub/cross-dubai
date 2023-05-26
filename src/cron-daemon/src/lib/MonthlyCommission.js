import db from "@lib/db";
import Queue from "@lib/queue";

const time = "1 1 1 1 * *";
const description = "Monthly comissions";

async function run(jobId, checkRecord) {
  console.log(description);
  const accounts = await db.account.findAll({
    where: { status: 1 },
    attributes: ["id", "acc_no", "balance", "currency"],
    include: [
      {
        model: db.user,
        attributes: [
          "id",
          "type",
          "email",
          "first_name",
          "last_name",
          "birthday",
          "countries",
          "legalname",
          "realm",
          "activated",
          "country",
          "legal_confirmation",
          "otp_transport",
          "kyc",
          "phone"
        ]
      }
    ]
  });

  for (let account of accounts) {
    if (await checkRecord(account.id)) {
      let { result } = await Queue.newJob("account-service", {
        method: "autoPayment",
        operation: { op_id: jobId, rec_id: account.id },
        data: {
          type: "monthly",
          account
        }
      });
      //console.log("result:", result);
    }
  }
  return;
}

export default {
  time,
  description,
  run
};
