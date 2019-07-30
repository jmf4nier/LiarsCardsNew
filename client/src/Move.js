import React from 'react'


export default class Move extends React.Component{

    componentDidUpdate(){
        let objDiv = document.getElementById("moveDiv");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    render(){
        let {moves} = this.props
        return(
            <div id='moveDiv'>
                <strong>Moves:</strong>
                <ol style={{ marginRight:'20px'}}>
                    {moves.map( (move) =>{
                        return <li><strong>{move.username}</strong>:{' ' + move.guess}</li>
                    })}
                </ol>
            </div>
        )
    }
}