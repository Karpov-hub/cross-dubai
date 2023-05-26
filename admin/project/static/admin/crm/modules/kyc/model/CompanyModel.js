Ext.define("Crm.modules.kyc.model.CompanyModel", {
  extend: "Crm.classes.DataModel",

  collection: "company_kycs",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "registrar_name",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "tax_number",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "business_type",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "registration_number",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "registration_country",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "registration_date",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "years_in_business",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "numbers_of_employees",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "incorporation_form",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "date_of_last_financial_activity_report",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "use_trade_licence",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "directors",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "shareholders",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "beneficial_owner",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "verified",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "file",
      type: "ObjectID",
      editable: true,
      visible: true
    }
  ],
  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    const files_id = data.map((item) => item.file);
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
      item.file.forEach((id) => {
        if (allFiles[id]) files.push(allFiles[id]);
      });
      item.file = files;
      return item;
    });
    callback(data);
  }
});
