const jwt = require('jwt-simple')

const Sequelize = require('sequelize')
// don't have to put .js at the end since node knows to look for .js files
const sqlDatabase = require('../database')
const bcrypt = require('bcrypt')
const shushshushsecret = 'jnkrgasdfvjhnkargdbv;jewadsjkwefa;ndjk greafubildhjgeraj9po7g5yubhw4esrhg ,dfbubh4awefbszvlinujgservbuziz shjhublrefrug hbueljksdvhuw albs'

const User = sqlDatabase.define( 'user', {
    userName: {
        type: Sequelize.STRING
    },
    password_digest: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.VIRTUAL,
        set: function(value){
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(value, salt)
            this.setDataValue('password_digest', hash)
        }
    },
    auth_token: {
        type: Sequelize.VIRTUAL,
        get: function(){
            return jwt.encode( {id: this.id} , shushshushsecret)
        }
    },
    wins: {
        type: Sequelize.INTEGER
    }
})

module.exports = User