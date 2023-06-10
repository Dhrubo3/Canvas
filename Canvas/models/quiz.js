const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Quiz = sequelize.define("quiz", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    closeDate:{
        type: Sequelize.DATE,
        allowNull: false
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Quiz;