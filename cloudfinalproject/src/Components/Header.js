import React, {Component} from 'react'
import Toolbar, {ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import FlatButton from 'material-ui/FlatButton'

export default class Header extends Component{
    
    render(){
         const toolBarStyles={
            'fontFamily':'Baskerville',
            'fontSize':'20 px',
            'color':'white',
            'backgroundColor':"#4C080E",
            'textAlign':'center',

        };

       const rightGroupStyle={
            'clear':'left'
       }
       
       const buttonStyle={
           'backgroundColor':'#726F0B',
           'textAlign':'center',
           'fontFamily':'Baskerville'
       }    

          return(
            <Toolbar style={toolBarStyles}>
                {/*This is onyl here to keep the login and register on the right side temporarily*/}
                <ToolbarGroup></ToolbarGroup>
                {/*//TODO: Display only if the user is logged in
                {/*<ToolbarGroup>
                    <FlatButton label="Login" href="/login" style={buttonStyle}/>                        
                </ToolbarGroup>*/}
                {window.location.href.indexOf("/login")==-1?
                <ToolbarGroup style={rightGroupStyle}>
                    <FlatButton label="Login" href="/login" style={buttonStyle}/>
                    <FlatButton label="Register" href="/register" style={buttonStyle}/>
                </ToolbarGroup>:
                <ToolbarGroup style={rightGroupStyle}>
                    <FlatButton label="Register" href="/register" style={buttonStyle}/>
                </ToolbarGroup>
           }
          </Toolbar>
        )
    }
}