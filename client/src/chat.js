import React from 'react'
import socketIO from 'socket.io-client'
const io = socketIO('http://localhost:8080')
// const io = socketIO('http://localhost:8080?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.nl8QveWCtkui9auZTnQY4GKWBgW1fHdooy0lzuJqSG8')
    


export class Chat extends React.Component{

    state={
        messages: [],
        newMessage: ""
    }
      
    render(){
        return (
            <div>
            {this.state.messages.map( (eachMessage) => <p key={eachMessage.id} >{eachMessage.username}: {eachMessage.message}</p> )}
            <form onSubmit={(e)=> this.handleSubmit(e)}>
                <input name="newMessage" type="text" value={this.state.newMessage} onChange={(e)=>this.setState({ newMessage: e.target.value })} />
                <input type="Submit" />
            </form>
            </div>
        )
    }

    componentDidMount(){

        io.on('newMessage', newMessage =>{
            this.setState({ messages: [...this.state.messages, newMessage]})
        })

    }    

    handleSubmit(e){
        e.preventDefault()

        if(this.state.newMessage.split(" ").join("").length > 0){
            io.emit('sentMessage',{message: this.state.newMessage})
            this.setState({ newMessage: "" })
            
            // , newMessage =>{
            //     this.setState({
            //         messages: [...this.state.messages, newMessage],
            //         newMessage: ""
            //     })
            // })
        }
    }       

}

    