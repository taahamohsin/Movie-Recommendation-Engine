import React, { Component } from 'react';
import Landing from './Components/Landing.js';
import Login from './Components/Login.js';
import Header from './Components/Header.js'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';

class App extends Component {

  render() {
   

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

export default App;
