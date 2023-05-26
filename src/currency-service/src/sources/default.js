// Read all currencyies: fiat + crypto
import ecb from "../lib/ecb";
import minapi from "../lib/minapi";

async function getData() {
  const fiat = await ecb.getData();
  const crypto = await minapi.getData();
  let out = fiat.concat(crypto);
  return out;
}

export default {
  getData
};
