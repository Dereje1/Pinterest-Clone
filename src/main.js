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
      ready:false //new addition to only proceed after communication with the store
    }
  }
  componentDidMount(){
    console.log("CDM Mounted for Main")
    this.props.getUser()
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.user.user!==this.props.user.user){//once user info comes from cdm proceed to rendering
      this.setState({ready:true})
    }
  }
    render(){
      //send current route from router to menu
      if(this.state.ready){
        return (
          <div>
              <Menu routeInfo={this.props.location.pathname}/>
              {this.props.children}
          </div>
        )
      }
      else{
        return null
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
