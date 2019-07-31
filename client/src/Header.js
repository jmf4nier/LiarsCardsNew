import React from 'react'


export default class Header extends React.Component{

    

    render(){
        
        return(
            <nav id='nav' className="navbar navbar-dark bg-dark">
                <span className="navbar-brand mb-0 h1">{this.props.user}</span>
            </nav> 
        )
    }
}