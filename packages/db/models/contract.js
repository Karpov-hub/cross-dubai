"use strict";
module.exports = (sequelize, DataTypes) => {
  const contract = sequelize.define(
    "contract",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      name: DataTypes.STRING(50),
      description: DataTypes.STRING,
      memo: DataTypes.STRING,
      automatic_renewal: DataTypes.BOOLEAN,
      code: DataTypes.UUID,
      status: DataTypes.STRING(20),
      contract_date: DataTypes.DATE,
      expiration_date: DataTypes.DATE,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      contract_subject: DataTypes.STRING(100),
      director_name: DataTypes.STRING,
      director_name_history: DataTypes.JSON,
      tariff: DataTypes.UUID,
      variables: DataTypes.JSON,
      other_signatories: DataTypes.JSONB
    },
    { createdAt: "ctime", updatedAt: false, deletedAt: false }
  );
  contract.associate = function(models) {
    // associations can be defined here
  };
  return contract;
};
