import React from 'react'
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

export default class Signup extends React.Component{
    state={
        username: '',
        password: '',
        badPassword: false,
        badUsername: false
    }

    resetErrors = ()=>{
        this.setState({
            badPassword: false,
            badUsername: false
        })
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
        fetch('http://10.185.0.68:8080/signup', {
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
        .then(result=>{
            if(result === 'password too short'){
                this.setState({
                    badPassword: true
                })
            }else if(result === 'username taken'){
                this.setState({
                    badUsername: true
                })
            }else{
                window.localStorage.setItem('token', result)
                this.props.history.push('/')
            }
        })
        .then(this.setState({
            password: '',
            username: ''
        }))
    }

    render(){
        let {badPassword, badUsername} = this.state
        return(
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    {badPassword?<Header as='h2' color='red' textAlign='center'>Password must be at least 5 characters</Header>:null}
                    {badUsername?<Header as='h2' color='red' textAlign='center'>Username not available</Header>:null}
                    <Header as='h2' color='teal' textAlign='center'>
                        Create your account 
                    </Header>
                    <Form size='large'>
                        <Segment stacked>
                        <Form.Input fluid icon='user' 
                            iconPosition='left' 
                            placeholder='Username' 
                            type='text' 
                            name='username' 
                            onChange={e=>{
                                this.handleOnChange(e.target.name, e.target.value);
                                this.resetErrors()
                            }}/>
                        <Form.Input
                            name='password'
                            fluid icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            onChange={e=>{
                                this.handleOnChange(e.target.name, e.target.value);
                                this.resetErrors()
                            }}/>
                        <Button color='teal' fluid size='large' onClick={this.handleLogin}>
                            Submit
                        </Button>
                    </Segment>
                    </Form>
                </Grid.Column>
            </Grid>
        )
    }
}