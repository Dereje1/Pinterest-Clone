import React, { Component } from 'react';
import {connect} from 'react-redux';

import PinCreate from './pincreatemodal';
class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate:false
    }
  }
  pinForm(){
    console.log("Lets create the pin form!")
    this.setState({
      displayPinCreate:true
    })
  }

  render() {
    return (
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
        />
      </div>
    );
  }

}

function mapStateToProps(state){
  return state
}
export default connect(mapStateToProps)(Mypins)
