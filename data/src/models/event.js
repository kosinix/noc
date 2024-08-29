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
        eventAt: {
            type: DataTypes.DATE,
            get() {
                const rawValue = this.getDataValue('eventAt');
                return moment(rawValue).format('YYYY-MM-DD')
            },
        },
        description: {
            type: DataTypes.STRING,
        },
        file: {
            type: DataTypes.STRING,
        },
    }, {
        // Other model options go here
    })
}
