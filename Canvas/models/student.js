const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Student = sequelize.define("student", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Student;