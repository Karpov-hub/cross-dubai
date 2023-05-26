import config from "@lib/config";
import WAValidator1 from "trezor-address-validator";
import WAValidator2 from "multicoin-address-validator";
import db from "@lib/db";

/**
 * ----- ^ ABOUT PACKAGES BELOW ^ -----
 * important to use both of them because in trezor we have a division usdt/trc20 and usdt/erc20
 * and in multicoin we have Polkadot/DOT currency which is not presented in trezor
 */
async function validateAddresses({ addresses, currency }, realm, user) {
  for (let address of addresses)
    if (!validateCryptoAddress(address, currency)) return { valid: false };
  return { valid: true };
}

async function validateAddress(data, realm, user) {
  return { valid: validateCryptoAddress(data.address, data.currency) };
}

function validateCryptoAddress(address, currency) {
  if (
    WAValidator1.findCurrency(
      config.CRYPTO_CURRENCY_VALIDATION_ALIAS[currency] ||
        currency.toLowerCase()
    )
  )
    return WAValidator1.validate(
      address,
      config.CRYPTO_CURRENCY_VALIDATION_ALIAS[currency] ||
        currency.toLowerCase(),
      config.VALIDATOR_NETWORK_TYPE
    );
  return WAValidator2.validate(address, currency.toLowerCase(), {
    networkType: config.VALIDATOR_NETWORK_TYPE
  });
}

async function getValidCurrenciesForAddress(data, realm, user) {
  const where = {
    crypto: true
  };

  if (user) {
    where.ui_active = true;
  } else if (!data.check_address) {
    where.ap_active = true;
  }

  const currenies = await db.currency.findAll({
    where,
    attributes: ["abbr"],
    raw: true
  });

  const out = [];
  for (const currency of currenies) {
    if (validateCryptoAddress(data.address, currency.abbr)) {
      out.push(currency.abbr);
    }
  }

  return out;
}

async function getValidAddressesForCurrency(data, realm, user) {
  const out = [];

  for (const address of data.addresses) {
    if (validateCryptoAddress(address, data.currency)) {
      out.push(address);
    }
  }

  return out;
}

export default {
  validateAddress,
  validateAddresses,
  validateCryptoAddress,
  getValidCurrenciesForAddress,
  getValidAddressesForCurrency
};
