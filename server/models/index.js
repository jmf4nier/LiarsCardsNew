const sqlDatabase = require('../database')
const User = require('./user.js')
const Message = require('./message.js')

User.hasMany(Message)
Message.belongsTo(User)

sqlDatabase.drop()
.then( () =>{
    sqlDatabase.sync()
    .then( async ()=>{
        let bot = await User.create({ userName: "bot" , password: "123"})
        User.create({ userName: "roysan" , password: "123"})
        User.create({ userName: "jason" , password: "123"})
        let message = await Message.create({message: "Welcome to the Chat!", userName: bot.userName})
        message.setUser(bot)
    })
})


module.exports={
    User: User,
    Message: Message
}