import React from 'react'


export default class Header extends React.Component{

    

    render(){
        
        return(
            <nav id='nav' className="navbar navbar-dark bg-dark">
                <h1 id='username-header'>Jason</h1>
                {/* <span className="navbar-brand mb-0 h1">{this.props.user}</span> */}
            </nav> 
        )
    }
}