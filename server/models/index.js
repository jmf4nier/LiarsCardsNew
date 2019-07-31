const sqlDatabase = require('../database')
const User = require('./user.js')
const Message = require('./message.js')
const Move = require('./move')

sqlDatabase.drop()
.then( () =>{
    sqlDatabase.sync()
    .then( async ()=>{
        let bot = await User.create({ username: "Bot" , password: "admin"})
        User.create({ username:"roysan" , password: "123" })
        User.create({ username:"jason" , password: "123" })
        User.create({ username:"jojo" , password: "muda" })
        Message.create({message: "Welcome to the Chat!", username: bot.username})
    })
})


module.exports={
    User: User,
    Message: Message,
    Move: Move
}
