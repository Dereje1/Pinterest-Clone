// menu bar
import React from 'react';
import PropTypes, { func } from 'prop-types';
import _ from 'lodash';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getUser } from '../../actions/authentication';
import { updateSearch } from '../../actions/search'
import Cover from '../cover/cover';
import SignIn from '../signin/signin';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import './menu.scss';

const mapStateToProps = state => state;
const actionCreators = {
  getUser,
  updateSearch
}

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ready: false, // component ready for render
      initialLoad: true, // used to avoid keyframe anim on initial load
      menuIsCollapsed: window.innerWidth < 600, // test for screen size
      collapseToggle: false, // turns responsive hamburger on/off
      displaySignIn: false,
    };
  }

  componentDidMount() {
    console.log('Menu just Mounted');
    const { getUser: getUserStatus } = this.props;
    getUserStatus();
    this.setState(
      {
        menuIsCollapsed: window.innerWidth < 600,
        collapseToggle: false,
        initialLoad: true,
      },
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;
    const { collapseToggle, initialLoad } = this.state;
    if (prevProps.user !== user) {
      this.setState({ ready: true }); // once user info comes from cdm proceed to rendering
    }
    if (prevState.collapseToggle === false && collapseToggle) {
      // don't display responsive menu on initial load
      if (initialLoad) this.setState({ initialLoad: false });
      window.addEventListener('click', this.listenForOutClicks);
    }
    if (prevState.collapseToggle === true && !collapseToggle) {
      window.removeEventListener('click', this.listenForOutClicks);
    }
  }

  listenForOutClicks = (e) => {
    // clicks outside an extended menu will collpase it
    if (!e.target.closest('.menu')) this.toggleCollapse();
  }

  toggleCollapse = () => {
    // burger click handler for responsive mode
    const { collapseToggle } = this.state;
    this.setState({ collapseToggle: !collapseToggle });
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

  onSearch = _.debounce((v, updateSearch) => updateSearch(v), 500)

  renderSearch = () => {
    const { updateSearch , location: { pathname }} = this.props
    if (pathname !== '/') return null
    return (
      <Paper
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center',
         width: '30%', height: '80%', background: '#f8f8f8'}}
        variant='string'
      >
        <SearchIcon />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search' }}
          onChange={(e) => this.onSearch(e.target.value, updateSearch)}
        />
      </Paper>
    )
  }

  render() {
    // render cover/guest / logged in menu bar
    const {
      menuIsCollapsed, collapseToggle, ready, initialLoad, displaySignIn,
    } = this.state;
    const { user: { authenticated, username } } = this.props;
    if (!ready) return null;
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
          <SignIn
            show={displaySignIn}
            removeSignin={() => this.setState({ displaySignIn: false })}
            caller="menu"
          />
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
          !initialLoad && menuIsCollapsed
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
    );
  }

}


export default compose(
  withRouter,
  connect(mapStateToProps, actionCreators)
)(Menu);

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  // stored authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
  // redux action to get user status from server
  getUser: PropTypes.func.isRequired,
};
