const sqlDatabase = require('../database')
const User = require('./user.js')
const Message = require('./message.js')

User.hasMany(Message)

sqlDatabase.drop()
.then( () =>{
    sqlDatabase.sync()
    .then( ()=>{
        User.create({ userName: "bot" , password: "123"})
        User.create({ userName: "roysan" , password: "123"})
        User.create({ userName: "jason" , password: "123"})
        Message.create({message: "Welcome to the Chat!", userId: 1})
    })
})

module.exports={
    User: User,
    Message: Message
}