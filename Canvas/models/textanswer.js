const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const TextAnswer = sequelize.define("textAnswer", {
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

module.exports = TextAnswer;