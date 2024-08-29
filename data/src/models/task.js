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
        dueAt: {
            type: DataTypes.DATE,
            get() {
                const rawValue = this.getDataValue('dueAt');
                return moment(rawValue).format('YYYY-MM-DD')
            },
        },
        description: {
            type: DataTypes.STRING,
        },
        file: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.INTEGER,
        },
    }, {
        // Other model options go here
    })
}