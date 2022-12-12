// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getUser } from '../../actions/authentication';
import updateSearch from '../../actions/search';
import Search from './search';
import Cover from '../cover/cover';
import SignIn from '../signin/signin';
import './menu.scss';

export const mapStateToProps = ({ user }) => ({ user });
const actionCreators = {
  getUser,
  updateSearch,
};

export class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      initialLoad: true, // used to avoid keyframe anim on initial load
      menuIsCollapsed: window.innerWidth < 600, // test for screen size
      collapseToggle: false, // turns responsive hamburger on/off
      displaySignIn: false,
    };
  }

  componentDidMount() {
    console.log('Menu just Mounted');
    const { getUser: getUserStatus } = this.props;
    getUserStatus('/auth/profile');
    this.setState(
      {
        menuIsCollapsed: window.innerWidth < 600,
        collapseToggle: false,
        initialLoad: true,
      },
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { collapseToggle, initialLoad } = this.state;
    if (prevState.collapseToggle === false && collapseToggle) {
      // don't display responsive menu on initial load
      if (initialLoad) this.setState({ initialLoad: false });
      window.addEventListener('click', this.listenForOutClicks);
    }
    if (prevState.collapseToggle === true && !collapseToggle) {
      window.removeEventListener('click', this.listenForOutClicks);
    }
  }

  toggleCollapse = () => {
    // burger click handler for responsive mode
    const { collapseToggle } = this.state;
    this.setState({ collapseToggle: !collapseToggle });
  };

  listenForOutClicks = (e) => {
    // clicks outside an extended menu will collpase it
    if (!e.target.closest('.menu')) this.toggleCollapse();
  };

  renderMenu = () => {
    const { menuIsCollapsed } = this.state;
    if (menuIsCollapsed) {
      return (
        <div className="items collapsed burger">
          <i
            className="fa fa-bars"
            aria-hidden="true"
            onClick={this.toggleCollapse}
          />
        </div>
      );
    }
    return (
      <div className="items extended">
        <NavLink exact to="/">Home</NavLink>
        <NavLink exact to="/pins">My Pins</NavLink>
        <NavLink to="/another" onClick={() => window.location.assign('auth/logout')}>Logout</NavLink>
      </div>
    );
  };

  render() {
    // render cover/guest / logged in menu bar
    const {
      menuIsCollapsed, collapseToggle, initialLoad, displaySignIn,
    } = this.state;
    const {
      user: { authenticated, username },
      updateSearch: searchUpdate,
      location: { pathname },
    } = this.props;
    if (!username) {
      // render cover
      document.body.classList.add('cover');
      return <Cover />;
    }
    document.body.classList.remove('cover');
    if (!authenticated) {
      // render guest menu bar
      return (
        <div className="menu">
          <div className="brand">
            <a href="/">
              <i className="fa fa-pinterest" aria-hidden="true" />
              {' Clone'}
            </a>
          </div>
          <Search
            searchUpdate={searchUpdate}
            pathname={pathname}
          />
          <div className="items signin">
            <i
              className="fa fa-sign-in"
              aria-hidden="true"
              onClick={() => this.setState({ displaySignIn: true })}
            />
          </div>
          {displaySignIn && (
            <SignIn
              removeSignin={() => this.setState({ displaySignIn: false })}
              caller="menu"
            />
          )}
        </div>
      );
    }
    // render authenticated menu bar
    return (
      <React.Fragment>
        <div className="menu">
          <div className="brand">
            <a href="/">
              <i className="fa fa-pinterest" aria-hidden="true" />
              {' Clone'}
            </a>
          </div>
          <Search
            searchUpdate={searchUpdate}
            pathname={pathname}
          />
          {this.renderMenu()}
        </div>
        {
          !initialLoad && menuIsCollapsed
            && (
              <div className={collapseToggle ? 'responsivemenu drop' : 'responsivemenu lift'}>
                <NavLink exact to="/" onClick={this.toggleCollapse}>Home</NavLink>
                <NavLink exact to="/pins" onClick={this.toggleCollapse}>My Pins</NavLink>
                <NavLink to="/another" onClick={() => window.location.assign('auth/logout')}>Logout</NavLink>
              </div>
            )
        }
      </React.Fragment>
    );
  }

}


export default compose(
  withRouter,
  connect(mapStateToProps, actionCreators),
)(Menu);

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  // stored authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
  // redux action to get user status from server
  getUser: PropTypes.func.isRequired,
  updateSearch: PropTypes.func.isRequired,
  location: PropTypes.shape(PropTypes.shape).isRequired,
};
