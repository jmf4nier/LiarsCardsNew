import React from 'react';
import { Login } from './Login';
import { Chat } from './Chat';
import { BrowserRouter as Router, Route } from 'react-router-dom';


class App extends React.Component{
  
  render(){
    return (
      <Router>
        <Route exact path="/" component={Login} />
        <Route exact path="/chat" component={Chat} />
        <Route exact path="/game-room" component={Chat} />
      </Router>
      // <div>
      //   <Login />
      //   <Chat />
      // </div>
    )
  }

}

export default App;
