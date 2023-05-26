
const Op = db.Sequelize.Op;
import db from "@lib/db";
import Queue from "@lib/queue";

async function downloadWithdrawalStatements(data, realm_id, user_id) {
  if (!data.date_from || !data.date_to) throw "PERIODNOTSPECIFIED";
  let out = await _getWithdrawalStatements(data, realm_id, user_id);
  return await Queue.newJob("report-service", {
    method: "downloadArchive",
    data: {meta_files: out, filename: "withdrawal_statements"}
  });
  //Archiver.downloadArchive({meta_files: out, filename: "withdrawal_statements"});
}

async function _getWithdrawalStatements(data, realm_id, user_id) {
  let filterWhereObj = {
    user_id,
    realm_id
  };
  let filterWhereForTransfer = {
    data: {},
    held: false,
    status: 4
  };
  if (data.date_from && data.date_to)
    filterWhereObj.ctime = {
      [Op.between]: [data.date_from, data.date_to]
    };
  filterWhereObj.description_src = "Withdrawal money";
  let res = await db.transaction.findAndCountAll({
    where: filterWhereObj,
    include: [
      {
        model: db.transfer,
        where: filterWhereForTransfer,
        as: "transfer"
      }
    ]
  });
  const statements = [];
  for (let r of res.rows) {
    const metaData = {
      report_name: "it_technologie_withdrawal_statement",
      format: "pdf",
      transfer_id: r.dataValues.transfer.dataValues.id
    };
    //get exists codes
    const exist_report = await db.withdrawal_statement.findAll({
      where: {
        transfer_id: r.dataValues.transfer.dataValues.id
      },
      raw: true
    });

    if (exist_report.length) {
      statements.push(exist_report[0].code);
    } else {
      // generate report for not exists
      let withdrawalStatement = await Queue.newJob("report-service", {
        method: "generateReport",
        data: metaData,
        realm_id,
        user_id
      });
      if (withdrawalStatement.result.success) {
        writeWithdrawalStatement({
          transfer_id: metaData.transfer_id,
          code: withdrawalStatement.result.code
        });
        statements.push(withdrawalStatement.result.code);
      }
    }
  }
  return statements;
}
async function writeWithdrawalStatement(data, realm_id, user_id) {
  const res = await db.withdrawal_statement.create({
    transfer_id: data.transfer_id,
    code: data.code,
    generation_date: new Date()
  });
  return !!res;
}

export default {
  downloadWithdrawalStatements,
  writeWithdrawalStatement
};
