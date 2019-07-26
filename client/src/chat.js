import React from 'react'
import socketIO from 'socket.io-client'

const io = socketIO('http://localhost:8080')

export class Chat extends React.Component{

    state={
        messages: [],
        newMessage: ""
    }
      
    render(){
        return (
            <div>
            {this.state.messages.map( (eachMessage) => <p key={eachMessage.id} >{eachMessage.userName}: {eachMessage.message}</p> )}
            <form onSubmit={(e)=> this.handleSubmit(e)}>
                <input name="newMessage" type="text" value={this.state.newMessage} onChange={(e)=>this.setState({ newMessage: e.target.value })} />
                <input type="Submit" />
            </form>
            </div>
        )
    }

    componentDidMount(){

        io.on('goAway', message =>{
            console.log(message)
        })

        io.emit('messages/index',{}, messages=>{
            console.log(messages)
            this.setState({ messages: messages })
        })

        io.on('newMessage', newMessage =>{
            this.setState({ messages: [...this.state.messages, newMessage]})
        })

        io.on('startingHand', startingHand =>{
            console.log(startingHand)
        })
    }
    
    handleSubmit(e){
        e.preventDefault()

        if(this.state.newMessage.split(" ").join("").length > 0){
            io.emit('sentMessage',{message: this.state.newMessage})
            
            // , newMessage =>{
            //     this.setState({
            //         messages: [...this.state.messages, newMessage],
            //         newMessage: ""
            //     })
            // })
        }
    }

}