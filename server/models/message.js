const Sequelize = require('sequelize')
const sqlDatabase = require('../database')

const Message = sqlDatabase.define( 'message', {
    message: {
        type: Sequelize.STRING
    },
    userName: {
        type: Sequelize.STRING
    }
})

module.exports = Message