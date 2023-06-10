const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Face = sequelize.define("face", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    label:{
        type: Sequelize.STRING,
        allowNull: false
    },
    descriptions:{
        type: Sequelize.JSON,
        allowNull: false
    }
});

module.exports = Face;