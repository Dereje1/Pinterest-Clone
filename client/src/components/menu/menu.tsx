// menu bar
import React, { ComponentType } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import IconButton from '@mui/material/IconButton';
import SortIcon from '@mui/icons-material/Sort';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { getUser } from '../../redux/userSlice';
import { updateSearch } from '../../redux/searchSlice';
import Search from './search';
import Cover from '../cover/cover';
import SignIn from '../signin/signin';
import CollapsibleMenu from './CollapsibleMenu';
import { Loading } from '../common/common';
import { userType, searchType } from '../../interfaces';
import './menu.scss';

export const mapStateToProps = ({ user, search }:
  {user: userType, search: searchType}) => ({ user, search });
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
  location: {
    pathname: string,
  }
  updateSearch: (val: string, tagSearch: boolean, sort: boolean) => void
  search: searchType
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

  renderMenu = () => {
    const {
      user: { authenticated, service },
      location: { pathname },
      updateSearch: toggleSort,
      search: { sort },
    } = this.props;
    const {
      displaySignIn,
    } = this.state;

    return (
      <>
        <div style={{ display: 'flex', width: 175, justifyContent: 'space-between' }}>
          <Brand />
          <IconButton onClick={() => toggleSort('', false, !sort)}>
            {
              sort ? <ShuffleIcon color="primary" /> : <SortIcon color="secondary" />
            }
          </IconButton>
        </div>
        {
          authenticated ? (
            <CollapsibleMenu
              pathname={pathname}
              menuClicked={this.handleMenuClick}
              service={service}
            />
          )
            : <Login showSignIn={() => this.setState({ displaySignIn: true })} />
        }

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
      user: { username },
      location: { pathname },
    } = this.props;
    if (!ready) return <Loading />;
    if (!username) return <Cover />;
    return (
      <div className="menu">
        <Search
          isShowing={showSearch}
          openSearch={() => this.setState({ showSearch: true })}
          closeSearch={() => this.setState({ showSearch: false })}
          pathname={pathname}
        />
        {!showSearch && this.renderMenu()}
      </div>
    );
  }

}

export default compose(
  withRouter,
  connect(mapStateToProps, actionCreators),
)(Menu) as ComponentType;
