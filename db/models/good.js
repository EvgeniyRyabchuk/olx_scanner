'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Good extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Scan, ScanGood }) {
      this.belongsToMany(Scan, {
        through: ScanGood,
        foreignKey: 'goodId',
        otherKey: 'scanId'
      });
    }
  }
  Good.init({
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    img_url: DataTypes.STRING,
    price_uah: DataTypes.DECIMAL,
    location: DataTypes.STRING,
    state: DataTypes.STRING,
    fixed: DataTypes.STRING,
    post_created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Good',
  });
  return Good;
};