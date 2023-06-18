'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Goods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      img_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fixed: {
        type: Sequelize.STRING,
        allowNull: true
      },
      post_created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      price_uah: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Goods');
  }
};