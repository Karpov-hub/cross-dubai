module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn("account_crypto", "abbr", {
          type: Sequelize.STRING(4)
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn("account_crypto", "abbr", {
          type: Sequelize.STRING(3)
        })
      ]);
    });
  }
};
