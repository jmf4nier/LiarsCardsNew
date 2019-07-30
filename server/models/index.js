const sqlDatabase = require('../database')
const User = require('./user.js')
const Message = require('./message.js')
const Move = require('./move')



User.hasMany(Message)
Message.belongsTo(User)

sqlDatabase.drop()
.then( () =>{
    sqlDatabase.sync()
    .then( async ()=>{
        let bot = await User.create({ username: "bot" , password: "123"})
        User.create({ username:"roysan" , password: "123", wins: 1})
        User.create({ username:"jason" , password: "123", wins: 2})
        User.create({ username:"jojo" , password: "muda", wins: 10})
        Move.create({move:'called a bluff', username:"jason"})
        let message = await Message.create({message: "Welcome to the Chat!", username: bot.username})
        message.setUser(bot)
        
    })
})


module.exports={
    User: User,
    Message: Message,
    Move: Move
}
