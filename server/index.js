
//////////////////////// This section is pretty much the same for every socket app to make later


//figure out which ones I don't need since I'm not using http
//used to route http requests
const express = require('express');

//parses bodies for requests
const bodyParser = require('body-parser');

// sets up the app that we will route information with
const app = express();

// Adds a specific header to all http responses to let the browser know a response is safe
const cors = require('cors');

// used to listen for requests
const http = require('http').createServer(app);

// used for realtime communication (created after http request (handshake) goes through)
const io = require('socket.io')(http);

// used for password stuff
const jwt = require ('jwt-simple');

// tells app to use the bodyParser
app.use(bodyParser.json());

// tells app to use cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true}))




// used to fetch
const fetch = require('node-fetch')

// used for password shiiiiit
const bcrypt = require('bcrypt')


// our database models
const { User, Message, Move } = require("./models")

app.post('/signup', async (req, response)=>{
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    if(user === null && username.split(" ").join("").length > 0 && password.split(" ").join("").length > 3){
        let newUser = await User.create({username: username, password: password})
        response.send(newUser.auth_token)
    }else if(username.split(" ").join("").length < 1 || user !== null){
        response.send('username taken')
    }else if(password.split(" ").join("").length < 4){
        response.send('password too short')
    }
})
app.post('/login', async (req, response)=>{
    const {username, password} = req.body
    let user = await User.findOne({ where: { username: username} } )
    if(user && bcrypt.compareSync(password, user.password_digest)){
        if(user.InRoom){
            response.send('Already logged in')
        }else{
            response.send(user.auth_token)
        }
    }else{
        response.send('null')
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

// array used for displaying final results of cards
let finalDisplay = []

// object used to store how many of each suit is in a round
let suitHash = {}

// used to store the last guess and final call
let lastGuess = null
let finalCall = ""

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

        currentUser.update({InRoom: true})

        // sets that user as in the game
        currentUser.stillIn = true

        let userJoinedMessage = await Move.create({ move: 'joined the room', username: currentUser.username })
        room.emit('information', userJoinedMessage)
        

        //loads moves in moves box
        socket.on('moves/index',({},respond)=> {
            Move.findAll({})
            .then(moves => respond(moves))
        })

        // loads messages in chat box
        socket.on('messages/index',({},respond)=> {
            Message.findAll({})
            .then(messages => respond(messages))
        })
    
        // displays new message for everyone in chat box when someone sends a message
        socket.on('sentMessage',async messageObject=> {
            
            let newMessage = await Message.create({...messageObject,username: currentUser.username})
            room.emit('newMessage', newMessage)
        })

        // creates a deck if one is not already made
        // may have to change how this works when there are multiple rooms
        if(!deckMade){
            createDeck()
        }
        // push actual users into the array and let all users connected know who's in the room
        roomUsers.push(currentUser)
        room.emit('current-users', roomUsers)
        

        // this function should give each play the amount of cards they need
        socket.on('newRound', async(readyConfirm)=>{
            finalDisplay=[]
            suitHash = { 'HEARTS':0, 'DIAMONDS':0, 'SPADES':0, 'CLUBS':0 }
            lastGuess = { desiredOption: "0 HEARTS" }
            if(!currentUser.cardCount && currentUser.cardCount !== 0){
                currentUser.cardCount = 3
            }
            currentUser.reveal = false
            if(readyConfirm){
                currentUser.ready = true
                readyCount = roomUsers.filter( user=> user.ready ).length
            }else{
                currentUser.ready = false
                readyCount = roomUsers.filter( user=> user.ready ).length
            }
            if(readyCount >= 2 && readyCount >= roomUsers.length){

                let newRoundMessage = await Move.create({ move: 'Cards have been dealt', username: "Bot" })
                room.emit('information', newRoundMessage)
                let roundCardCount = roomUsers.map( user => user.cardCount ).reduce( (total,num) => total + num )
                await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/shuffle/`)
                fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${roundCardCount}`)
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
                respond( cardArray.splice(0,currentUser.cardCount) )
                currentUser.ready = false

                room.emit('whose-turn', roomUsers[turnCount].username )
            }
        })

        // takes in the guess that a player made and displays to everyone else
        socket.on('guess', async (guess,respond) => {

            let finalTurnChecker

            if( guess.desiredOption !== "Bluff" && guess.desiredOption !== "Spot On"){
                let numCheck = parseInt(lastGuess.desiredOption.charAt(0)) < parseInt(guess.desiredOption.charAt(0))
                let equalCheck = parseInt(lastGuess.desiredOption.charAt(0)) === parseInt(guess.desiredOption.charAt(0))

                if(numCheck){
                    finalTurnChecker = true
                    suitArray = [ guess.desiredOption.split(" ")[1] ]
                }else if(equalCheck){
                    if( suitArray.includes( guess.desiredOption.split(" ")[1]) ){
                        finalTurnChecker = false
                    }else{
                        finalTurnChecker = true
                        suitArray.push(guess.desiredOption.split(" ")[1])
                    }
                }else{
                    suitArray = []
                    finalTurnChecker = false
                }
            }else{
                finalTurnChecker = true
            }

            if(finalTurnChecker){

                let newMove = await Move.create({move: guess.desiredOption, username: guess.username}) 
                room.emit('information', newMove)

                respond("Choice Accepted")

                if(roomUsers.length > (turnCount+1)){
                    turnCount++
                }else{
                    turnCount=0
                }
                // while person whose turn it currently is has 0 cards & more than 1 person has more than 1 card (meaning no one has won yet)
                // used to skip over people who are already out
                while(roomUsers[turnCount].cardCount <= 0 && (roomUsers.filter( user => user.cardCount>0).length) > 1 ){
                    turnCount++
                }
                if( guess.desiredOption === "Bluff" || guess.desiredOption === "Spot On"){
                    finalCall = guess
                    room.emit('whose-turn', "" )
                }else{
                    lastGuess = {...guess}
                    room.emit('whose-turn', roomUsers[turnCount].username )
                }
            }else{
                respond("Invalid")
            }
        })

        socket.on('reveal-cards', async cards => {
            if(!currentUser.reveal){
                currentUser.reveal = true
                finalDisplay.push( ...cards )
                revealCheck = roomUsers.filter( user => user.reveal )
            }
            if(revealCheck.length === roomUsers.length && lastGuess){
                let suitArray = finalDisplay.map( card => card.suit )
                suitArray.forEach( suit => suitHash[suit] = suitHash[suit] + 1 )

                let suitCountMessage = await Move.create({ move: `Suits- H:${suitHash['HEARTS']}, D:${suitHash['DIAMONDS']}, S${suitHash['SPADES']}, C:${suitHash['CLUBS']}`, username: 'Bot' })
                room.emit('information', suitCountMessage)

                let amount = parseInt(lastGuess.desiredOption.split(" ")[0])
                let suit = lastGuess.desiredOption.split(" ")[1]
                let win = "Unknown"
                if(finalCall.desiredOption === "Bluff"){
                    win = (suitHash[suit] < amount)
                }else{
                    win = (suitHash[suit] === amount)
                }
                if(win){
                    if(finalCall.desiredOption === "Bluff"){
                        roomUsers.map(async user =>{
                            if(user.username === lastGuess.username){
                                user.cardCount = user.cardCount-1
                                let cardLossMessage = await Move.create({ move: 'loses a card', username: user.username })
                                room.emit('information', cardLossMessage)
                                if(user.cardCount === 0){
                                    user.stillIn = false
                                    let newMessage = await Move.create({ move: 'lost and OUT', username: user.username })
                                    room.emit('information', newMessage)
                                }
                            }
                        })
                    }else{
                        roomUsers.map(async user =>{
                            if(user.username !== finalCall.username && user.cardCount > 0){
                                user.cardCount = user.cardCount-1
                                let cardLossMessage = await Move.create({ move: 'loses a card', username: user.username })
                                room.emit('information', cardLossMessage)
                                if(user.cardCount === 0){
                                    user.stillIn = false
                                    let newMessage = await Move.create({ move: 'lost and OUT', username: user.username })
                                    room.emit('information', newMessage)
                                }
                            }
                        })
                    }
                }else{
                    roomUsers.map(async user =>{
                        if(user.username === finalCall.username){
                            user.cardCount = user.cardCount-1
                            let cardLossMessage = await Move.create({ move: 'loses a card', username: user.username })
                            room.emit('information', cardLossMessage)
                            if(user.cardCount === 0){
                                user.stillIn = false
                                let newMessage = await Move.create({ move: 'lost and OUT', username: user.username })
                                room.emit('information', newMessage)
                            }
                        }
                    })
                }

                // DISPLAYING THAT SOMEONE HAS WON DOES NOT WORK YET
                if(roomUsers.filter( user => user.stillIn ).length <= 1){
                    console.log("someone has won")
                    let newMessage = await Move.create({ move: 'WINNER', username: roomUsers.filter( user => user.stillIn )[0].username })
                    room.emit('information', newMessage)
                }
                room.emit('final-display', { finalDisplay, suitHash } )
            }
        })

        // this will remove the user that disonnected from the current user array and let everyone know who is in
        socket.on('disconnect', async ()=> {

            currentUser.update({ InRoom: false })

            let newMessage = await Move.create({ move: 'has left the room', username: currentUser.username })
            room.emit('information', newMessage)

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

http.listen(8080)