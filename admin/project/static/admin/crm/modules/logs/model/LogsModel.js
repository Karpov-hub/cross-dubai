/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */

Ext.define("Crm.modules.logs.model.LogsModel", {
  extend: "Crm.classes.DataModel",
  collection: "logs",
  removeAction: "remove",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "request",
      type: "text",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "responce",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "service",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "method",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ]

  // getData(params) {
  //   if (params._filters && Ext.isArray(params._filters) && params._filters[0]) {
  //     for (filter of params._filters)
  //       if (filter._id == "query") {
  //         params._filters.push(
  //           {
  //             _property: "request",
  //             _value: filter._value,
  //             _disableOnEmpty: false,
  //             _operator: "eq",
  //             _root: "data",
  //             _id: "request"
  //           }
  //           // {
  //           //   _property: "responce",
  //           //   _value: filter._value,
  //           //   _disableOnEmpty: false,
  //           //   // _operator: "eq",
  //           //   _root: "data",
  //           //   _id: "responce"
  //           // }
  //         );
  //       }
  //   }

  //   this.callParent(arguments);
  // }
});
