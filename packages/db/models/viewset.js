"use strict";
module.exports = (sequelize, DataTypes) => {
  const viewset = sequelize.define(
    "viewset",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING(50),
      sql: DataTypes.TEXT
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  viewset.associate = function(models) {
    // associations can be defined here
  };
  return viewset;
};
