const Sequelize = require('sequelize')
const sqlDatabase = require('../database')

const Move = sqlDatabase.define( 'move', {
    move: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    }
})

module.exports = Move