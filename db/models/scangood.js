'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScanGood extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Good, Scan }) {
      this.belongsTo(Good, { foreignKey: 'goodId' });
      this.belongsTo(Scan, { foreignKey: 'scanId' });
    }
  }
  ScanGood.init({
    scanId: DataTypes.INTEGER,
    goodId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ScanGood',
  });
  return ScanGood;
};