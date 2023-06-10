const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cohort = sequelize.define("cohort", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    description:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Cohort;