import React from 'react'
import socketIO from 'socket.io-client'

let io;

export class GameRoom extends React.Component{

    state={
        myHand: [],
        currentUsers: [],
        ready: false,
        currentInfo: ""
    }

    render(){
        return(
            <div>
                {this.state.myHand.map( card => <img key={card.code} src={card.image} alt={card.code} />)}
                <ol>
                    {this.state.currentUsers.map( (user,i) =>{
                        return <li key={i} >{user}</li>
                    })}
                </ol>
                <button onClick={this.readySubmit}>Ready: {this.state.ready ? "True" : "False"}</button>
                <br/> <br/>
                <form onSubmit={(e)=>this.callSubmit(e)}>
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
                <br /><br />
                <h1>{this.state.currentInfo}</h1>
                {
                    this.state.currentInfo === "Bluff" || this.state.currentInfo === "Spot On" ?
                    <button onClick={this.confirmCall}>Confirm</button> :
                    null
                }
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
    }

    //used to confirm when everyone is ready
    readySubmit = () => {
        this.setState({ ready: !this.state.ready })
        io.emit('newRound', !this.state.ready)
    }

    callSubmit = (e) => {
        e.preventDefault()
        let desiredOption;
        let call = e.target.call.value
        let guess = e.target.guess.value
        call === "Bluff" || call === "Spot On" ? desiredOption = call : desiredOption = guess
        io.emit('guess', desiredOption)
    }

    confirmCall = () => {
        console.log("call confirmed")
    }
}