const Sequelize = require('sequelize')
const sqlDatabase = require('../database')

const Message = sqlDatabase.define( 'message', {
    message: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    }
})

module.exports = Message