"use strict";
module.exports = (sequelize, DataTypes) => {
  const org_iban = sequelize.define(
    "org_iban",
    {
      org_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "merchant",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      iban_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "iban",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      },
      ctime: DataTypes.DATE
    },
    { createdAt: "ctime", updatedAt: false, deletedAt: false }
  );
  org_iban.removeAttribute("id");
  org_iban.associate = function(models) {
    org_iban.belongsTo(models.iban, {
      foreignKey: "iban_id",
      targetKey: "id"
    });
  };
  return org_iban;
};
