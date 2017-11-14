"use strict"
//root of the frontend get /set primary store vars here
import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux';


//action gets user info on every mount of this component
import {getUser} from './actions/authentication';

class Main extends React.Component{
  componentDidMount(){
    console.log("CDM Mounted for Main")
    this.props.getUser()
  }
    render(){
      return (
        <div>
            {this.props.children}
        </div>
      )
    }
}

function mapStateToProps(state){
  return state
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({
          getUser:getUser
          }, dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(Main)
