let token;

function checkToken(req) {
  console.log(req.body);
  return;
}

function auth(data) {
  token = Date.now();
  return {
    result: {
      status: "COMPLETED",
      errors: null
    },
    token: {
      accessToken: "111111",
      tokenType: "Bearer"
    }
  };
}

function getExchangePairs(req) {
  const r = checkToken(req);
  if (r) return r;
  return {
    exchangePairs: [
      {
        from: "ETH_USDT",
        to: "TRX_USDT",
        tradeMin: 10
      },
      {
        from: "TRX_USDT",
        to: "ETH_USDT",
        tradeMin: 10
      },
      {
        from: "ETH_USDC",
        to: "TRX_USDC",
        tradeMin: 10
      },
      {
        from: "TRX_USDC",
        to: "ETH_USDC",
        tradeMin: 10
      },
      {
        from: "BTC",
        to: "TRX_USDT",
        tradeMin: 0.0005322
      },
      {
        from: "TRX_USDT",
        to: "BTC",
        tradeMin: 10
      },
      {
        from: "BTC",
        to: "ETH_USDT",
        tradeMin: 0.0005322
      },
      {
        from: "ETH_USDT",
        to: "BTC",
        tradeMin: 10
      },
      {
        from: "TRX_USDT",
        to: "TRX",
        tradeMin: 10
      },
      {
        from: "TRX",
        to: "TRX_USDT",
        tradeMin: 165.4533422
      },
      {
        from: "ETH",
        to: "ETH_USDT",
        tradeMin: 0.0065813
      },
      {
        from: "ETH_USDT",
        to: "ETH",
        tradeMin: 10
      },
      {
        from: "BTC",
        to: "ETH",
        tradeMin: 0.0001
      },
      {
        from: "ETH",
        to: "BTC",
        tradeMin: 0.00494627
      },
      {
        from: "BTC",
        to: "TRX",
        tradeMin: 0.0001
      },
      {
        from: "TRX",
        to: "BTC",
        tradeMin: 124.6105919
      }
    ],
    result: {
      status: "COMPLETED",
      errors: null
    }
  };
}

function getExchangeRate(req) {
  const r = checkToken(req);
  if (r) return r;
  return {
    fromCurrency: "ETH_USDT",
    fromAmount: 100,
    toCurrency: "TRX_USDT",
    exchangeFee: 1,
    networkFee: 1,
    toAmount: 99,
    result: {
      status: "COMPLETED",
      errors: null
    }
  };
}

let log = 0;

function createExchange(req) {
  const r = checkToken(req);
  if (r) return r;
  return {
    id: "5fdb3c03cef94d929e2ec7685f2de629",
    requestId: "270522_2320",
    depositAddress: log++ % 2 ? "TKsSMQgq7os57GECtQvHAd5yamy5V2jSw1" : null,
    depositCurrency: "TRX_USDT",
    depositAmount: 11,
    result: {
      status: "PENDING",
      errors: null
    }
  };
}

function createExchange_error(req) {
  return {
    id: "5fdb3c03cef94d929e2ec7685f2de629",
    requestId: "270522_2321",
    depositAddress: null,
    depositCurrency: "TRX_USDT",
    depositAmount: 11,
    result: {
      status: "ERROR",
      errors: {
        message: "Amount should be more then 52 usdt"
      }
    }
  };
}

export default {
  auth,
  getExchangePairs,
  getExchangeRate,
  createExchange,
  createExchange_error
};
