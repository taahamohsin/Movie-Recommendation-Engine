import React, {Component} from 'react'
import { Redirect, withRouter } from 'react-router-dom';
import Movie from './Movie.js'

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
        this.onSubmit=  this.onSubmit.bind(this);
        this.onAdd  =   this.onAdd.bind(this);
        this.final  =   this.final.bind(this);
    }    

    onSubmit=(event)=>{
        event.preventDefault();
        let query=document.getElementById('title').value
        $.ajax({
            method:'GET',
            url:`/v1/movie/${query}`
        }).then(
            (res)=>{
                console.log(JSON.stringify(res));
        }
        ).fail(
            err=>{
                console.log(JSON.stringify(err))
            }
        )
    }

    onAdd=(event)=>{
        event.preventDefault();
        let query=document.getElementById('title').value
        $.ajax({
            method:'GET',
            url:`/v1/movie/${query}`
        }).then(
            (res)=>{
                // console.log('https://image.tmdb.org/t/p/w342'+res.data.poster_path)
                // let url='https://image.tmdb.org/t/p/w342'+res.data.poster_path;
                this.setState({
                    movies:[<Movie index={this.state.movies.length} title={res.data.original_title} plot={res.data.overview}/>]
                })
        }
        ).fail(
            err=>{
                console.log(JSON.stringify(err))
            }
        )
        // add to this.state.movies and trigger a re-render
    }

    final() {
        //get user from props?
        const data={movies: this.state.movies};
        $.ajax({
            method:'PUT',
            url: `/v1/movie/recommend`,
            data: data
        }).then(()=>{
            this.props.history.push('/profile')
        }).fail(err=> {
            console.log("error");
        })
    }

    render(){
        console.log(this.state);
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
                                <button className="btn btn-default" style={buttonStyle} onClick={this.onSubmit}>Search by title</button>
                                <br/>
                                <button className="btn btn-default" style={buttonStyle} onClick={this.onAdd}>Add to my list</button>
                            </div>
                        </div>
                    </div>
                </form>  
                {console.log(this.state)}
                {this.state.movies[0]}
                <button className="btn btn-default" style={buttonStyle} onClick={}>Give me recommendations</button>
            </div>
        )
    }

}

export default withRouter(Movies);