import React, { Component } from 'react';
import Landing from './Components/Landing.js';
import Login from './Components/Login.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import { BrowserRouter, Route } from 'react-router-dom';
import AppBar from 'material-ui/AppBar'
import RaisedButton from 'material-ui/RaisedButton'
import './App.css';

class App extends Component {

  render() {
    const appBarStyles={
    'fontFamily':'Baskerville',
    'fontSize':'20 px',
    'color':'white',
    'height':'60px'
}

    return (
      <BrowserRouter>
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <AppBar title={'Home'} showMenuIconButton={false} style={appBarStyles}>
           {window.location.href.indexOf("/login")==-1?
            <RaisedButton label="Login" href="/login"/>:
            <RaisedButton label="Register" href="/register"/>
           }
          </AppBar>
        <Route exact path="/" component={Landing}/>
        <Route path="/login" render={() => 
          <Login/>
        }/>
        </MuiThemeProvider>
      </BrowserRouter>

    );
  }
}

export default App;
