"use strict" //home page for both authorized and unauthorized users
import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
  }
  handleLogin(){
    window.location="/auth/twitter"
  }
  render() {
    return (
      <div id="logincard">
        <div>
          <div id="welcome">Welcome to PClone</div>
          <div id="subheader">Find new ideas to try</div>
        </div>
        <button id="loginbutton" onClick={()=>this.handleLogin()}><span id="twitter"><i className="fa fa-twitter" aria-hidden="true"></i></span><span id="buttontext">Continue With Twitter</span></button>
      </div>
    );
  }

}

export default Home;
