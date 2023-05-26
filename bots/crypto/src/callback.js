import Base from "./lib/base";
import api from "./lib/paymentApi";

export default class Form extends Base {
  async serve(req, res) {
    /*const data = {
      currencyId: "BTC",
      amount: 0.001,
      txId: "d427ba4c4e205883c793c81ea5e0abf27b2c4e3e9e668106c294f61ddc1b79f7",
      address: "mjthhov6V4e41Lk92c13P7unfpvJqdkfQr",
      tag: null,
      confirmations: 1,
      txStatus: "COMPLETED",
      sign: "T+WTBlZA1F1iXHdQdyobeSDNZ0lTLK22uquSiL27PJU=",
      networkFee: null,
      networkFeeCurrencyId: null
    };
    //*/ const data = {
      ...req.body
    };

    //console.log("input:", data);

    const send = (data) => {
      this.send(res, data);
    };

    if (data.txStatus != "COMPLETED")
      return send({ success: false, mess: "Tx status is not COMPLETED" });

    try {
      const result = await api.callService("ccoin-service", "deposit", data);
      if (result) return send({ success: true });
    } catch (e) {}

    send({ success: false });
  }
}

/*
Example
{
  currencyId: 'BTC',
  amount: 0.001,
  txId: 'd427ba4c4e205883c793c81ea5e0abf27b2c4e3e9e668106c294f61ddc1b79f7',
  address: 'mjthhov6V4e41Lk92c13P7unfpvJqdkfQr',
  tag: null,
  confirmations: 1,
  txStatus: 'COMPLETED',
  sign: 'T+WTBlZA1F1iXHdQdyobeSDNZ0lTLK22uquSiL27PJU=',
  networkFee: null,
  networkFeeCurrencyId: null
}
*/
