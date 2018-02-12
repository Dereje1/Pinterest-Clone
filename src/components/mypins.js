"user strict" //user page only for authenticated users
import React, { Component } from 'react';
import {connect} from 'react-redux';
import Masonry from 'react-masonry-component';

import PinCreate from './pincreatemodal';
import {addPin,getPins,deletePin,updatePin} from '../actions/pinactions' //pin CRUD
import PinZoom from './modalzoom';

class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate:false,//controls pin creation modal
      pinList:[],//collects the pins user owns and saved
      displayPinZoom:false,//controls pin zoom modal
      imageInfo:""//used to send to pin zoom
    }
  }
  componentDidMount() {
    //get all pins and filter by owned and saved and then concatenate and set state
    getPins("All").then((pinsFromDB)=>{
      let ownerFilter = pinsFromDB.filter((pin)=>{
        return pin.owner === this.props.user.user.username
      })
      let savedFilter = pinsFromDB.filter((pin)=>{
        return pin.savedBy.includes(this.props.user.user.username)
      })
      this.setState({
        pinList:[...ownerFilter,...savedFilter]
      })
    })
  }

  pinForm(){//display pin creation modal
    this.setState({
      displayPinCreate:true
    })
  }

  pinEnlarge(currentImg){//display pin zoom modal and passes image info
    this.setState({
      displayPinZoom:true,
      imageInfo:[currentImg,<button className="actionbutton" onClick={()=>this.deletePic(currentImg)}>Delete</button>]
    })
  }

  deletePic(element){//deletes a picture
    //however if not owner must only do an update as you MUST be owner to completely delete it from
    //database but can delete from client state
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfDeletion = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    pinListCopy =[...pinListCopy.slice(0,indexOfDeletion),...pinListCopy.slice(indexOfDeletion+1)]
    if(element.owner!==this.props.user.user.username){//not an owner of the pin
      //ready to update pin
      let toUpdate = [...element.savedBy]//copy all users who have saved pin
      let indexOfUpdate = toUpdate.findIndex((saved)=>{
        return saved===this.props.user.user.username
      })
      //remove user from list
      toUpdate=[...toUpdate.slice(0,indexOfUpdate),...toUpdate.slice(indexOfUpdate+1)]
      //update state with deleted pin but update db with updated pin
      this.setState({
        pinList:pinListCopy,
        displayPinZoom:false
      },()=>updatePin(element._id,toUpdate))
    }
    else{//user owns pin can delete both from state and db
      this.setState({
        pinList:pinListCopy,
        displayPinZoom:false
      },()=>deletePin(element._id))
    }
  }

  addPic(pinJSON){//adds a pin to the db
    //copy then add pin to db and then update client state (in that order)
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    addPin(pinJSON).then((newPin)=>{
      pinListCopy=[...pinListCopy,newPin]
      this.setState({
        pinList:pinListCopy
      })
    })
  }
  onBrokenImage(id){//handles broken image links on user page
    //if the image is broken it will modify link to placeholder only on client side
    //keeps original link in db, in case image becomes activated in the future
    console.log("Broken Image Found",id)
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfModification = pinListCopy.findIndex((p)=>{
      return p._id===id
    })
    //update copy of image link and description
    pinListCopy[indexOfModification].imgLink = '/images/NO-IMAGE.png'
    pinListCopy[indexOfModification].imgDescription = pinListCopy[indexOfModification].imgDescription +' Is Broken'

    this.setState({
      pinList:pinListCopy
    })
  }
  buildImages(){//bulds images using masonry very similar to home component (may merge in future)
    var childElements = this.state.pinList.map((element,idx)=>{
    return (
        <div key={idx} className="image-box">
            <img  onError={()=>this.onBrokenImage(element._id)} className="image-format" src={element.imgLink} onClick={()=>this.pinEnlarge(element)}/>
            <div className="description text-center"> {element.imgDescription}</div>
            <button className="actionbutton" onClick={()=>this.deletePic(element)}>Delete</button>
            <div className="owner">Linked By: {element.owner}</div>
        </div>
      );
    });
    return childElements
  }
  render() {
    return (
      <div>
        <div id="mypinframe">
          <h3 id="username">{this.props.user.user.displayname}</h3>
          <div id="creatpinwrapper" onClick={()=>{this.pinForm()}}>
            <div id="createpin">
              <i className="fa fa-plus-circle" aria-hidden="true"></i>
            </div>
            <h3 id="createpintext">Create Pin</h3>
          </div>
          <PinCreate
          message={this.state.displayPinCreate}
          reset={()=>this.setState({displayPinCreate:false})}
          userInfo={this.props.user.user}
          savePin={(pinJSON)=>this.addPic(pinJSON)}
          />
        </div>
        <div id="userImageFrame">
          <Masonry>
            {this.buildImages()}
          </Masonry>
          <PinZoom
          message={this.state.displayPinZoom}
          reset={()=>this.setState({displayPinZoom:false})}
          zoomInfo={this.state.imageInfo}
          />
        </div>
      </div>
    );
  }

}

function mapStateToProps(state){
  return state
}
export default connect(mapStateToProps)(Mypins)
