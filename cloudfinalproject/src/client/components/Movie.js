import React, {Component} from 'react';
import { Image } from 'react-bootstrap';
import {Link}    from 'react-router-dom'
let moment= require('moment');
require("moment-duration-format");

const divStyle={
    backgroundColor:'#6495ED',
    borderRadius:'10px',
    padding:'10px',
    paddingLeft:'2.5px',
    paddingRight:'2.5px',
    textAlign:'center',
    marginBottom:'20px',
    position:'relative'
}

const headerStyle={
    textAlign:'center'
}

const buttonStyle={
    backgroundColor:'#8B7D20',
    border: '1px solid #8B7D20',
    borderRadius:'5px',
    position:'relative',
    top:'0',
    right:'0'
}

const hidden={
    visibility:'hidden'
}

export default class Movie extends Component{
    
    constructor(props){
        super(props);
    }
 

    render(){
        let duration=moment.duration(this.props.runtime, "minutes").format("h:mm");
        let arr=duration.split(":");
        duration=arr[0]+" hour(s) and "+duration[2]+" minute(s)"
        return (
            <div key={this.props.index} style={divStyle}>
                <button className="btn btn-default" style={buttonStyle} onClick={()=>this.props.onRemove(this.props.title)}>Remove</button>
                <h3 style={headerStyle}>{this.props.title}</h3>
                {/*{this.props.poster?<Image src={image} responsive/>:null}*/}
                <p>{this.props.plot}</p>
                {this.props.homepage?<Link to={this.props.homepage} target="_blank" >See More</Link>:""}
                <p><b>Runtime: </b>{duration}</p>   
                <p><b>Rating: </b>{this.props.vote_average}/10</p>
            </div>
        )
}
}
