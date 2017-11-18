import React, { Component } from 'react';
import {connect} from 'react-redux';
import Masonry from 'react-masonry-component';
import PinCreate from './pincreatemodal';
import {addPin,getPins,deletePin,updatePin} from '../actions/pinactions' //adds book to db
class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate:false,
      pinList:[]
    }
  }
  componentDidMount() {
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
  pinForm(){
    this.setState({
      displayPinCreate:true
    })
  }
  deletePic(element){
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    let indexOfDeletion = pinListCopy.findIndex((p)=>{
      return p._id===element._id
    })
    pinListCopy =[...pinListCopy.slice(0,indexOfDeletion),...pinListCopy.slice(indexOfDeletion+1)]
    if(element.owner!==this.props.user.user.username){//not owner so actually must do an update and not delete
      console.log("Not Yours to fully delete")
      let toUpdate = [...element.savedBy]
      let indexOfUpdate = toUpdate.findIndex((saved)=>{
        return saved===this.props.user.user.username
      })
      toUpdate=[...toUpdate.slice(0,indexOfUpdate),...toUpdate.slice(indexOfUpdate+1)]
      this.setState({
        pinList:pinListCopy
      },()=>updatePin(element._id,toUpdate))
    }
    else{
      this.setState({
        pinList:pinListCopy
      },()=>deletePin(element._id))
    }
  }
  addPic(pinJSON){
    let pinListCopy = JSON.parse(JSON.stringify(this.state.pinList))
    addPin(pinJSON).then((newPin)=>{
      pinListCopy=[...pinListCopy,newPin]
      this.setState({
        pinList:pinListCopy
      })
    })
  }
  buildImages(){
    var childElements = this.state.pinList.map((element,idx)=>{
    return (
        <div key={idx} className="image-box">
            <img  className="image-format" src={element.imgLink} />
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
        </div>
      </div>
    );
  }

}

function mapStateToProps(state){
  return state
}
export default connect(mapStateToProps)(Mypins)
