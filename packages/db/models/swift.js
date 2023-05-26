"use strict";
module.exports = (sequelize, DataTypes) => {
  const swift = sequelize.define(
    "swift",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      country: DataTypes.STRING,
      country_code: DataTypes.STRING,
      city: DataTypes.STRING,
      bank: DataTypes.STRING,
      swift_code: DataTypes.STRING,
      branch: DataTypes.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true,
    }
  );
  swift.associate = function(models) {
    // associations can be defined here
  };
  return swift;
};
