'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScanGoods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scanId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Scans',
          key: 'id'
        },
      },
      goodId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Goods',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScanGoods');
  }
};