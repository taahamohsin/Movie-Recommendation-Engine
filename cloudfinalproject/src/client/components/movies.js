'use strict';

import React, {Component} from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import Movie from './Movie.js';

const labelStyle={
    color:'LightGray'
}

const buttonStyle={
    backgroundColor:'#8B7D20',
    border: '1px solid #8B7D20',
    borderRadius:'5px'
}

const formStyles={
    margin:'0px 20px 0px 0px'
}

class Movies extends Component{

    constructor(props){
        super(props);
        this.state={
            movies:[]
        };
        this.onAdd  =   this.onAdd.bind(this);
        this.final  =   this.final.bind(this);
        this.getIndex=  this.getIndex.bind(this);
    }    


    onAdd=(event)=>{
        event.preventDefault();
        let query=document.getElementById('title').value
        $.ajax({
            method:'GET',
            url:`/v1/movie/${query}`
        }).then(
            (res)=>{
                let newMovies=this.state.movies;
                newMovies.push(
                    {'title':res.data.original_title,'plot':res.data.overview, 'homepage':res.data.homepage, 'runtime':res.data.runtime, 'vote_average':res.data.vote_average, 'cast':res.data.credits.cast, 'genres':res.data.genres});
                this.setState({
                    movies:newMovies
                })
        }
        ).fail(
            err=>{
                console.log(JSON.stringify(err))
            }
        )
    }

    final() {
        //get user from props?
        const data={movies: this.state.movies};
        $.ajax({
            method:'PUT',
            url: `/v1/movie/watch`,
            data: data
        }).then(()=>{
            this.props.history.push('/profile')
        }).fail(err=> {
            console.log("error");
        })
    }

    getIndex(index){
        let newArr=this.state.movies.filter(movie=>movie.title!=index)
        console.log(newArr)
        this.setState({
            movies:newArr
        })
        
    }

    render(){ 
        let movies = this.state.movies.map((movie, index) => (
            <Movie key={index} title={movie.title} plot={movie.plot} homepage={movie.homepage} runtime={movie.runtime} vote_average={movie.vote_average} onRemove={this.getIndex} cast={movie.cast} genres={movie.genres}/>
        ));

        return(
            <div>
                <form className="form-inline">
                    <div className="form-group">
                        <label className="col-sm-2 control-label" style={labelStyle} htmlFor="title">Title:</label>
                        <div className="col-sm-10">
                            <input className="form-control" id="title" type="text" placeholder="Title"/>
                        </div>
                    </div>
                    <div className="form-group" style={formStyles}>
                        <label className="col-sm-2 control-label" style={labelStyle} htmlFor="year">Year:</label>
                        <div className="col-sm-10">
                            <input className="form-control" id="year" type="text" placeholder="Year"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-2 control-label" style={labelStyle} htmlFor="genre">Genre:</label>
                        <div className="col-sm-10">
                            <input className="form-control" id="genre" type="text" placeholder="Genre"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-20">
                            <div className='btn-group-vertical'>
                                <button className="btn btn-default" style={buttonStyle} onClick={this.onAdd}>Add to my list</button>
                                <br/>
                                <button className="btn btn-default" style={buttonStyle} onClick={this.final}>Give me recommendations</button>
                            </div>
                        </div>
                    </div>
                </form>
                {movies}
            </div>
        )
    }

}

export default withRouter(Movies);