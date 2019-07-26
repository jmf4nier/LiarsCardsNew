const Sequelize = require('sequelize')
// don't have to put .js at the end since node knows to look for .js files
const sqlDatabase = require('../database')

const User = sqlDatabase.define( 'user', {
    userName: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    wins: {
        type: Sequelize.INTEGER
    }
})

module.exports = User