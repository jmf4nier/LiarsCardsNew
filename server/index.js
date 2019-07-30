
//////////////////////// This section is pretty much the same for every socket app to make later

//figure out which ones I don't need since I'm not using http
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

// used for password stuff
const jwt = require ('jwt-simple');

// tells app to use the bodyParser
app.use(bodyParser.json())

// tells app to use cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true}))




// used to fetch
const fetch = require('node-fetch')

// used for password shiiiiit
const bcrypt = require('bcrypt')


// our database models
const { User, Message } = require("./models")

app.post('/signup', async (req, response)=>{
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    if(user === null){
        let newUser = await User.create({username: username, password: password})
        response.send(newUser.auth_token)
    }else{
        response.send('Username Not Available')
    }
})
app.post('/login', async (req, response)=>{
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    if(user && bcrypt.compareSync(password, user.password_digest)){
        response.send( user.auth_token)
    }else{
        response.send('Wrong Password/Username')
    }
})

// used to define the room to be in
const room = io.of('/game-room')

// used to keep track of who's in the room
let roomUsers = []

// confirms if a deck has been created for the room or not
let deckMade = false
let deckID = ""
let cardArray = []
let finalDisplay = []

// used for checking who's turn it is
let turnCount = 0


createDeck = () =>{
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    .then(r => r.json())
    .then(deck => deckID=deck.deck_id)
}

//set's up listeners for the connection
room.on('connection', async socket => {

    let token = socket.handshake.query.token
    if (token && roomUsers.length < 4){ //include way to make sure people can't get in if only 2 people say they are ready
        let { id } = jwt.decode(token, 'akdsjfljdfi3' )
        let currentUser = await User.findByPk(id)
        socket.emit('username', currentUser.username)

        let userJoinedMessage = await Message.create({ message: `${currentUser.username} has joined the room`, username: "Bot" })
        room.emit('newMessage', userJoinedMessage)
        

        // loads messages in chat box
        socket.on('messages/index',({},respond)=> {
            Message.findAll({})
            .then(messages => respond(messages))
        })
    
        // displays new message for everyone in chat box when someone sends a message
        socket.on('sentMessage',async (messageObject,respond)=> {
            
            let newMessage = await Message.create({...messageObject,username: currentUser.username})
            await newMessage.setUser( currentUser )
            room.emit('newMessage', newMessage)
        })

        if(!deckMade){
            createDeck()
        }
        // push actual users into the array and let all users connected know who's in the room
        roomUsers.push(currentUser)
        room.emit('current-users', roomUsers)
        

        // this function should give each play the amount of cards they need
        socket.on('newRound', async(readyConfirm)=>{
            finalDisplay=[]
            currentUser.reveal = false
            if(readyConfirm){
                currentUser.ready = true
            }else{
                currentUser.ready = false
            }
            readyCount = roomUsers.filter( user=> user.ready ).length
            if(readyCount >= 2 && readyCount >= roomUsers.length){
                fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${roomUsers.length*3}`)
                .then(r => r.json())
                .then(cards=>{
                    cardArray = cards.cards
                    room.emit('allReady', true)
                })
            }
        })

        // when everyone is ready, deals new hand
        socket.on('newHand', ({}, respond)=> {
            if(currentUser.ready){
                respond( cardArray.splice(0,3) )
                currentUser.ready = false

                room.emit('whose-turn', roomUsers[turnCount].username )
            }
        })

        // takes in the guess that a player made and displays to everyone else
        socket.on('guess', guess => {
            room.emit('information', { username: guess.username , guess: guess.desiredOption })
            if(roomUsers.length > (turnCount+1)){
                turnCount++
            }else{
                turnCount=0
            }
            if( guess.desiredOption === "Bluff" || guess.desiredOption === "Spot On"){
                room.emit('whose-turn', "" )
            }else{
                room.emit('whose-turn', roomUsers[turnCount].username )
            }
        })

        socket.on('reveal-cards', cards => {
            if(!currentUser.reveal){
                currentUser.reveal = true
                finalDisplay.push( ...cards )
            }
            revealCheck = roomUsers.filter( user => user.reveal )
            if(revealCheck.length === roomUsers.length){
                room.emit('final-display', finalDisplay)
            }
        })

        // this will remove the user that disonnected from the current user array and let everyone know who is in
        socket.on('disconnect', async ()=> {

            let newMessage = await Message.create({ message: `${currentUser.username} has left the room`, username: "Bot" })
            room.emit('newMessage', newMessage)

            roomUsers = roomUsers.filter( user => user.id !== currentUser.id)
            if(roomUsers.length === 0){
                //clear messages here
            }else{
                room.emit('current-users', roomUsers)
            }
            
        })

    }else if(roomUsers.length >= 4){
        console.log('Room is full')
    }else{
        console.log('Authentication error')
    }

})

// assigns the port to listen to
http.listen(8080)