// menu bar
import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getUser } from '../../actions/authentication';
import updateSearch from '../../actions/search';
import Search from './search';
import Cover from '../cover/cover';
import SignIn from '../signin/signin';
import CollapsibleMenu from './CollapsibleMenu';
import { userType } from '../../interfaces';
import './menu.scss';

export const mapStateToProps = ({ user }: {user: userType}) => ({ user });
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

export function Login({ showSignIn }:{showSignIn: () => void}) {
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

interface MenuProps {
  user: userType
  getUser: (path: string) => void
  updateSearch: () => void
  location: {
    pathname: string
  }
}

interface MenuState {
  menuIsCollapsed: boolean
  displaySignIn: boolean,
  showSearch: boolean,
}

export class Menu extends React.Component<MenuProps, MenuState> {

  constructor(props: MenuProps) {
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

  renderMenu = (authenticated: boolean) => {
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
