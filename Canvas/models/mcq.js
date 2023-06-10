const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Mcq = sequelize.define("mcq", {
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
    optionA:{
        type: Sequelize.STRING,
        allowNull: false
    },
    optionB:{
        type: Sequelize.STRING,
        allowNull: false
    },
    optionC:{
        type: Sequelize.STRING,
        allowNull: false
    },
    optionD:{
        type: Sequelize.STRING,
        allowNull: false
    },
    correctOption:{
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

module.exports = Mcq;