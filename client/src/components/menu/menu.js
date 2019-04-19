/* eslint-disable semi */
// menu bar
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUser, setGuest } from '../../actions/authentication';
import Cover from '../cover/cover';
import './menu.scss';

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getUser,
    setGuest,
  }, dispatch)
);

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      initialLoad: true,
      menuIsCollapsed: window.innerWidth < 600,
      collapseToggle: false,
    };
  }

  componentDidMount() {
    console.log('Menu just Mounted')
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
    if (prevProps.user.user !== user.user) {
      this.setState({ ready: true }); // once user info comes from cdm proceed to rendering
    }
    if (prevState.collapseToggle === false && collapseToggle) {
      // don't display responsive menu on initial load
      if (initialLoad) this.setState({ initialLoad: false })
      window.addEventListener('click', this.listenForOutClicks)
    }
    if (prevState.collapseToggle === true && !collapseToggle) {
      window.removeEventListener('click', this.listenForOutClicks)
    }
    return null;
  }

  handleLogin = () => { // twitter authentication
    window.location = '/auth/twitter';
  }

  handleGuest = () => { // set guest user
    const { setGuest: setGuestStatus } = this.props;
    setGuestStatus();
  }

  listenForOutClicks = (e) => {
    if (!e.target.closest('.menu')) this.toggleCollapse()
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
    const {
      menuIsCollapsed, collapseToggle, ready, initialLoad,
    } = this.state;
    const { user } = this.props;
    if (!ready) return null;
    if (!user.user.username) {
      document.body.classList.add('cover');
      return <Cover handleGuest={this.handleGuest} handleLogin={this.handleLogin} />
    }
    if (!user.user.authenticated) { // for non authenticated users
      document.body.classList.remove('cover');
      return (
        <div className="menu">
          <div className="brand">
            <a href="/">
              <i className="fa fa-pinterest" aria-hidden="true" />
              {' Clone'}
            </a>
          </div>
          <div className="items">
            <a href="/auth/twitter">Login with Twitter</a>
          </div>
        </div>
      )
    }
    document.body.classList.remove('cover');
    // for twitter authenticated users
    return (
      <React.Fragment>
        <div className="menu">
          <div className="brand">
            <a href="/">
              <i className="fa fa-pinterest" aria-hidden="true" />
              {' Clone'}
            </a>
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
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

Menu.defaultProps = {
  user: {},
};

Menu.propTypes = {
  user: PropTypes.shape(PropTypes.shape),
  getUser: PropTypes.func.isRequired,
  setGuest: PropTypes.func.isRequired,
};
