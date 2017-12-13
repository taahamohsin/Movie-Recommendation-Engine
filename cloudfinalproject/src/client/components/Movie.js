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
    marginBottom:'20px'
}

const headerStyle={
    textAlign:'center'
}

export default class Movie extends Component{
    
    constructor(props){
        super(props);
        this.state={
            url:""
        }
    }
    
    render(){
        let duration=moment.duration(this.props.duration, "minutes").format("h:mm");
        let arr=duration.split(":");
        duration=arr[0]+" hour(s) and "+duration[2]+" minute(s)"
        return (
            <div key={this.props.index} style={divStyle}>
                <h3 style={headerStyle}>{this.props.title}</h3>
                {/*{this.props.poster?<Image src={image} responsive/>:null}*/}
                <p>{this.props.plot}</p>
                <Link to={this.props.homepage} target="_blank" >See More</Link>
                <p>{duration}</p>
            </div>
        )
}
}
