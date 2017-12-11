import React, { Component } from 'react';
import Landing from './Components/Landing.js';
import Login from './Components/Login.js';
import Header from './Components/Header.js'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';

class Main extends Component{

 constructor(props) {
        super(props);
        this.user = new User(
            window.__PRELOADED_STATE__.username,
            window.__PRELOADED_STATE__.primary_email
        );
    }

render(){
    return (
        <BrowserRouter>
            <MuiThemeProvider>
            <Header/>
            <Route exact path="/" component={Landing}/>
            <Route path="/login" render={() => 
            <Login/>
            }
            />
            </MuiThemeProvider>
        </BrowserRouter>

        );
    }
}


class User {
    constructor(username, primary_email) {
        if (username && primary_email) {
            this.data = {
                username: username,
                primary_email: primary_email
            };
        } else {
            this.data =  {
                username: "",
                primary_email: ""
            };
        }
    }

    loggedIn() {
        return this.data.username && this.data.primary_email;
    }

    username() {
        return this.data.username;
    }

    logIn(router, data) {
        // Store locally
        this.data = data;
        // Go to user profile
        router.push(`/profile/${data.username}`);
    }



    logOut(router) {
        // Remove user info
        this.data = {
            username: "",
            primary_email: ""
        };
        // Go to login page
        router.push('/login');
    }

    getUser() {
        return this.data;
    }
}

render(
    <Main/>,
    document.getElementById('mainDiv')
);
