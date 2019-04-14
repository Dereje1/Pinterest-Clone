/* eslint-disable semi */
// menu bar
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Nav, NavItem, Navbar } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { setGuest } from '../../actions/authentication'; // sets fake guest account
import Cover from './cover';
import './menu.scss';

class Menu extends Component {

  handleLogin = () => { // twitter authentication
    window.location = '/auth/twitter'
  }

  handleGuest = () => { // set guest user
    const { setGuest: setGuestStatus } = this.props;
    setGuestStatus()
  }

  findActive() { // return the currently active route from router to display active menu
    const { routeInfo } = this.props;
    if (routeInfo === '/pins') {
      return 3;
    }
    return 2
  }

  render() {
    const { user } = this.props;
    if (!user.user.authenticated) { // for non authenticated users
      if (user.user.username === 'Guest') { // for guests
        return (
          <Navbar fixedTop>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">
                  <i className="fa fa-pinterest" aria-hidden="true" />
                  {' Clone'}
                </a>
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
      return <Cover handleGuest={this.handleGuest} handleLogin={this.handleLogin} />;
    }
    // for twitter authenticated users
    return (
      <Navbar fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">
              <i className="fa fa-pinterest" aria-hidden="true" />
              {' Clone'}
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight activeKey={this.findActive()}>
            <NavItem eventKey={2} href="/">Home</NavItem>
            <NavItem eventKey={3} href="/pins">My Pins</NavItem>
            <NavItem eventKey={5} href="/auth/logout">{`Logout ${user.user.displayname.split(' ')[0]}`}</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }

}

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setGuest,
  }, dispatch)
);

// only reads store state does not write to it
export default connect(mapStateToProps, mapDispatchToProps)(Menu)

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  setGuest: PropTypes.func.isRequired,
  user: PropTypes.shape(PropTypes.shape),
  routeInfo: PropTypes.string.isRequired,
};
