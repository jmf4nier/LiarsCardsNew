import React from 'react'
import socketIO from 'socket.io-client'
import {Chat} from './Chat'
import 'semantic-ui-css/semantic.min.css';

let io;

export class GameRoom extends React.Component{

    state={
        myHand: [],
        moves: [],
        currentUsers: [],
        ready: false,
        currentInfo: "",
        news: "no news",
        myTurn: false,
        chatMessages: [],
        newMessage: ""
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

        return(
            <div>
                {this.state.myHand.map( card => <img key={card.code} src={card.image} alt={card.code} />)}
                <div style={{textAlign:'center',position:'absolute', right:'80px', top: '30px', borderStyle:'solid', borderWidth:'.5px'}}>
                    <strong>Players:</strong>
                    <ol style={{ marginRight:'20px'}}>
                        {this.state.currentUsers.map( (user) =>{
                            return <li key={user.id} >{user.username}</li>
                        })}
                    </ol>
                </div>
                <button onClick={this.readySubmit}>Ready: {this.state.ready ? "True" : "False"}</button>
                <br/> <br/>
                {this.state.myTurn ? callOptions : null}
                <br />
                <h3>{this.state.news}</h3>
                <br />
                <h1>{this.state.currentInfo}</h1>
                {
                    this.state.currentInfo === "Bluff" || this.state.currentInfo === "Spot On" ?
                    <button onClick={this.confirmCall}>Confirm</button> :
                    null
                }
                <Chat chatMessages={this.state.chatMessages} newMessage={this.state.newMessage} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            </div>
        )
    }

    componentDidMount(){
        io = socketIO('http://localhost:8080/game-room')
        io.on('current-users', currentUsers =>{
            this.setState({ currentUsers })
        })
        // once everyone is ready, will request server for a new hand
        io.on('allReady', readyCheck =>{
            if(readyCheck){
                console.log("requesting new hand")
                io.emit('newHand', {})
            }
        })

        // when server is reaquested for a newHand, will deal out cards to everyone
        io.on('dealCards', myHand => {
            this.setState({ myHand, ready: false })
        })

        io.on('information', currentInfo => this.setState({ currentInfo }))

        io.on('newNews', news => {
            this.setState({ news })
            setTimeout(()=> this.setState({ news: "no news now" }), 2000)
        })

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
        call === "Bluff" || call === "Spot On" ? desiredOption = call : desiredOption = guess
        io.emit('guess', desiredOption)
    }

    // confirms that user saw the call
    confirmCall = () => {
        console.log("call confirmed")
    }
}