// menu bar
import React, { ComponentType } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getUser } from '../../actions/authentication';
import updateSearch from '../../actions/search';
import Search from './search';
import Cover from '../cover/cover';
import SignIn from '../signin/signin';
import CollapsibleMenu from './CollapsibleMenu';
import { Loading } from '../common/common';
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
      <a href="https://github.com/Dereje1/Pinterest-Clone" target="_blank" rel="noopener noreferrer">
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

interface MenuProps {
  user: userType
  getUser: (path: string) => void
  updateSearch: () => void
  location: {
    pathname: string,
  }
}

interface MenuState {
  displaySignIn: boolean,
  showSearch: boolean,
  ready: boolean
}

export class Menu extends React.Component<MenuProps, MenuState> {

  constructor(props: MenuProps) {
    super(props);
    this.state = {
      displaySignIn: false,
      showSearch: false,
      ready: false,
    };
  }

  async componentDidMount() {
    console.log('Menu just Mounted');
    const { getUser: getUserStatus } = this.props;
    await getUserStatus('/auth/profile');
    this.setState(
      {
        ready: true,
      },
    );
  }

  handleMenuClick = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLSpanElement;
    if (target.innerText === 'Search') {
      this.setState({ showSearch: true });
    }
  };

  renderMenu = (authenticated: boolean) => {
    const {
      location: { pathname },
    } = this.props;
    const {
      displaySignIn,
    } = this.state;
    if (authenticated) {
      return (
        <CollapsibleMenu
          pathname={pathname}
          menuClicked={this.handleMenuClick}
        />
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
      showSearch, ready,
    } = this.state;
    const {
      user: { authenticated, username },
      updateSearch: searchUpdate,
      location: { pathname },
    } = this.props;
    if (!ready) return <Loading />;
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
)(Menu) as ComponentType;
