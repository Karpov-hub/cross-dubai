"use strict";
module.exports = (sequelize, DataTypes) => {
  const realmdepartment = sequelize.define(
    "realmdepartment",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      realm: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "realm",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      realm_acc: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "realmaccount",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      status: DataTypes.STRING(20),
      bank_details: DataTypes.TEXT,
      director: DataTypes.STRING(100),
      address: DataTypes.STRING,
      register: DataTypes.STRING,
      tax_number: DataTypes.STRING(20),
      vat_id: DataTypes.STRING(20),
      bank_id: DataTypes.JSON,
      ot_proforma_invoice_eur: DataTypes.INTEGER,
      ot_proforma_invoice_usd: DataTypes.INTEGER,
      phone: DataTypes.STRING(20),
      country: DataTypes.STRING,
      zip: DataTypes.STRING,
      city: DataTypes.STRING,
      street: DataTypes.STRING,
      house: DataTypes.STRING,
      additional_info: DataTypes.STRING,

      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON
    },
    { createdAt: "ctime", updatedAt: "mtime", deletedAt: false }
  );
  realmdepartment.associate = function(models) {
    realmdepartment.belongsTo(models.realmaccount, {
      foreignKey: "realm_acc",
      targetKey: "id"
    });
  };
  return realmdepartment;
};
