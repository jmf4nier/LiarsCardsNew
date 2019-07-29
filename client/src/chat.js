import React from 'react'
// const io = socketIO('http://localhost:8080?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.nl8QveWCtkui9auZTnQY4GKWBgW1fHdooy0lzuJqSG8')


export class Chat extends React.Component{
      
    render(){
        return (
            <div  style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <div style={{ height: '400px', overflowY:'auto', border: '1px solid black' }}>
                    {this.props.chatMessages.map( (eachMessage) => <p key={eachMessage.id} >{eachMessage.username}: {eachMessage.message}</p> )}
                </div>
                <form onSubmit={(e)=> this.props.handleSubmit(e)}>
                    <input name="newMessage" type="text" value={this.props.newMessage} onChange={(e)=>this.props.handleChange(e)} />
                    <input type="Submit" />
                </form>
            </div>
        )
    }
   
}

    