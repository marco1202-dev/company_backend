'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add role column to users table
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM(
        'Super Administrator',
        'Casino Owner',
        'Internal Functions',
        'Country Manager',
        'Affiliate',
        'Sub-Affiliate',
        'Portal'
      ),
      allowNull: false,
      defaultValue: 'Portal',
      after: 'securityAnswerHash'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove role column from users table
    await queryInterface.removeColumn('users', 'role');

    // Drop the ENUM type
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_users_role\";");
  }
}; 