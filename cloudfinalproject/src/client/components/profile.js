'use strict';

import React, { Component }             from 'react';
import { Link, withRouter, Redirect }             from 'react-router-dom';
import { GravHash }                     from './header';
import '../app.css'
/*************************************************************************/

const divStyle={
    color:'LightGray'
}

const tableStyle={
    color:'LightGray'
}

const Movie = ({ movie, index }) => {
    return <tr key={index}>
        <th>{movie.title}</th>
        <th>{movie.score}</th>
    </tr>;
};

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                primary_email: "",
                movies: [],
                recomMovies: {recommendedMovies:[]}
            },
            editing:false

        };
        this.onClickEdit=this.onClickEdit.bind(this);
        this.onSubmit=this.onSubmit.bind(this);
        this.onCancel=this.onCancel.bind(this);
    }

    fetchUser(username) {
        $.ajax({
            url: `/v1/user/${username}`,
            method: "get"
        })
            .then(data => {
                console.log(JSON.stringify(data))
                this.setState({ user: data });
            })
            .fail(err => {
                console.log(JSON.stringify(err))
                let errorEl = document.getElementById('errorMsg');
                // errorEl.innerHTML = `Error: ${err.responseJSON.error}`;
            });
    }

    componentDidMount() {
        this.fetchUser(this.props.match.params.username);

    }

    componentWillReceiveProps(nextProps) {
        this.fetchUser(nextProps.match.params.username);
    }

    onClickEdit(){
        this.setState({
            editing:true
        });
    }

    onCancel(ev) {
        ev.preventDefault();
        this.setState({
            editing: false
        });
    }


    onSubmit(ev) {
        ev.preventDefault();
        let first_name= document.getElementById('first_name').value;
        let last_name= document.getElementById('last_name').value;
        let city= document.getElementById('city').value;
        const data = {}
        if(first_name)data.first_name=first_name;
        if(last_name)data.last_name=last_name;
        if(city)data.city=city;
      
            $.ajax({
                url: "/v1/user",
                method: "put",
                data: data
            })
                .then(() => {
                   let newData={
                       first_name:data.first_name,
                       last_name:data.last_name,
                       city:data.city
                   }
                    this.setState({
                        editing: false,
                        user:{
                            // ...this.state.user,...data
                        }
                    })
                })
                .fail(err => {
                    let errorEl = document.getElementById('errorMsg');
                    errorEl.innerHTML = `Error: ${err.responseJSON.error}`;
                });
        
    }

    render() {
        console.log(this.state)
        // Is the logged in user viewing their own profile
        const isUser = this.props.match.params.username === this.props.user.getUser().username;
        // Build array of games
        console.log(this.state.user.recomMovies.recommendedMovies);
        let movies=[];
        for(let index=0; index<this.state.user.recomMovies.recommendedMovies.length; index++){
            movies.push(<Movie key={index} movie={this.state.user.recomMovies.recommendedMovies[index]} index={index}/>)
        }
        // let movies =this.state.user.recomMovies.recommendedMovies.map((movie, index) =>{
        //         <Movie key={index} movie={movie} index={index}/>
        // });
        console.log("MOVIES")
        console.log((movies))
        return <div className="row" style={divStyle}>
            <div className="center-block">
                <p id="errorMsg" className="bg-danger"/>
            </div>
            <div className="col-xs-2">
                <h4>Player Profile</h4>
                { isUser ? <Link to={`/profile/${this.props.match.params.username}/edit`} onClick={this.onClickEdit}>Edit Profile</Link> : undefined }
            </div>
            <div className="col-xs-8">
                <div className="row">
                    <div className="col-xs-1">
                        <img src={GravHash(this.state.user.primary_email, 100)}/>
                    </div>
                    {this.state.editing ?
                    <div className="col-xs-10 edit">
                            <div className="col-xs-6">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label className="col-sm-2 control-label" htmlFor="first_name">First Name:</label>
                                        <div className="col-sm-10">
                                            <input className="form-control" id="first_name" type="text" placeholder="First Name"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-2 control-label" htmlFor="last_name">Last Name:</label>
                                        <div className="col-sm-10">
                                            <input className="form-control" id="last_name" type="text" placeholder="Last Name"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-2 control-label" htmlFor="city">City:</label>
                                        <div className="col-sm-10">
                                            <input className="form-control" id="city" type="text" placeholder="City"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="col-sm-offset-2 col-sm-10">
                                            <button onClick={this.onSubmit} className="btn btn-default">Save Changes</button>
                                            <button onClick={this.onCancel} className="btn btn-default">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                    </div>
                            :
                        <div className="col-xs-11">
                            <div className="col-xs-6 text-right">
                                <p><b>Username:</b></p>
                                <p><b>First Name:</b></p>
                                <p><b>Last Name:</b></p>
                                <p><b>City:</b></p>
                                <p><b>Email Address:</b></p>
                            </div>

                            <div className="col-xs-6">
                                <p>{this.state.user.username}</p>
                                <p>{this.state.user.first_name}</p>
                                <p>{this.state.user.last_name}</p>
                                <p>{this.state.user.city}</p>
                                <p>{this.state.user.primary_email}</p>
                            </div>
                    </div>
                    }
                </div>
                <div className="row">
                    <div className="col-xs-12">                        
                        { isUser ? <Link to="/movies">Look for movies</Link> : undefined }
                        <h4 id="games_count">{this.state.user.recomMovies.recommendedMovies.length} movie recommendations for you</h4>
                    </div>
                    <table id="gameTable" className="col-xs-12 table" style={tableStyle}>
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>{movies}</tbody>
                    </table>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(Profile);