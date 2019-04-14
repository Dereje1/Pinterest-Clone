/* eslint-disable semi */
// menu bar
import React from 'react';
import { Nav, NavItem, Navbar } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './menu.scss';


const Menu = ({ user }) => {
  if (!user.user.authenticated) { // for non authenticated users
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
        <Nav pullRight className="loggedinmenu">
          <React.Fragment>
            <NavLink exact to="/">Home</NavLink>
            <NavLink exact to="/pins">My Pins</NavLink>
            <NavLink to="/another" onClick={() => window.location.assign('auth/logout')}>{`Logout ${user.user.displayname.split(' ')[0]}`}</NavLink>
          </React.Fragment>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}


export default Menu;

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  user: PropTypes.shape(PropTypes.shape),
};
