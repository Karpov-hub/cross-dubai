Ext.define("Crm.modules.banks.model.BanksModel", {
  extend: "Crm.classes.DataModel",

  collection: "banks",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "shortname",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "swift",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "address1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "zip_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "apartment_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "zip_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "apartment_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "notes",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    // {
    //   name: "active",
    //   type: "boolean",
    //   filterable: true,
    //   editable: true,
    //   visible: true
    // },
    {
      name: "corr_bank",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "corr_swift",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "corr_acc",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "falcon_bank",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  beforeRemove(data, cb) {
    let me = this;
    if (!data || !data.length) {
      return cb(data);
    }
    const id = data[0];
    [
      function(call) {
        me.src.db.query(
          `select id, r.bank_id as bank_id from realmdepartments r`,
          [],
          (err, res) => {
            if (err) {
              console.error(err);
            }
            if (res && res.length) {
              const ids = res.filter((item) => item.bank_id);
              call(ids);
            }
          }
        );
      },
      function(departments) {
        if (departments && departments.length) {
          for (const item of departments) {
            if (item.bank_id.map((el) => el == id)) {
              item.bank_id = item.bank_id.filter((el) => el != id);
              let sql = `update realmdepartments set bank_id = '{"_arr":["`;
              if (item.bank_id && item.bank_id.length) {
                sql += `${item.bank_id.join('","')}`;
              }
              sql += `"]}'::JSON where id = $1`;
              const placeHolders = [item.id];
              me.src.db.query(sql, placeHolders, (err, res) => {
                if (err) {
                  console.error(
                    `BanksModel.js beforeRemove fn, error : ${err}`
                  );
                }
                return cb(data);
              });
            }
          }
        }
      }
    ].runEach();
  }
});
