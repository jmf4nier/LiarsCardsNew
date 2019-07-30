import React from 'react'
import socketIO from 'socket.io-client'
import {Chat} from './Chat'
import 'semantic-ui-css/semantic.min.css';
import Move from './Move'

let io;

export class GameRoom extends React.Component{

    state={
        myHand: [],
        moves: [],
        currentUsers: [],
        ready: false,
        currentInfo: "",
        userTurn: "",
        chatMessages: [],
        newMessage: "",
        username: "",
        inRound: false,
        finalDisplay: []
    }

    render(){
       

        let callOptions = <form onSubmit={(e)=>this.callSubmit(e)}>
            <select name='call'>
                <option>Bluff</option>
                <option>Spot On</option>
                <option>Pass</option>
            </select>
            <br/>
            <input name='guess' type='text' placeholder="If 'Pass', put what your guess is here" style={{ width:'200px' }} />
            <br/>
            <input type="submit"/>
        </form>

        let showAllCards = <ul>
            {this.state.finalDisplay.map( card =>{
                return <li>{card.username}:{card.code}</li>
            })}
        </ul>

        return(
            <div>
                {this.state.myHand.map( card => <img key={card.code} src={card.image} alt={card.code} />)}
                <div style={{textAlign:'center',position:'absolute', right:'90px', top: '30px', borderStyle:'solid', borderWidth:'.5px'}}>
                    <strong>Players:</strong>
                    <ol style={{ marginRight:'20px'}}>
                        {this.state.currentUsers.map( (user) =>{
                            return <li key={user.id} >{user.username}</li>
                        })}
                    </ol>
                </div>
                <br/>
                {!this.state.inRound ?
                    <button onClick={this.readySubmit}>Ready: {this.state.ready ? "True" : "False"}</button>:
                    null
                }
                <br/> <br/>
                {this.state.userTurn === this.state.username ? callOptions : null}
                <br />
                <br />
                {/* display turn information better */}
                <h1>{this.state.currentInfo.username}- {this.state.currentInfo.guess}</h1>
                {
                    this.state.currentInfo.guess === "Bluff" || this.state.currentInfo.guess === "Spot On" ?
                    <button onClick={this.confirmCall}>Show Cards</button> :
                    null
                }
                {
                    this.state.finalDisplay.length > 0 ?
                    showAllCards :
                    null
                }
                <Chat chatMessages={this.state.chatMessages} newMessage={this.state.newMessage} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            </div>
        )
    }

    componentDidMount(){

        // gets token, sends to server
        let token = window.localStorage.getItem('token')
        io = socketIO('http://localhost:8080/game-room', {
            query: { token }
        })

        // gets back username from database
        io.on('username', username => this.setState({ username }))

        // checks who's in the room
        io.on('current-users', currentUsers =>{
            this.setState({ currentUsers })
        })

        // once everyone is ready, will request server for a new hand
        io.on('allReady', readyCheck =>{
            if(readyCheck){
                this.setState({ inRound: true, finalDisplay: [], currentInfo: "" })
                io.emit('newHand', {}, myHand =>{
                    this.setState({ myHand, ready: false })
                })
            }
        })

        // shows who's turn it is
        io.on('whose-turn', userTurn => this.setState({ userTurn }) )

        //displays what people call on their turn (bluff, spot on, or pass with value)
        io.on('information', currentInfo => this.setState({ 
            currentInfo, 
            moves: [...this.state.moves, currentInfo]
        }))

        // reveals all cards at the end of a round
        io.on('final-display', finalDisplay => this.setState({ finalDisplay, inRound: false }))



        //listeners for the chat
        io.emit('messages/index', {}, chatMessages => {
            this.setState({ chatMessages })
        })
        
        io.on('newMessage', newMessage =>{
            this.setState({ chatMessages: [...this.state.chatMessages, newMessage]})
        })
    }

    //handles submission of new messages
    handleSubmit = (e) => {
        e.preventDefault()

        if(this.state.newMessage.split(" ").join("").length > 0){
            io.emit('sentMessage',{message: this.state.newMessage})
            this.setState({ newMessage: "" })
        }
    }
    
    //changes new message state when user is typing
    handleChange = (e) => {
        this.setState({ newMessage: e.target.value })
    }

    //used to confirm when everyone is ready
    readySubmit = () => {
        this.setState({ ready: !this.state.ready })
        io.emit('newRound', !this.state.ready)
    }

    // used to submit a call
    callSubmit = (e) => {
        e.preventDefault()
        let desiredOption;
        let call = e.target.call.value
        let guess = e.target.guess.value
        call === "Bluff" || call === "Spot On" ? desiredOption = call : desiredOption = "Guess: " + guess
        io.emit('guess', {username: this.state.username , desiredOption})
        
    }

    // confirms that user saw the call
    confirmCall = () => {
        let cards = this.state.myHand.map( card => ( {...card, username: this.state.username} ))
        io.emit('reveal-cards', cards)
    }
}