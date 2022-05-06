// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getUser } from '../../actions/authentication';
import updateSearch from '../../actions/search';
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
      searchVal: '',
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

  onSearch = _.debounce((val, searchUpdate) => searchUpdate(val), 500);

  toggleCollapse = () => {
    // burger click handler for responsive mode
    const { collapseToggle } = this.state;
    this.setState({ collapseToggle: !collapseToggle });
  };

  listenForOutClicks = (e) => {
    // clicks outside an extended menu will collpase it
    if (!e.target.closest('.menu')) this.toggleCollapse();
  };

  renderSearch = () => {
    const { updateSearch: searchUpdate, location: { pathname } } = this.props;
    const { searchVal } = this.state;
    if (pathname !== '/') return null;
    return (
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          width: '40%',
          height: '80%',
          background: '#f8f8f8',
        }}
        variant="string"
      >
        {searchVal
          ? (
            <HighlightOffIcon
              id="clear-search"
              style={{ fontSize: '1.5em', cursor: 'pointer' }}
              onClick={() => this.setState({ searchVal: '' }, () => searchUpdate(''))}
            />
          ) : (
            <Tooltip title="Search by description or owner" placement="bottom">
              <SearchIcon />
            </Tooltip>
          )
        }
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search' }}
          onChange={e => this.setState({ searchVal: e.target.value },
            () => this.onSearch(e.target.value, searchUpdate))}
          value={searchVal}
        />
      </Paper>
    );
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
    const { user: { authenticated, username } } = this.props;
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
          {this.renderSearch()}
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
          {this.renderSearch()}
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
