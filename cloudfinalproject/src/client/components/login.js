/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';


import React, { Component}     from 'react';
import { Redirect, withRouter } from 'react-router-dom';
/*************************************************************************/

const labelStyle={
    color:'LightGray'
}

const buttonStyle={
    backgroundColor:'#8B7D20',
    border: '1px solid #8B7D20'
}

class Login extends Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(ev) {
        ev.preventDefault();
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        $.ajax({
            url: "/v1/session",
            method: "post",
            data: data
        }).then(data => {
            this.props.user.logIn(this.props.history, data);
        })
        .fail(err => {
            console.log(JSON.stringify(err))
            // let errorEl = document.getElementById('errorMsg');
            // errorEl.innerHTML = `Error: ${err.responseJSON.error}`;
        });
    }

    render() {
        return <div className="row">
            <div className="col-xs-2"/>
            <div className="col-xs-8">
                <div className="center-block">
                    <p id="errorMsg" className="bg-danger"/>
                </div>
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="col-sm-2 control-label" style={labelStyle} htmlFor="username">Username:</label>
                        <div className="col-sm-10">
                            <input className="form-control" id="username" type="text" placeholder="Username"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label" style={labelStyle} htmlFor="password">Password:</label>
                        <div className="col-sm-10">
                            <input className="form-control" id="password" type="password" placeholder="Password"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <button className="btn btn-default" style={buttonStyle} onClick={this.onSubmit}>Login</button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="col-xs-2"/>
        </div>
    };
}

export default withRouter(Login);