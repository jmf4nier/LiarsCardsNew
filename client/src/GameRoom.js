import React from 'react'
import socketIO from 'socket.io-client'
import {Chat} from './Chat'
import 'semantic-ui-css/semantic.min.css';
import Move from './Move'
import Header from './Header'

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
        finalDisplay: [],
        roundSuits: {},
        sliderValue: 1,
        firstTurn: false,
        choiceConfirmation: ""
    }

    render(){
       

        let callOptions = 
            <form  onSubmit={(e)=>this.callSubmit(e)}>
                {this.state.choiceConfirmation==="Invalid" ? <p>"Pick a different suit or higher number if you want to pass"</p> : null}
                <div id='move-dropdown' className="input-group mb-3">
                    {this.state.firstTurn?<select name='call' className="custom-select" id="inputGroupSelect02">
                        <option>Pass</option>
                    </select>:<select name='call' className="custom-select" id="inputGroupSelect02">
                        <option>Pass</option>
                        <option>Bluff</option>
                        <option>Spot On</option>
                    </select>}
                </div>    
                <br/>
                <div id='suit-dropdown' className="input-group mb-3">
                    <select name='suit' className="custom-select" id="inputGroupSelect02">
                        <option>HEARTS</option>
                        <option>DIAMONDS</option>
                        <option>SPADES</option>
                        <option>CLUBS</option>
                    </select>
                </div>
                <br/>
                <input type="range" min="1" max="20" defaultValue={this.state.sliderValue} className="slider" id="myRange"  onChange={e=>this.handleSlider(e.target.value)}/>
                <p id='slider-value'><strong>{this.state.sliderValue}</strong></p>
                <br/>
                <input id='move-submit' className='btn btn-primary' type="submit"/>
            </form>

        let showAllCards = <div>
            <ul>
                {this.state.finalDisplay.map( card => <li key={card.code}>{card.username}:{card.code}</li> )}
            </ul>
            <ul>
                {Object.keys(this.state.roundSuits).map( objKey => <li key={objKey}>{objKey}: {this.state.roundSuits[objKey]}</li>)}
            </ul>
        </div>

        return(
            <div>
               <Header user={this.state.username}/>
               <div>
                    <div id='cards'>
                        {this.state.myHand.map( card => {
                            return <img id='card' key={card.code} src={card.image} alt={card.code} height='250px'width='200px' />
                        })}
                    </div>
                    <div id='options'> 
                        {this.state.userTurn === this.state.username ? callOptions : null}
                    </div>
               </div>
                <div id='users'>
                    <strong>Players:</strong>
                    <ol id='user-list'>
                        {this.state.currentUsers.map( (user) =>{
                            return <li key={user.id} >{user.username}{this.state.userTurn===user.username ? " X" : null}</li>
                        })}
                    </ol>
                </div>
                <br/>
                {!this.state.inRound?!this.state.ready?
                    <button id='not-ready-btn' onClick={this.readySubmit}>Ready?</button>:
                    <button id='ready-btn' onClick={this.readySubmit}>Ready!</button>:null
                }
                <div id='move-display'>
                    <p><strong>{this.state.currentInfo.username}- </strong>{this.state.currentInfo.move}</p>

                </div>
                {
                    this.state.currentInfo.move === "Bluff" || this.state.currentInfo.move === "Spot On" ?
                    <button onClick={this.confirmCall}>Show Cards</button> :
                    null
                }
                {
                    this.state.finalDisplay.length > 0 ?
                    showAllCards :
                    null
                }
                <Move moves={this.state.moves} />
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
                    if(myHand !== "NO"){
                        this.setState({ myHand, ready: false })
                    }else{
                        this.setState({ myHand: [] })
                    }
                })
            }
        })

        // shows who's turn it is
        io.on('whose-turn', userTurn => this.setState({ userTurn }) )

        //displays what people call on their turn (bluff, spot on, or pass with value)
        io.on('information', currentInfo => {
            if(currentInfo.move === "Cards have been dealt"){
                this.setState({firstTurn: true})
            }else{this.setState({firstTurn: false})}
            this.setState({ 
            currentInfo, 
            moves: [...this.state.moves, currentInfo]
            })
        })

        // reveals all cards at the end of a round
        io.on('final-display', finalInfo => this.setState({
            finalDisplay: finalInfo.finalDisplay,
            inRound: false,
            roundSuits: finalInfo.suitHash
        }))



        //listeners for the chat
        io.emit('messages/index', {}, chatMessages => {
            this.setState({ chatMessages })
        })
        
        io.on('newMessage', newMessage =>{
            this.setState({ chatMessages: [...this.state.chatMessages, newMessage]})
        })

        //listener to get moves
        io.emit('moves/index', {}, moves => this.setState({ moves }))
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
        let suit = e.target.suit.value
        let amount = this.state.sliderValue
        call === "Bluff" || call === "Spot On" ? desiredOption = call : desiredOption = `${amount} ${suit}`
        io.emit('guess', {username: this.state.username , desiredOption}, response => {
            this.setState({ choiceConfirmation: response })
        })
        
    }

    // confirms that user saw the call
    confirmCall = () => {
        let cards = this.state.myHand.map( card => ( {...card, username: this.state.username} ))
        io.emit('reveal-cards', cards)
    }
    handleSlider = (value)=>{
        this.setState({
            sliderValue: value
        })
    }
}