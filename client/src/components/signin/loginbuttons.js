import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
        <Button id="guestbutton" variant="outlined" startIcon={<AccountCircleIcon style={{ fontSize: 25 }} />} onClick={this.handleGuest}>
          Continue As Guest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </Button>
        <Button id="twitterloginbutton" variant="outlined" startIcon={<TwitterIcon style={{ fontSize: 25 }} />} onClick={() => handleLogin('/auth/twitter')}>
          Continue With Twitter
        </Button>
        <Button id="googleloginbutton" variant="outlined" startIcon={<GoogleIcon style={{ fontSize: 25 }} />} onClick={() => handleLogin('/auth/google')}>
          Continue With Google
        </Button>
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
