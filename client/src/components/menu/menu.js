/* eslint-disable semi */
// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './menu.scss';

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      menuIsCollapsed: window.innerWidth < 600,
      collapseToggle: false,
    };
  }

  componentDidMount() {
    console.log('Menu just Mounted')
    this.setState(
      {
        menuIsCollapsed: window.innerWidth < 600,
        collapseToggle: false,
      },
    );
  }

  componentDidUpdate(prevProps) {
    const { message } = this.props;
    const { collapseToggle } = this.state;
    if ((prevProps.message === false) && (message === true) && (collapseToggle)) {
      this.setState({ collapseToggle: !collapseToggle })
    }
    return null;
  }

  toggleCollapse = () => {
    const { collapseToggle } = this.state;
    this.setState({ collapseToggle: !collapseToggle })
  }

  collapsedMenu = () => (
    <div className="items collapsed burger">
      <i
        className="fa fa-bars"
        aria-hidden="true"
        onClick={this.toggleCollapse}
      />
    </div>
  )

  render() {
    const { menuIsCollapsed, collapseToggle } = this.state;
    const { user } = this.props;
    if (!user.user.authenticated) { // for non authenticated users
      return (
        <div className="menu">
          <div className="header">
            <div className="brand">
              <a href="/">
                <i className="fa fa-pinterest" aria-hidden="true" />
                {' Clone'}
              </a>
            </div>
          </div>
          <div className="items">
            <a href="/auth/twitter">Login with Twitter</a>
          </div>
        </div>
      )
    }
    // for twitter authenticated users
    return (
      <React.Fragment>
        <div className="menu">
          <div className="header">
            <div className="brand">
              <a href="/">
                <i className="fa fa-pinterest" aria-hidden="true" />
                {' Clone'}
              </a>
            </div>
          </div>
          {
            !menuIsCollapsed
              ? (
                <div className="items extended">
                  <NavLink exact to="/">Home</NavLink>
                  <NavLink exact to="/pins">My Pins</NavLink>
                  <NavLink to="/another" onClick={() => window.location.assign('auth/logout')}>Logout</NavLink>
                </div>
              )
              : this.collapsedMenu()
          }
        </div>
        {
          menuIsCollapsed
            ? (
              <div className={collapseToggle ? 'responsivemenu drop' : 'responsivemenu lift'}>
                <NavLink exact to="/" onClick={this.toggleCollapse}>Home</NavLink>
                <NavLink exact to="/pins" onClick={this.toggleCollapse}>My Pins</NavLink>
                <NavLink to="/another" onClick={() => window.location.assign('auth/logout')}>Logout</NavLink>
              </div>
            )
            : null
        }
      </React.Fragment>
    )
  }

}

export default Menu;

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  user: PropTypes.shape(PropTypes.shape),
  message: PropTypes.bool.isRequired,
};
