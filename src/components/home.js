"use strict"//homepage for both logged in and guest users
import React, { Component } from 'react';
import {connect} from 'react-redux';
import Masonry from 'react-masonry-component';

import {getPins,deletePin,updatePin} from '../actions/pinactions' //adds book to db
import PinZoom from './modalzoom';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pinList:[],//stores all pins in db in state
      displayPinZoom:false,//for zoom modal
      imageInfo:""//to send to zoom modal
    };
  }
  componentDidMount() {
    getPins("All").then((pinsFromDB)=>{//get all pins then setstate
      this.setState({
        pinList:pinsFromDB
      })
    })
  }
  savePic(element){//saves a pic owned by somebody else into current users repo
    //can not do this unless logged in
    if(this.props.user.user.username==="Guest"){
      window.location='/auth/twitter'
      return;
    }
    //copy pinlist --> avoid mutation at all cost
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfUpdate = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    //add current username to saved by array of pin
    let updated = [...element.savedBy,this.props.user.user.username]
    //update client then update db
    pinListCopy[indexOfUpdate].savedBy = updated;
    this.setState({
      pinList:pinListCopy
    },()=>{updatePin(element._id,updated)})
  }

  deletePic(element){//deletes a pic that user owns
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfDeletion = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    //update copy -->no mutation and then delete from db
    pinListCopy =[...pinListCopy.slice(0,indexOfDeletion),...pinListCopy.slice(indexOfDeletion+1)]
    this.setState({
      pinList:pinListCopy
    },()=>deletePin(element._id))
  }
  imageStatus(element){//find the status of image to determine what kind of
    //button to place on pic
    if(element.owner!==this.props.user.user.username){//If the user is not owner of the pin
      if(element.savedBy.includes(this.props.user.user.username)){//If the user has already saved this pin
        return null; //no button
      }
      else{//user has not saved this pin show save button
        return(
          <button className="actionbutton" onClick={()=>this.savePic(element)}><i className="fa fa-thumb-tack" aria-hidden="true"></i> Save</button>
        )
      }
    }
    else{//user owns pin show delete button
        return(
          <button className="actionbutton" onClick={()=>this.deletePic(element)}>Delete</button>
        )
    }
  }
  onBrokenImage(id){//handles broken image links
    //basically same as delete pic function but just removes from state and not the databse as image
    //could become reactivated in a future time still keep in database records until owner deletes
    console.log("Broken Image Found",id)
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfDeletion = pinListCopy.findIndex((p)=>{
      return p._id===id
    })
    //update copy -->no mutation but do not delete from db
    pinListCopy =[...pinListCopy.slice(0,indexOfDeletion),...pinListCopy.slice(indexOfDeletion+1)]
    this.setState({
      pinList:pinListCopy
    })
  }

  buildImages(){//build the images in frame using masonry

    var childElements = this.state.pinList.map((element,idx)=>{
    return (
        <div key={idx} className="image-box">
            <img onError={()=>this.onBrokenImage(element._id)} className="image-format" src={element.imgLink} onClick={()=>this.pinEnlarge(element)}/>
            <div className="description text-center"> {element.imgDescription}</div>
            {this.imageStatus(element)}
            <div className="owner">Linked By: {element.owner}</div>
        </div>
    );
    });
    return childElements
  }
  pinEnlarge(currentImg){//calls zoom in modal for the clicked picture
    this.setState({
      displayPinZoom:true,
      imageInfo:currentImg
    })
  }
  render() {

  //render nothing if no guest or authenticated status
  let userStatus = (this.props.user.user.username===null) ? false : true

  if (userStatus){
    return (
        <div id="mainframe">
          <Masonry>
            {this.buildImages()}
          </Masonry>
          <PinZoom
          message={this.state.displayPinZoom}
          reset={()=>this.setState({displayPinZoom:false})}
          zoomInfo={this.state.imageInfo}
          />
        </div>
        );
  }
  else{
    return (null);
  }

  }
}

function mapStateToProps(state){
  return state
}
export default connect(mapStateToProps)(Home)
