const moment = require('moment')
const { DataTypes } = require('sequelize')

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        uid: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        direction: {
            type: DataTypes.INTEGER,
        },
        file: {
            type: DataTypes.STRING,
        },
    }, {
        // Other model options go here
    })
}