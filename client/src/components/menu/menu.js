// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getUser } from '../../actions/authentication';
import updateSearch from '../../actions/search';
import Search from './search';
import Cover from '../cover/cover.tsx';
import SignIn from '../signin/signin.tsx';
import CollapsibleMenu from './CollapsibleMenu';
import './menu.scss';

export const mapStateToProps = ({ user }) => ({ user });
const actionCreators = {
  getUser,
  updateSearch,
};

export function Brand() {
  return (
    <div className="brand">
      <a href="/">
        <i className="fa fa-pinterest" aria-hidden="true" />
        {' Clone'}
      </a>
    </div>
  );
}

export function Login({ showSignIn }) {
  return (
    <div className="items login">
      <i
        className="fa fa-sign-in"
        aria-hidden="true"
        onClick={showSignIn}
      />
    </div>
  );
}

export function ExpandedMenu() {
  return (
    <>
      <NavLink exact to="/">Home</NavLink>
      <NavLink exact to="/pins">My Pins</NavLink>
      <NavLink to="/another" onClick={() => window.location.assign('/auth/logout')}>Logout</NavLink>
    </>
  );
}

export class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      menuIsCollapsed: window.innerWidth < 600, // test for screen size
      displaySignIn: false,
      showSearch: false,
    };
  }

  componentDidMount() {
    console.log('Menu just Mounted');
    const { getUser: getUserStatus } = this.props;
    getUserStatus('/auth/profile');
    this.setState(
      {
        menuIsCollapsed: window.innerWidth < 600,
      },
    );
  }

  renderMenu = (authenticated) => {
    const {
      location: { pathname },
    } = this.props;
    const {
      menuIsCollapsed, displaySignIn,
    } = this.state;
    if (authenticated) {
      return (menuIsCollapsed)
        ? <CollapsibleMenu pathname={pathname} />
        : (
          <div className="items extended">
            <ExpandedMenu />
          </div>
        );
    }
    return (
      <>
        <Login showSignIn={() => this.setState({ displaySignIn: true })} />
        {displaySignIn && (
          <SignIn
            removeSignin={() => this.setState({ displaySignIn: false })}
          />
        )}
      </>
    );
  };

  render() {
    // render cover/guest / logged in menu bar
    const {
      showSearch,
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
    return (
      <div className="menu">
        {!showSearch && <Brand /> }
        <Search
          isShowing={showSearch}
          openSearch={() => this.setState({ showSearch: true })}
          closeSearch={() => this.setState({ showSearch: false })}
          searchUpdate={searchUpdate}
          pathname={pathname}
        />
        { !showSearch && this.renderMenu(authenticated)}
      </div>
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

Login.propTypes = {
  showSignIn: PropTypes.func.isRequired,
};
