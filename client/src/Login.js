import React from 'react'
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Link } from 'react-router-dom'


export default class Login extends React.Component{
    state={
        username: '',
        password: '',
        error: false
    }
    handleOnChange = (type, value)=>{
        if(type === 'username'){
            this.setState({
                username: value    
            })
        }if (type === 'password'){
            this.setState({
                password: value    
            })
        }
    }

    handleLogin = ()=>{
        
        fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify ({
                'username': this.state.username,
                'password': this.state.password
            })
        })
        .then(rsp=>rsp.text())
        .then(result => {
            if(result !== 'null'){
                window.localStorage.setItem('token', result)
                this.props.history.push('/game-room')
            }else{
                this.setState({
                    error: true,
                    password: ''
                })
            }
           
        })
    }
    
    render(){
        let error = this.state.error
        return(
            
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                {error? <Header as='h2' color='red' textAlign='center'>Wrong Username/Password. Try </Header>:null}
                <Header as='h2' color='teal' textAlign='center'>
                     Log-in to your account 
                </Header>
                <Form size='large'>
                    <Segment stacked>
                    <Form.Input 
                        name='username' 
                        fluid icon='user' 
                        iconPosition='left' 
                        placeholder='Username' 
                        type='text' 
                        onChange={e=>this.handleOnChange(e.target.name, e.target.value)} 
                        value={this.state.username}/>
                    <Form.Input
                        name='password'
                        onChange={e=>this.handleOnChange(e.target.name, e.target.value)}
                        fluid icon='lock'
                        iconPosition='left'
                        placeholder='Password'
                        type='password'
                        value={this.state.password}
                    />

                    <Button color='teal' fluid size='large' onClick={this.handleLogin}>
                        Login
                    </Button>
                    </Segment>
                </Form>
                <Message>
                    New to us? <Link to='/signup'>Sign up</Link>
                </Message>
                </Grid.Column>
            </Grid>
           
        )
    }
}
