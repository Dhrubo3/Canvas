const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cohort_Subcohort = sequelize.define(
    "Cohort_Subcohort", 
    {},
    {timestamps: false}
    );

module.exports = Cohort_Subcohort;