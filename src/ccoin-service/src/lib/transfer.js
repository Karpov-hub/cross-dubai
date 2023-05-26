import Wallet from "./wallet";
import db from "@lib/db";

async function sendViaChain(data) {
  const wallet_src = data.planStep.from.extra;
  const wallet_dst = data.planStep.to.extra;

  const { wallets, chain_id } = await Wallet.getChainOfWallets({
    wallet_src,
    wallet_dst,
    user_id: data.payment.user_id,
    currency: data.planStep.from.currency
  });

  const dataToSend = {
    txId: data.payment.transfer.id,
    address_from: wallet_src,
    address_to: wallet_dst,
    chain_addresses: wallets,
    currency: data.planStep.to.currency,
    amount: data.txAmount
  };

  await _updateTransferData(data.payment.transfer);

  const res = await Wallet.sendViaMixer(dataToSend);

  if (res.success === true) {
    await _updateChainPaymentDate(chain_id);
  }

  return { amount: data.txAmount, net: res, accept: false };
}

async function _updateChainPaymentDate(id) {
  const chain = await db.wallet_chain.findOne({
    where: { id },
    attributes: ["first_payment_date"],
    raw: true
  });

  if (!chain.first_payment_date) {
    return await db.wallet_chain.update(
      { first_payment_date: new Date() },
      { where: { id } }
    );
  }

  return { success: true };
}

async function _updateTransferData(transfer) {
  return await db.transfer.update(
    {
      is_chain: true
    },
    {
      where: { id: transfer.id }
    }
  );
}

async function cancelChain(data) {
  const dataToSend = {
    requestId: data.transfer.id,
    currency: data.transfer.data.plan.to.currency
  };

  const res = await Wallet.cancelSendViaMixer(dataToSend);

  return res;
}

export default {
  sendViaChain,
  cancelChain
};
