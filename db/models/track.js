'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrackedGood extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Scan, User }) {
      // define association here
      this.belongsTo(Scan, { foreignKey: 'scanId'});
      this.belongsTo(User, { foreignKey: 'userId'});
    }
  }
  TrackedGood.init({

  }, {
    sequelize,
    modelName: 'Track',
  });
  return TrackedGood;
};