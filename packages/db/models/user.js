"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      tariff: DataTypes.UUID,
      variables: DataTypes.JSON,
      type: DataTypes.INTEGER,
      pass: DataTypes.STRING(100),
      login: DataTypes.STRING(100),
      email: DataTypes.STRING(100),
      first_name: DataTypes.STRING(50),
      last_name: DataTypes.STRING(50),
      middle_name: DataTypes.STRING(50),
      birthday: DataTypes.DATE,
      countries: DataTypes.STRING,
      legalname: DataTypes.STRING(150),
      realm: DataTypes.UUID,
      base32secret: DataTypes.STRING(255),
      activated: DataTypes.BOOLEAN,
      country: DataTypes.STRING(2),
      keyword: DataTypes.STRING,
      addr1_zip: DataTypes.STRING(15),
      addr1_address: DataTypes.STRING(150),
      addr2_zip: DataTypes.STRING(15),
      addr2_address: DataTypes.STRING(150),
      notes: DataTypes.STRING(255),
      google_auth: DataTypes.BOOLEAN,
      activatecode: DataTypes.STRING(100),
      avatar_id: DataTypes.UUID,
      legal_confirmation: DataTypes.BOOLEAN,
      registred_using_bot: DataTypes.BOOLEAN,
      website: DataTypes.STRING(255),
      secret_question: DataTypes.STRING(255),
      secret_answer: DataTypes.STRING(255),
      referral_link: DataTypes.STRING(255),
      chat_id: DataTypes.STRING(255),
      otp_transport: DataTypes.STRING(20),
      signobject: DataTypes.JSON,
      blocked: DataTypes.BOOLEAN,
      kyc: DataTypes.BOOLEAN,
      ip: DataTypes.JSON,
      ref_user: DataTypes.UUID,
      phone: DataTypes.STRING(20),
      cookie: DataTypes.BOOLEAN,
      sumsub_id: DataTypes.STRING(50),
      fa: DataTypes.INTEGER,
      zip_addr1: DataTypes.STRING(15),
      city_addr1: DataTypes.STRING(40),
      street_addr1: DataTypes.STRING(40),
      house_addr1: DataTypes.STRING(20),
      apartment_addr1: DataTypes.STRING(20),
      zip_addr2: DataTypes.STRING(15),
      city_addr2: DataTypes.STRING(40),
      street_addr2: DataTypes.STRING(40),
      house_addr2: DataTypes.STRING(20),
      payment_details: DataTypes.STRING,
      apartment_addr2: DataTypes.STRING(20),
      temp_pass: DataTypes.STRING(100),
      pass_chng_date: DataTypes.DATE,
      citizenship: DataTypes.STRING(20),
      gender: DataTypes.STRING(10),
      legal_id: DataTypes.STRING,
      person_function: DataTypes.STRING,
      wcc: DataTypes.STRING,
      order_counter: DataTypes.INTEGER,
      communication_lang: DataTypes.STRING(3),
      role: {
        type: DataTypes.UUID,
        allowNull: true,
        foreignKey: true,
        references: {
          model: "client_role",
          key: "id"
        },
        onUpdate: "cascade",
        onDelete: "cascade"
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  user.associate = function(models) {
    user.belongsTo(models.account, {
      foreignKey: "id",
      targetKey: "owner"
    });
    // associations can be defined here
  };
  user.adminModelName = "Crm.modules.accountHolders.model.UsersModel";
  return user;
};
