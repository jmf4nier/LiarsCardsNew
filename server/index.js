
//////////////////////// This section is pretty much the same for every socket app to make later
const bcrypt = require ('bcrypt')
//figure out which ones I don't need since I'm not using http
const fetch = require('node-fetch');
//used to route http requests
const express = require('express')

//parses bodies for requests
const bodyParser = require('body-parser')

// sets up the app that we will route information with
const app = express()

// Adds a specific header to all http responses to let the browser know a response is safe
const cors = require('cors')

// used to listen for requests
const http = require('http').createServer(app);

// used for realtime communication (created after http request (handshake) goes through)
const io = require('socket.io')(http);

const jwt = require ('jwt-simple')

// tells app to use the bodyParser
app.use(bodyParser.json())

// tells app to use cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true}))





// our database models
const { User, Message } = require("./models")

//index using http if we used fetch requests
// app.get('/messages', ({}, respond) =>{
//     Message.findAll({})
//     .then( messages => respond.send(messages))
// })

//post using http
app.post('/messages', (request, {}) => {
    Message.create(request.body)
    //uses socket to have new messages be received by all sockets in realtime
    .then(result => io.emit('newMessage', result))
})
app.post('/login', async (req, response)=>{
    
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    if(user === null){
        let user = await User.create({username: username, password: password})
    }
    if(user && bcrypt.compareSync(password, user.password_digest)){
        
        response.send('Success')
    }else{
        
        response.send('nope')
    }
})



// turns on listener for other sockets connecting. once a socket connects, creates listeners for the specific socket
io.on('connection', async socket =>{
    console.log(socket.handshake.query.token)
    let token = socket.handshake.query.token
    if (token){
        let { id } = jwt.decode(token, 'akdsjfljdfi3' )
        let user = await User.findByPk(id)
        console.log('connected as: ', user)
    }
    //find a way to limit number of users connected to the socket

    User.findByPk(Math.floor(Math.random()*3)+1).then( currentUser => {
        console.log(currentUser.username)
        socket.on('messages/index',({},respond)=> {
            Message.findAll({})
            .then(messages => respond(messages))
        })
    
        socket.on('sentMessage',async (messageObject,respond)=> {
            console.log(messageObject)
            let newMessage = await Message.create({...messageObject,username: currentUser.username})
            await newMessage.setUser( currentUser )
            io.emit('newMessage', newMessage)
            
        })
    
        socket.emit('startingHand', Math.random())
    })


   

    // make listener for a round starting to distribute the cards

    // recieve data for final results of each round


    // something to use for creating game rooms that need a pin to get in

    // socket.on('pin', () => {
    //     // look up the game
    //     // get the cards for the game
    //     socket.emit('cards',)
    // })

})


// assigns the port to listen to
http.listen(8080)