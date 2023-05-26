import memstore from "@lib/memstore";
import express from "express";
import bodyParser from "body-parser";
import NilHistory from "./data/NilHistory.js";
import NilInstruments from "./data/NilInstruments.js";
import CurrencyCbr from "./data/CurrencyCbr.js";
import CurrencyPoloniex from "./data/CurrencyPoloniex.js";
import Coinex from "./data/Coinex.js";
import CurrencyMinApi from "./data/CurrencyMinapi.js";

const app = express();

app.use(bodyParser.json({ limit: "8mb" }));
app.use(
  bodyParser.urlencoded({ limit: "8mb", extended: true, parameterLimit: 8000 })
);

app.get(/^\/coin\/getWalletBalance\/[a-z0-9-]{1,}$/i, (req, res, done) => {
  res.send({
    result: { status: "COMPLETED", errors: null },
    currencyId: "USDT",
    amount: 6399.222825
  });
});
app.get("/coin/getWalletsBalance", (req, res, done) => {
  res.send({
    result: {
      status: "COMPLETED",
      errors: null
    },
    balanceInfo: [
      {
        address: "0x9b1c20148125fea571abe298b3bc41db9634daeb",
        balances: [
          {
            currencyId: "ETH",
            amount: 0.13820039509136497
          },
          {
            currencyId: "USDT",
            amount: 104.598836
          },
          {
            currencyId: "USDC",
            amount: 104.598836
          }
        ]
      }
    ]
  });
});

app.post("/coin/sendToProviderViaWallet", (req, res, done) => {
  NilHistory.splice(0, 0, {
    transaction_id: "e62538d5-4a54-4e0f-aa6e-94d954be11111",
    created: new Date().toISOString(),
    reference: "2021071401571111",
    currency: req.body.currencyId,
    amount: req.body.amount,
    type: "transfer",
    group: "trading"
  });
  res.send({
    requestId: req.body.requestId,
    fromAddress: req.body.fromAddress,
    toAddress: req.body.toAddress,
    currencyId: req.body.currencyId,
    amount: req.body.amount,
    txId: "0x6c922d9ac64eeda752f3440035371bc640687ec992e5ab4b5aa49e2d9453a111",
    systemFee: req.body.systemFee,
    appliedFee: null,
    appliedFeeCurrencyId: "ETH",
    result: {
      status: "COMPLETED",
      errors: null
    }
  });
});

app.post("/coin/createReceiveAddress", (req, res, done) => {
  res.send({ address: "1234567", walletId: "TEST" });
});

app.post("/coin/send", (req, res, done) => {
  res.send({ address: "1234567", walletId: "send" });
});

// Exchanging USDT --------------

app.post("/coinex/api/v1/user/auth", (req, res, done) => {
  res.send(Coinex.auth(req));
});

app.get("/coinex/api/v1/tx/getExchangePairs", (req, res, done) => {
  res.send(Coinex.getExchangePairs(req));
});

app.get("/coinex/api/v1/tx/getExchangeRate", (req, res, done) => {
  res.send(Coinex.getExchangeRate(req));
});

app.post("/coinex/api/v1/tx/createExchange", async (req, res, done) => {
  const log = await memstore.get("coinexTest");

  console.log("coinex log:", log);

  if (log == "1") res.send(Coinex.createExchange_error(req));
  else res.send(Coinex.createExchange(req));
});

// End Exchanging USDT --------------

app.post("/coin/sendViaWallet", async (req, res, done) => {
  await memstore.set("sendViaWallet", req.body.amount);

  res.send({
    fromAddress: "111111",
    toAddress: req.body.toAddress,
    currencyId: "USDT",
    amount: req.body.amount,
    txId: "0x50fa0fcd8502e0f6e5772b7d1acb90d8856fc4a104ae9e2d0ae2ea72b35223aa",
    appliedFee: 0.000108099,
    appliedFeeCurrencyId: "ETH",
    result: {
      status: "COMPLETED",
      errors: null
    }
  });
});

app.get("/coin/getLatestFee", (req, res, done) => {
  res.send({
    result: { status: "COMPLETED", errors: null },
    gasPriceGwei: null,
    gasLimit: null,
    feePerKbSat: "123570",
    size: "373",
    fee: {
      TRX: "50.001",
      ETH: "0.202",
      BTC: "0.00045879",
      EUR: "11.5060",
      USD: "14.0518"
    }
  });
});

app.get("/coin/getMasterAddress", (req, res, done) => {
  res.send({ address: "111111", walletId: "TEST" });
});

app.post("/coin/getMonitorReceiveAddress", (req, res, done) => {
  res.send({ address: "222222", walletId: "TEST" });
});

app.get("/coin/getMonitorReceiveAddress", (req, res, done) => {
  res.send({ address: "222222", walletId: "TEST" });
});

// NIL mockup
app.get("/nil/instruments/", (req, res, done) => {
  res.send(NilInstruments);
});

app.post("/nil/request_for_quote/", (req, res, done) => {
  res.send({
    created: "2021-04-02T11:35:19.485610Z",
    valid_until: "2021-04-02T11:35:40.485168Z",
    rfq_id: "f6f1f4c5-be1f-44c1-bb91-39b0160fc2c0",
    client_rfq_id: "f6abd32f-67fb-412f-b7d2-c8c1a4543b6f",
    quantity: req.body.quantity,
    side: "buy",
    instrument: "USTEUR.SPOT",
    price: "0.85056000"
  });
});

app.post("/nil/withdrawal/", async (req, res, done) => {
  await memstore.set("nilWithdrawal", req.body.amount);

  if (req.body.amount < 25000) {
    res.send({
      errors: [
        {
          field: "non_field_errors",
          message:
            "Settlement request is too small, the minimum amount is 25000 USD worth.",
          code: 1024
        }
      ]
    });
    return;
  }

  res.send({
    withdrawal_id: "3b1f428f-a36a-44a9-bd26-82d2d2992032",
    amount: req.body.amount,
    currency: req.body.currency,
    reference: "",
    destination_address: {
      address_value: req.body.destination_address.address_value,
      address_suffix: "USDT ERC 21",
      address_protocol: "ERC20"
    },
    destination_bank_account: null
  });
});

app.get("/nil/ledger/", (req, res, done) => {
  res.send(NilHistory);
});

app.post("/nil/order/", (req, res, done) => {
  res.send({
    order_id: "2f0515cf-6622-46b2-a3ca-4b8629678df5",
    client_order_id: req.body.client_order_id,
    instrument: req.body.instrument,
    price: req.body.price || 0.87,
    executed_price: req.body.price || 0.87,
    quantity: req.body.quantity,
    side: req.body.side,
    order_type: req.body.order_type,
    created: "2021-04-06T11:41:20.812128Z",
    executing_unit: req.body.executing_unit,
    trades: [
      {
        trade_id: "d340a7d8-ceec-47e8-9b71-5adcf50306bc",
        rfq_id: null,
        cfd_contract: null,
        order: "2f0515cf-6622-46b2-a3ca-4b8629678df5",
        quantity: req.body.quantity,
        side: req.body.side,
        instrument: req.body.instrument,
        price: req.body.price || 0.87,
        created: "2021-04-06T11:41:20.814802Z",
        origin: "rest",
        executing_unit: req.body.executing_unit
      }
    ]
  });
});

// Currency services
app.get("/currency/cbr/", (req, res, done) => {
  res.send(CurrencyCbr);
});

app.get("/currency/poloniex/", (req, res, done) => {
  res.send(CurrencyPoloniex);
});

app.get("/currency/minapi/", (req, res, done) => {
  res.send(CurrencyMinApi);
});

app.post("/coin/v2/sendViaMixer", (req, res, done) => {
  res.send({
    result: {
      status: "PENDING",
      errors: null
    },
    requestId: "311022_210",
    fromAddress: "test_address_chain_from",
    toAddress: "test_address_chain_to",
    currencyId: "USDT",
    amount: 10.8,
    txId: null,
    appliedFee: null,
    appliedFeeCurrencyId: null,
    nonce: null,
    mixerAddresses: ["1", "2", "3"]
  });
});

app.use((req, res, done) => {
  memstore.set("test", JSON.stringify(req.body));
  res.send({ success: true });
});

const server = app.listen(8010, () => {
  console.log("Test callback receiver is running at %s", server.address().port);
});
