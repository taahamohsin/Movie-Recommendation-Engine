import React, {Component} from 'react';
import { Image } from 'react-bootstrap';

const divStyle={
    backgroundColor:'#808000',
    borderRadius:'5px'
}

export default class Movie extends Component{
    
    constructor(props){
        super(props);
        this.state={
            url:""
        }
    }
    
    render(){

        
        let image=require(this.props.poster);

        return (
            <div key={this.props.index} style={divStyle}>
                <h1>{this.props.title}</h1>
                {/*{this.props.poster?<Image src={image} responsive/>:null}*/}
                <p>{this.props.plot}</p>
                <p>{this.props.duration}</p>
            </div>
        )
}
}
