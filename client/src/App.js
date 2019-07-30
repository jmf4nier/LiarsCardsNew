import React from 'react';
import  Login  from './Login';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { GameRoom } from './GameRoom';
import Signup from './Signup'



class App extends React.Component{
  
  render(){
    return (
      <div>
        <Router>
          <Route exact path='/' component={Login}/>
          <Route exact path='/signup' component={Signup}/>
          <Route exact path="/game-room" component={GameRoom} />
        </Router>
      </div>
    )
  }

}

export default App;
