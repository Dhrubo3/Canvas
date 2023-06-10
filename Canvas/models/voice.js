const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Voice = sequelize.define("Voice", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    questionAudioFileName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    questionAudioFilePath:{
        type: Sequelize.STRING,
        allowNull: false
    },
    questionText:{
        type: Sequelize.STRING(455),
        allowNull: false
    },
    answerAudioFileName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    answerAudioFilePath:{
        type: Sequelize.STRING,
        allowNull: false
    },
    answerText:{
        type: Sequelize.STRING(455),
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

module.exports = Voice;