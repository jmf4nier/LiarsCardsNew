import React from 'react'
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

export default class Signup extends React.Component{
    state={
        username: '',
        password: ''
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
        fetch('http://localhost:8080/signup', {
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
        .then(console.log)
        .then(this.setState({
            password: '',
            username: ''
        }))
    }

    render(){
        return(
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 450 }}>
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
                            onChange={e=>this.handleOnChange(e.target.name, e.target.value)}/>
                        <Form.Input
                            name='password'
                            fluid icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            onChange={e=>this.handleOnChange(e.target.name, e.target.value)}/>

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