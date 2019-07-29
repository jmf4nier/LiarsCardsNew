
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

app.post('/login', async (req, response)=>{
    
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    // if(user === null){
    //     let user = await User.create({username: username, password: password})
    // }
    if(user && bcrypt.compareSync(password, user.password_digest)){
        
        response.send('Success')
    }else{
        
        response.send('nope')
    }
})

// used to define the room to be in
const room = io.of('/game-room')

// used to keep track of who's in the room
let roomUsers = []

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

let num = 1

//set's up listeners for the connection
room.on('connection', async socket => {

    User.findByPk(num).then( currentUser => {
        // console.log(socket.handshake.query.token)
        // let token = socket.handshake.query.token
        // if (token){
        //     let { id } = jwt.decode(token, 'akdsjfljdfi3' )
        //     let user = await User.findByPk(id)
        //     console.log('connected as: ', user)
        // }

        socket.on('messages/index',({},respond)=> {
            console.log("get messages now")
            Message.findAll({})
            .then(messages => respond(messages))
        })
    
        socket.on('sentMessage',async (messageObject,respond)=> {
            console.log(messageObject)
            let newMessage = await Message.create({...messageObject,username: currentUser.username})
            await newMessage.setUser( currentUser )
            room.emit('newMessage', newMessage)
        })

        if(!deckMade){
            createDeck()
        }
        
        if(roomUsers.length === 0){
            readyCount = 0
        }
        // push actual users into the array and let all users connected know who's in the room
        roomUsers.push(currentUser)
        room.emit('current-users', roomUsers)
        

        // this function should give each play the amount of cards they need
        socket.on('newRound', async(readyConfirm)=>{
            // should be for when each socket is ready rather than just when ready is called multiple times
            // have a ready check and turn check in database?
            if(readyConfirm){
                currentUser.ready = true
            }else{
                currentUser.ready = false
            }
            readyCount = roomUsers.filter( user=> user.ready ).length
            console.log(readyCount)
            if(readyCount >= 3 && readyCount >= roomUsers.length){
                fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${roomUsers.length*3}`)
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

            //buggy about notifying the currect user that left//////////////////////
            room.emit('newNews', `${currentUser.username} has left the room`)
            roomUsers.pop()
            room.emit('current-users', roomUsers)
            
        })

    })

})

// assigns the port to listen to
http.listen(8080)