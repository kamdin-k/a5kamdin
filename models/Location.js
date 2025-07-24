const { Sequelize } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Location", {
    name: Sequelize.TEXT,
    category: Sequelize.TEXT,
    address: Sequelize.TEXT,
    comments: Sequelize.TEXT,
    image: Sequelize.TEXT
  }, {
    createdAt: false,
    updatedAt: false
  });
};