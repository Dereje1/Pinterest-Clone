/* eslint-disable semi */
// menu bar
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Nav, NavItem, Navbar } from 'react-bootstrap';

import { setGuest } from '../actions/authentication'; // sets fake guest account

class Menu extends Component {

  handleGuest() { // set guest user
    this.props.setGuest()
  }

  handleLogin() { // twitter authentication
    window.location='/auth/twitter'
  }

  findActive() { // return the currently active route from router to display active menu
    if (this.props.routeInfo==='/pins') {
      return 3;
    }
    if (this.props.routeInfo==='/') {
      return 2
    }
  }

  render() {
    if(!this.props.user.user.authenticated) { // for non authenticated users
      if(this.props.user.user.username==='Guest') { // for guests
        return(
          <Navbar fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/"><i className="fa fa-pinterest" aria-hidden="true"></i> Clone</a>
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
      // display only login and welcome card if null username
      return (
        <div id="cover">
          <div id="logincard">
            <div>
              <div id="logo"><i className="fa fa-pinterest" aria-hidden="true"></i></div>
              <div id="welcome">Welcome to Pinterest</div>
              <div id="subheader">Find new ideas to try</div>
              <div id="disclaimer">Cloned For Educational Purposes Only!</div>
              <div id="gitsource"><a href="https://github.com/Dereje1/Pinterest-Clone" target="_blank"> <i className="fa fa-github" aria-hidden="true"></i> Github</a></div>
            </div>
            <div>
              <button id="guestbutton" onClick={()=>this.handleGuest()}><span id="guest"><i className="fa fa-question-circle" aria-hidden="true"></i></span><span className="buttontext">Continue As Guest</span></button>
              <button id="loginbutton" onClick={()=>this.handleLogin()}><span id="twitter"><i className="fa fa-twitter" aria-hidden="true"></i></span><span className="buttontext">Continue With Twitter</span></button>
            </div>
          </div>
        </div>
      );
    }
    // for twitter authenticated users
    return (
      <Navbar fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/"><i className="fa fa-pinterest" aria-hidden="true"></i> Clone</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight activeKey={this.findActive()}>
            <NavItem eventKey={2} href="/">Home</NavItem>
            <NavItem eventKey={3} href="/pins">My Pins</NavItem>
            <NavItem eventKey={5} href="/logout">Logout {this.props.user.user.displayname.split(' ')[0]}</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }

}

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setGuest:setGuest
  }, dispatch)
}
// only reads store state does not write to it
export default connect(mapStateToProps, mapDispatchToProps)(Menu)
