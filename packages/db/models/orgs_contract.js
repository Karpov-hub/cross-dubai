"use strict";
module.exports = (sequelize, DataTypes) => {
  const orgs_contract = sequelize.define(
    "orgs_contract",
    {
      owner_id: {
        type: DataTypes.UUID
      },
      contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        foreignKey: true,
        references: {
          model: "contract",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      }
    },
    { createdAt: false, updatedAt: false, deletedAt: false }
  );
  orgs_contract.removeAttribute("id");
  orgs_contract.associate = function(models) {
    orgs_contract.belongsTo(models.contract, {
      foreignKey: "contract_id",
      targetKey: "id"
    });
  };
  return orgs_contract;
};
