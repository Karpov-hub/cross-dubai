"use strict";
module.exports = (sequelize, DataTypes) => {
  const campaign = sequelize.define(
    "campaign",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      external_id: DataTypes.STRING,
      caption: DataTypes.STRING,
      signobject: DataTypes.JSON,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      ltime: DataTypes.BIGINT,
      stime: DataTypes.BIGINT,
      removed: DataTypes.INTEGER,
      maker: DataTypes.UUID,
      merchant_id: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  campaign.associate = function(models) {
    // associations can be defined here
    campaign.belongsTo(models.merchant, {
      foreignKey: "merchant_id",
      targetKey: "id"
    });
  };

  return campaign;
};
