import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setGuest } from '../../actions/authentication';
import './loginbuttons.scss';

const mapStateToProps = state => state;

const actionCreators = {
  setGuest,
};

const handleLogin = (loc) => { // twitter/ google authentication
  window.location.assign(loc);
};


export class LoginButtons extends React.Component {

  handleGuest = () => { // set guest user
    const { setGuest: setGuestStatus, guest } = this.props;
    setGuestStatus('/auth/guest');
    guest(); // callback to hid login div
  };

  render() {
    return (
      <React.Fragment>
        <button
          type="submit"
          id="guestbutton"
          onClick={this.handleGuest}
        >
          <span id="guest">
            <i className="fa fa-question-circle" aria-hidden="true" />
          </span>
          <span className="buttontext">
            Continue As Guest
          </span>
        </button>
        <button
          type="submit"
          id="twitterloginbutton"
          onClick={() => handleLogin('/auth/twitter')}
        >
          <span id="twitter">
            <i className="fa fa-twitter" aria-hidden="true" />
          </span>
          <span className="buttontext">
            Continue With Twitter
          </span>
        </button>
        <button
          type="submit"
          id="googleloginbutton"
          onClick={() => handleLogin('/auth/google')}
        >
          <span id="twitter">
            <i className="fa fa-google" aria-hidden="true" />
          </span>
          <span className="buttontext">
            Continue With Google
          </span>
        </button>
      </React.Fragment>
    );
  }

}

export default connect(mapStateToProps, actionCreators)(LoginButtons);

LoginButtons.propTypes = {
  // redux action to set guest user status on server
  setGuest: PropTypes.func.isRequired,
  // used for reseting back to guest mode in signin
  guest: PropTypes.func.isRequired,
};
