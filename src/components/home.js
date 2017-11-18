import React, { Component } from 'react';
import Masonry from 'react-masonry-component';
import {connect} from 'react-redux';
import {getPins,deletePin,updatePin} from '../actions/pinactions' //adds book to db
import PinZoom from './modalzoom';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready:false,
      pinList:[],
      displayPinZoom:false,
      zoomImage:""
    };
  }
  componentDidMount() {
    getPins("All").then((pinsFromDB)=>{
      this.setState({
        pinList:pinsFromDB
      })
    })
  }
  savePic(element){
    if(this.props.user.user.username==="Guest"){window.location='/auth/twitter'}
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfUpdate = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    let updated = [...element.savedBy,this.props.user.user.username]
    pinListCopy[indexOfUpdate].savedBy = updated;
    console.log(updated)
    this.setState({
      pinList:pinListCopy
    },()=>{updatePin(element._id,updated)})
  }
  deletePic(element){
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfDeletion = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    pinListCopy =[...pinListCopy.slice(0,indexOfDeletion),...pinListCopy.slice(indexOfDeletion+1)]
    this.setState({
      pinList:pinListCopy
    },()=>deletePin(element._id))
  }
  imageStatus(element){
    if(element.owner!==this.props.user.user.username){
      if(element.savedBy.includes(this.props.user.user.username)){
        return null;
      }
      else{
        return(
          <button className="actionbutton" onClick={()=>this.savePic(element)}><i className="fa fa-thumb-tack" aria-hidden="true"></i> Save</button>
        )
      }
    }
    else{
        return(
          <button className="actionbutton" onClick={()=>this.deletePic(element)}>Delete</button>
        )
    }
  }
  buildImages(){
    var masonryOptions = {
      transitionDuration: 0
    };
    let images = ["https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/JkFcl","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/JkFcl"]
    //console.log()
    var childElements = this.state.pinList.map((element,idx)=>{
    return (
        <div key={idx} className="image-box">
            <img  className="image-format" src={element.imgLink} onClick={()=>this.pinEnlarge(element.imgLink)}/>
            <div className="fake"></div>
            <div className="description text-center"> {element.imgDescription}</div>
            {this.imageStatus(element)}
            <div className="owner">Linked By: {element.owner}</div>
        </div>
    );
    });
    return childElements
  }
  pinEnlarge(currentImg){
    this.setState({
      displayPinZoom:true,
      zoomImage:currentImg
    })
  }
  render() {


  return (
      <div id="mainframe">
        <Masonry>
          {this.buildImages()}
        </Masonry>
        <PinZoom
        message={this.state.displayPinZoom}
        reset={()=>this.setState({displayPinZoom:false})}
        imgSrc={this.state.zoomImage}
        />
      </div>
      );
  }
}

function mapStateToProps(state){
  return state
}
export default connect(mapStateToProps)(Home)
