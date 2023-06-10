const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const McqAnswer = sequelize.define("McqAnswer", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    answer:{
        type: Sequelize.STRING,
        allowNull: false
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = McqAnswer;