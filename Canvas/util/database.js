const Sequelize = require("sequelize");

const sequelize = new Sequelize("cse327", "root", "123456", {
    dialect: "mysql", host: "localhost"
});

module.exports = sequelize;