import React from 'react'
import AppBar from 'material-ui/AppBar'
import '../App.css';

const appBarStyles={
    'fontFamily':'Baskerville',
    'fontSize':'20 px',
    'color':'white'
}

const Landing = () =>{
        return(
            <div id='landingDiv'>
                <AppBar title={'Home'} showMenuIconButton={false} style={appBarStyles}/>
                Welcome to our app!
            </div>
        )
}

export default Landing;