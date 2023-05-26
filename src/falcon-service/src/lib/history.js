import Request from "./request.js";

function _getPath(data) {
  // if there is any filters use max number of results
  if (data._filters && data._filters.length) {
    data.limit = "1000";
  }

  let path = `/ledger/${data.limit || data.move ? "?" : ""}${
    data.move ? `cursor=${data.move}` : ""
  }${data.limit && data.move ? "&" : ""}${
    data.limit ? `limit=${data.limit}` : ""
  }`;

  // select all records for period
  if (data.date_from && data.date_to) {
    const fromDate = new Date(data.date_from).toISOString();
    let toDate = new Date(data.date_to);
    toDate = new Date(toDate.setDate(toDate.getDate() + 1)).toISOString();
    path += `&created__gte=${fromDate}&created__lt=${toDate}`;
  }

  // select all records for specified day
  if (data.created) {
    const fromDate = new Date(data.created).toISOString();
    let toDate = new Date(fromDate);
    toDate = new Date(toDate.setDate(toDate.getDate() + 1)).toISOString();
    path += `&created__gte=${fromDate}&created__lt=${toDate}`;
  }

  const NIL_CURRENCY_ALIAS = {
    USDT: "UST",
    USDC: "USC"
  };

  if (data.currency) {
    path += `&currency=${NIL_CURRENCY_ALIAS[data.currency] || data.currency}`;
  }

  return path;
}

async function getTxHistory(data, realm, out = []) {
  const path = _getPath(data);

  let { link, body } = await Request.sendCursorRequest(path);

  if (body.errors && body.errors[0].code == 1100) {
    return { err_code: 1100 };
  }

  out.push(...body);

  /* START POST FILTERS */
  if (data.reference) {
    body = body.filter((item) => {
      return item.reference == data.reference;
    });
  }

  if (data.amount) {
    body = body.filter((item) => {
      return item.amount == data.amount;
    });
  }

  if (data.transaction_id) {
    body = body.filter((item) => {
      return item.transaction_id == data.transaction_id;
    });
  }
  /* END POST FILTERS */

  let links = [];
  const links_obj = {
    next: "",
    previous: ""
  };

  if (link) {
    links = link.split(",");
  }

  for (let str of links) {
    if (str.includes("cursor")) {
      links_obj[str.includes("next") ? "next" : "previous"] = str.substring(
        str.indexOf("cursor") + 7,
        str.indexOf("&limit")
      );
    }
  }

  const fetchAll = (data, links_obj, out) => {
    if (!links_obj.next) {
      return { body: out, links: links_obj };
    }
    data.move = links_obj.next;
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(await getTxHistory(data, null, out));
      }, 2000);
    });
  };

  if (data._filters && data._filters.length) {
    return await fetchAll(data, links_obj, out);
  }

  return { body, links: links_obj };
}

export default {
  getTxHistory
};
