import React from 'react';
import { Login } from './Login';
import { Chat } from './Chat';


class App extends React.Component{
  
  render(){
    return (
      <div>
        <Login />
        <Chat />
      </div>
    )
  }

}

export default App;
