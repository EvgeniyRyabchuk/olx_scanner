'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Scan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Track, ScanGood, Good  }) {
      this.hasMany(Track);

      this.belongsToMany(Good, {
        through: ScanGood,
        foreignKey: 'scanId',
        otherKey: 'goodId'
      });
    }
  }
  Scan.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    last_scan_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Scan',
  });
  return Scan;
};