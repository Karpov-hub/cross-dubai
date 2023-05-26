// Read all currencyies: fiat + crypto
import ecb from "../lib/ecb";

async function getData() {
  return await ecb.getData();
}

export default {
  getData
};
