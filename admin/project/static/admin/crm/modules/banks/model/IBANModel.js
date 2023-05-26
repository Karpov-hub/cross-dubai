Ext.define("Crm.modules.banks.model.IBANModel", {
  extend: "Crm.classes.DataModel",

  collection: "ibans",
  idField: "id",
  // removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "owner",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "iban",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "verified_on_nil",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "nil_account_description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  async getAdditionDataForIBAN(data) {
    let ownerIDs = "";
    let bankIDs = "";
    let placeholders = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].owner) {
        if (ownerIDs.length) ownerIDs += `, `;
        placeholders.push(data[i].owner);
        ownerIDs += `$${placeholders.length}`;
      }
      if (data[i].bank_id) {
        if (bankIDs.length) bankIDs += `, `;
        placeholders.push(data[i].bank_id);
        bankIDs += `$${placeholders.length}`;
      }
    }

    let sqlFinal = `select (
        select json_agg(item)
        from(
            select id, first_name, last_name
            from users
            where id in (${ownerIDs})
        ) item
    ) as users`;

    if (bankIDs.length) {
      sqlFinal += `, (
        select json_agg(item)
        from(
            select b.name as bank_name, b.shortname as bank_shortname, b.swift, b.address1, b.country, b.id, c.name as country_name
            from banks b
            inner join countries c 
            on (c.abbr2 = b.country) 
            where b.id in (${bankIDs})
        ) item
    ) as banks`;
    }
    let banksData = await this.db.query(sqlFinal, placeholders);
    if (banksData && banksData[0].users == null) {
      sqlFinal = `select (
        select json_agg(item)
        from(
            select id, name
            from realms
            where id in (${ownerIDs})
        ) item
    ) as users`;
      if (bankIDs.length)
        sqlFinal += `, (
      select json_agg(item)
      from(
          select b.name as bank_name, b.shortname as bank_shortname, b.swift, b.address1, b.country, b.id, c.name as country_name
          from banks b
          inner join countries c
          on (c.abbr2 = b.country)
          where b.id in (${bankIDs})
      ) item
  ) as banks`;
      banksData = await this.db.query(sqlFinal, placeholders);
    }

    for (let item of data) {
      if (item.owner) {
        if (banksData[0].users) {
          let obj = banksData[0].users.find((el) => {
            return el.id == item.owner;
          });
          if (obj) {
            delete obj.id;
            Object.assign(item, obj);
          }
        }
      }
      if (item.bank_id) {
        let obj = banksData[0].banks.find((el) => {
          return el.id == item.bank_id;
        });
        if (obj) {
          delete obj.id;
          Object.assign(item, obj);
        }
      }
    }
    return data;
  },
  async afterGetData(data, callback) {
    /* */
    if (!data || !data.length) return callback(data);
    await this.getAdditionDataForIBAN(data);

    const files_id = data.map((item) => item.file_id);
    if (!files_id || !files_id.length) return callback(data);

    const allFiles = {};
    const res = await this.src.db
      .collection("providers")
      .findAll({ code: { $in: files_id } }, {});

    res.forEach((item) => {
      allFiles[item.code] = item;
    });
    data = data.map((item) => {
      let files = [];
      if (item.file_id && item.file_id.length)
        item.file_id.forEach((id) => {
          if (allFiles[id]) files.push(allFiles[id]);
        });
      item.file = files;
      return item;
    });
    callback(data);
  },

  /* scope:client */
  getIbansByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getIbansByUserId", { userId }, resolve);
    });
  },

  /* scope:server */
  async $getIbansByUserId(params, cb) {
    const res = await this.dbCollection.findAll(
      { owner: params.userId },
      {
        iban: 1,
        currency: 1,
        dflt: 1,
        notes: 1,
        bank_id: 1,
        file_id: 1,
        active: 1
      }
    );

    res.sort((a, b) => a.dflt > b.dflt);
    cb({ list: res });
  },

  /* scope:server */
  async $saveBankData(data, cb) {
    return cb(
      await this.src.db.collection("banks").update(
        { where: { id: data.bank_id } },
        {
          swift: data.swift,
          address1: data.address1,
          country: data.country
        }
      )
    );
  }
});
