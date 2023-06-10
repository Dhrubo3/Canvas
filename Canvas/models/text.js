const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Text = sequelize.define("text", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    question:{
        type: Sequelize.STRING,
        allowNull: false
    },
    correctAnswer:{
        type: Sequelize.STRING,
        allowNull: false
    },
    questionFromPage:{
        type: Sequelize.STRING,
        allowNull: false
    },
    questionFromSection:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Text;