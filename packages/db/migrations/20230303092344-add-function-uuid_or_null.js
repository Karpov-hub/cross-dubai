"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION uuid_or_null(str text)
    RETURNS uuid AS $$
    BEGIN
      RETURN str::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    `);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP FUNCTION uuid_or_null;`);
  }
};
