const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Content = sequelize.define("content", {
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
    fileName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    originalFileName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    filePath:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Content;