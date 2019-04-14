// root of the frontend get /set primary store vars here
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import Cover from './components/cover/cover';
import Home from './components/home/home';
// action gets user info on every mount of this component
import { getUser, setGuest } from './actions/authentication';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ready: false, // new addition to only proceed after communication with the store
    };
  }

  componentDidMount() {
    const { getUser: getUserStatus } = this.props;
    console.log('CDM Mounted for Main');
    getUserStatus();
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    if (prevProps.user.user !== user.user) { // once user info comes from cdm proceed to rendering
      this.setState({ ready: true });
    }
  }

  handleLogin = () => { // twitter authentication
    window.location = '/auth/twitter';
  }

  handleGuest = () => { // set guest user
    const { setGuest: setGuestStatus } = this.props;
    setGuestStatus();
  }

  render() {
    const { ready } = this.state;
    const { user } = this.props;
    // send current route from router to menu
    if (ready && !user.user.username) {
      return <Cover handleGuest={this.handleGuest} handleLogin={this.handleLogin} />;
    }
    if (ready && user.user.username) {
      return <Home />;
    }
    return null;
  }

}

const mapStateToProps = state => state;
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    getUser,
    setGuest,
  }, dispatch)
);
export default connect(mapStateToProps, mapDispatchToProps)(Main);

Main.defaultProps = {
  user: {},
};

Main.propTypes = {
  getUser: PropTypes.func.isRequired,
  user: PropTypes.shape(PropTypes.shape),
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  setGuest: PropTypes.func.isRequired,
};
