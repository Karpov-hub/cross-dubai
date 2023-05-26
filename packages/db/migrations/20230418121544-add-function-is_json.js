"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
      CREATE OR REPLACE FUNCTION is_json(input_text varchar) RETURNS boolean AS $$
      DECLARE
        maybe_json json;
      BEGIN
        BEGIN
          maybe_json := input_text;
        EXCEPTION WHEN others THEN
          RETURN FALSE;
        END;
    
        RETURN TRUE;
      END;
    $$ LANGUAGE plpgsql IMMUTABLE;    
      `
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `drop function is_json;`
    );
  }
};
