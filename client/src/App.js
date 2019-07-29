import React from 'react';
import  Login  from './Login';
import { Chat } from './Chat';
import Signup from './Signup'
import { BrowserRouter as Router, Route } from 'react-router-dom';


class App extends React.Component{
  
  render(){
    return (
      <div>
        <Router>
          <Route exact path='/' component={Login}/>
          <Route exact path='/chat' component={Chat}/>
          <Route exact path='/signup' component={Signup}/>
        
          
        </Router>
      </div>
    )
  }

}

export default App;
