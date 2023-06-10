const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Teacher = sequelize.define("teacher", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Teacher;