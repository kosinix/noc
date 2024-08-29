//// Core modules

//// External modules
const { Sequelize } = require('sequelize')
const moment = require('moment')

module.exports = {
    connect: async () => {
        try {

            const sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: CONFIG.sqlite.db,
                logging: false,
            });

            await sequelize.authenticate()
            console.log(`${moment().format('YYYY-MMM-DD hh:mm:ss A')}: Database connected.`);

            return sequelize
        } catch (error) {
            console.log('Connection error:', error.message)
        }
    },
    attachModels: async (sequelize) => {
        try {
            return {
                Permission: require('./models/permission')('Permission', sequelize),
                Role: require('./models/role')('Role', sequelize),
                User: require('./models/user')('User', sequelize),
                Document: require('./models/document')('Document', sequelize),
                Event: require('./models/event')('Event', sequelize),
                Task: require('./models/task')('Task', sequelize),
            }
        } catch (error) {
            console.log('Connection error:', error.message)
        }
    }
}