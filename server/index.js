
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

// tells app to use the bodyParser
app.use(bodyParser.json())

// tells app to use cors
app.use(cors({ origin: 'http://localhost:3000/game-room', credentials: true}))

////////////////

// used to fetch
const fetch = require('node-fetch')

// used for password shiiiiit
const bcrypt = require('bcrypt')


// our database models
const { User, Message } = require("./models")

app.post('/login', async (request,respond) =>{
    const {username, password } = request.body
    let user = await User.findOne({ where: {userName: username} })
    if(user && bcrypt.compareSync(password,user.password_digest)){
        respond.send(user)
    }else{
        respond.send("NO!")
    }
})

// used to define the room to be in
const room = io.of('/game-room')

// used to keep track of who's in the room
let currentUsers = []

// used to keep track of when everyone is ready to start the next round
let readyCount = 0

// confirms if a deck has been created for the room or not
let deckMade = false
let deckID = ""
let cardArray = []


createDeck = () =>{
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    .then(r => r.json())
    .then(deck => deckID=deck.deck_id)
}


// drawCards = (num) => {
//     fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${num}`)
//     .then(r => r.json())
//     .then(cards=>{
//         cardArray = cards.cards
//     })
// }

//set's up listeners for the connection
room.on('connection', socket => {

    if(!deckMade){
        createDeck()
    }

    if(currentUsers.length === 0){
        readyCount = 0
    }
    // push actual users into the array and let all users connected know who's in the room
    currentUsers.push("randoUser" + Math.floor(Math.random()*10) )
    room.emit('current-users', currentUsers)

    // this function should give each play the amount of cards they need
    socket.on('newRound', async(readyConfirm)=>{
        // should be for when each socket is ready rather than just when ready is called multiple times
        // have a ready check and turn check in database?
        if(readyConfirm){
            readyCount++
        }else{
            readyCount--
        }
        console.log(readyCount)
        if(readyCount >= 4 && readyCount >= currentUsers.length){
            fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${currentUsers.length*3}`)
            .then(r => r.json())
            .then(cards=>{
                cardArray = cards.cards
                room.emit('allReady', true)
                readyCount = 0
            })
        }
    })

    socket.on('newHand', ()=> {
        // find a way to make sure people can't just request a new hand whenever
        socket.emit('dealCards', cardArray.splice(0,3) )
    })

    socket.on('guess', guess => {
        room.emit('information', guess)
    })

    // this will remove the user that disonnected from the current user array and let everyone know who is in
    socket.on('disconnect', ()=> {
        currentUsers.shift()
        room.emit('current-users', currentUsers)
        // make a specific user leave here
    })


})



// random mess for chat///////////////

// const userArray = []

// // turns on listener for other sockets connecting. once a socket connects, creates listeners for the specific socket
// io.on('connection', socket =>{

//     //find a way to limit number of users connected to the socket

//     User.findByPk(Math.floor(Math.random()*3)+1).then( currentUser => {
//         console.log(currentUser.userName,"connected")
//         userArray.push(currentUser.userName)
//         console.log(userArray)
//         socket.on('messages/index',({},respond)=> {
//             Message.findAll({})
//             .then(messages => respond(messages))
//         })
    
//         socket.on('sentMessage',async (messageObject,respond)=> {
//             let newMessage = await Message.create({...messageObject,userName: currentUser.userName})
//             await newMessage.setUser( currentUser )
//             io.emit('newMessage', newMessage)
//             respond(newMessage)
        
//         })
    
//         socket.emit('startingHand', Math.random())

//         socket.on('disconnect', ()=> {
//             console.log(currentUser.userName,'disconnected')
//             let num = userArray.indexOf(currentUser.userName)
//             userArray.splice(num,1)
//             console.log(userArray)
//         })
//     })


   

//     // make listener for a round starting to distribute the cards

//     // recieve data for final results of each round


//     // something to use for creating game rooms that need a pin to get in

//     socket.on('pin', () => {
//         // look up the game
//         // get the cards for the game
//         socket.emit('cards',)
//     })

// })


// assigns the port to listen to
http.listen(8080)