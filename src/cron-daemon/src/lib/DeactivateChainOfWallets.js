import db from "@lib/db";
import moment from "moment";

const Op = db.Sequelize.Op;

const time = "0 */12 * * *"; // At minute 0 past every 12th hour
const description = "Deactivate chain of wallets";

async function run() {
  console.log(description);

  try {
    const activeChains = await db.wallet_chain.findAll({
      where: {
        status: db.wallet_chain.STATUSES.ACTIVE,
        first_payment_date: {
          [Op.not]: null
        },
        removed: 0
      },
      raw: true,
      attributes: ["id", "first_payment_date", "lifespan"]
    });

    for (const chain of activeChains) {
      const end = moment(chain.first_payment_date).add(chain.lifespan, "days");
      if (moment(new Date()) > end) {
        await db.wallet_chain.update(
          { status: db.wallet_chain.STATUSES.DEACTIVATED },
          {
            where: {
              id: chain.id
            }
          }
        );
      }
    }
  } catch (error) {
    console.log("deactivateChainOfWallets.js:", error);
  }

  return { success: true };
}

export default {
  time,
  description,
  run
};
