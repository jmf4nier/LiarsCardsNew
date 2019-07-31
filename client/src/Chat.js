import React from 'react'

export class Chat extends React.Component{
      
    render(){
        const today = new Date()
        return (
            <div id='chat' className="ui comments" style={{ position: "absolute", bottom:'10px', right:'20px' }}>
                <h3 className="ui dividing header">Chat</h3>
                <div id='messageBox' className="comment" style={{ height:'300px', overflowY:'auto' }}>
                    <div className="content">
                        <div className="text">
                             {this.props.chatMessages.map( (eachMessage) =>
                                <p key={eachMessage.id} >
                                <strong>{eachMessage.username}</strong>: 
                                {" " + eachMessage.message}</p> 
                                )}
                        </div>
                        <div className="metadata">
                            <span className="date"> {today.getHours() + ":" + today.getMinutes()}</span>
                        </div>
                    </div>
                </div>
                <form className="ui reply form" onSubmit={(e)=> this.props.handleSubmit(e)}>
                    <div className="field" >
                        <input autoComplete='off' name="newMessage"  type='text' value={this.props.newMessage} onChange={(e)=>this.props.handleChange(e)}></input>
                    </div>
                    <input type="Submit"  className="ui blue button"/>
                </form>
            </div>
        )
    }

    componentDidUpdate(){
        let objDiv = document.getElementById("messageBox");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
   
}

    
