const Sequelize = require('sequelize')
const sqlDatabase = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})
sqlDatabase.authenticate()
.then( ()=> console.log("Connection established"))

module.exports = sqlDatabase