import React, { Component } from 'react';
import Masonry from 'react-masonry-component';
import {getPins} from '../actions/pinactions' //adds book to db
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready:false,
      pinList:[]
    };
  }
  componentDidMount() {
    getPins("All").then((pinsFromDB)=>{
      this.setState({
        pinList:pinsFromDB
      })
    })
  }
  handleImagesLoaded(){
    console.log("yes!!")
  }
  buildImages(){
    var masonryOptions = {
      transitionDuration: 0
    };
    let images = ["https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/JkFcl","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/JkFcl"]
    //console.log()
    var childElements = this.state.pinList.map(function(element,idx){
    return (
        <div key={idx} className="image-box">
            <img  className="image-format" src={element.imgLink} />
            <div className="description text-center"> {element.imgDescription}</div>
            <button className="savebutton"><i className="fa fa-thumb-tack" aria-hidden="true"></i> Save</button>
            <div className="owner">Linked By: {element.owner}</div>
        </div>
    );
    });
    return childElements
  }
  render() {


  return (
      <div id="mainframe">
        <Masonry>
          {this.buildImages()}
        </Masonry>
      </div>
      );
  }
}

export default Home;
