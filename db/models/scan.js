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
    static associate({ Track, ScanGood, ScanUser, Good, User }) {
      this.hasMany(Track);

      this.belongsToMany(Good, {
        through: ScanGood,
        foreignKey: 'scanId',
        otherKey: 'goodId'
      });

      this.belongsToMany(User, {
        through: ScanUser,
        foreignKey: 'scanId',
        otherKey: 'userId'
      });
    }
  }
  Scan.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    last_scan_at: DataTypes.DATE,
    query_text: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Scan',
  });
  return Scan;
};