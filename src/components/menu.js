"use strict" //home page for both authorized and unauthorized users
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Nav, NavItem, Navbar, Button} from 'react-bootstrap';

import {setGuest} from '../actions/authentication'
class Menu extends Component {
  constructor(props) {
    super(props);
  }
  handleGuest(){
    this.props.setGuest()
  }
  handleLogin(){
    window.location="/auth/twitter"
  }
  render() {
    if(!this.props.user.user.authenticated){
      if(this.props.user.user.username==="Guest"){
        return(
          <Navbar fixedTop>
              <Navbar.Header>
                <Navbar.Brand>
                  <a href="/">P Clone</a>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>
              <Navbar.Collapse>
                  <Nav pullRight>
                    <NavItem eventKey={5} href="/auth/twitter">Login with Twitter</NavItem>
                  </Nav>
              </Navbar.Collapse>
         </Navbar>
        )
      }
      else{
        return (
          <div id="cover">
            <div id="logincard">
              <div>
                <div id="welcome">Welcome to PClone</div>
                <div id="subheader">Find new ideas to try</div>
              </div>
              <div>
                <button id="guestbutton" onClick={()=>this.handleGuest()}><span id="guest"><i className="fa fa-question-circle" aria-hidden="true"></i></span><span className="buttontext">Continue As Guest</span></button>
                <button id="loginbutton" onClick={()=>this.handleLogin()}><span id="twitter"><i className="fa fa-twitter" aria-hidden="true"></i></span><span className="buttontext">Continue With Twitter</span></button>
              </div>
            </div>
          </div>
        );
      }
    }
    else{
      return(
        <Navbar fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">P Clone</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav pullRight>
                  <NavItem eventKey={2} href="/"><strong>Home</strong></NavItem>
                  <NavItem eventKey={3} href="/pins">My Pins</NavItem>
                  <NavItem eventKey={5} href="/logout">Logout {this.props.user.user.displayname.split(' ')[0]}</NavItem>
                </Nav>
            </Navbar.Collapse>
       </Navbar>
      )
    }

  }

}

function mapStateToProps(state){
  return state
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
          setGuest:setGuest
          }, dispatch)
}
//only reads store state does not write to it
export default connect(mapStateToProps,mapDispatchToProps)(Menu)
