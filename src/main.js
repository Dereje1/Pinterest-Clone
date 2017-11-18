"use strict"
//root of the frontend get /set primary store vars here
import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux';

import Menu from './components/menu'
//action gets user info on every mount of this component
import {getUser} from './actions/authentication';

class Main extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      ready:false
    }
  }
  componentDidMount(){
    console.log("CDM Mounted for Main")
    this.props.getUser()
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.user.user!==this.props.user.user){
      this.setState({ready:true})
    }
  }
    render(){
      if(this.state.ready){
        return (
          <div>
              <Menu routeInfo={this.props.location.pathname}/>
              {this.props.children}
          </div>
        )
      }
      else{
        return (
          <div></div>
        )
      }
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
