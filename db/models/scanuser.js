'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScanUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Scan, User}) {
      this.belongsTo(User, { foreignKey: 'userId' });
      this.belongsTo(Scan, { foreignKey: 'scanId' });
    }
  }
  ScanUser.init({
    userId: DataTypes.INTEGER,
    scanId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ScanUser',
  });
  return ScanUser;
};