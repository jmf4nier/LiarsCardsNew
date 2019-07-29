const Sequelize = require('sequelize')
const sqlDatabase = require('../database')

const Message = sqlDatabase.define( 'message', {
    message: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    }
})

module.exports = Message