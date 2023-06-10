const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const ReadingTime = sequelize.define("ReadingTime", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    page:{
        type: Sequelize.STRING,
        allowNull: false
    },
    section:{
        type: Sequelize.STRING,
        allowNull: false
    },
    time:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
});

module.exports = ReadingTime;