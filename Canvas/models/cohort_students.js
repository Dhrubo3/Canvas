const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cohort_Students = sequelize.define(
    "Cohort_Students",
    {},
    {timestamps: false}
    );

module.exports = Cohort_Students;