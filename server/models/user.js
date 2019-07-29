const jwt = require('jwt-simple')

const Sequelize = require('sequelize')

const sqlDatabase = require('../database')
const bcrypt = require('bcrypt')
const shushshushsecret = 'jnkrgasdfvjhnkargdbv;jewadsjkwefa;ndjk greafubildhjgeraj9po7g5yubhw4esrhg ,dfbubh4awefbszvlinujgservbuziz shjhublrefrug hbueljksdvhuw albs'



const User = sqlDatabase.define( 'user', {
    username: {
        type: Sequelize.STRING
    },
    
    wins: {
        type: Sequelize.INTEGER
    },
    password_digest:{
        type: Sequelize.STRING
    }, 
    password:{
        type: Sequelize.VIRTUAL,
        set: function(value){
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password_digest', hash)

        }
    },
    auth_token:{
        type: Sequelize.VIRTUAL,
        get: function(){
            return jwt.encode({ id: this.id}, 'akdsjfljdfi3')
        }
    }
})

module.exports = User



// const bcrypt = require('bcrypt')
// const jwt = require('jwt-simple')