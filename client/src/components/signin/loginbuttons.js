import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { connect } from 'react-redux';
import { setGuest } from '../../actions/authentication';
import './loginbuttons.scss';

const mapStateToProps = ({ user }) => ({ user });

const actionCreators = {
  setGuest,
};

const handleLogin = (loc) => { // twitter/ google authentication
  window.location.assign(loc);
};

const providerMap = {
  twitter:
  <Button key="twiiter" id="twitterloginbutton" variant="outlined" startIcon={<TwitterIcon style={{ fontSize: 25 }} />} onClick={() => handleLogin('/auth/twitter')}>
    Continue With Twitter
  </Button>,
  google:
  <Button key="google" id="googleloginbutton" variant="outlined" startIcon={<GoogleIcon style={{ fontSize: 25 }} />} onClick={() => handleLogin('/auth/google')}>
    Continue With Google
  </Button>,
  github:
  <Button key="github" id="githubloginbutton" variant="outlined" startIcon={<GitHubIcon style={{ fontSize: 25 }} />} onClick={() => handleLogin('/auth/github')}>
    Continue With Github&nbsp;&nbsp;
  </Button>,
};

export class LoginButtons extends React.Component {

  handleGuest = () => { // set guest user
    const { setGuest: setGuestStatus, guest } = this.props;
    setGuestStatus('/auth/guest');
    guest(); // callback to hid login div
  };

  render() {
    const { user: { providers, username } } = this.props;
    if (!providers) return null;
    const providerKeys = Object.keys(providers);
    return (
      <React.Fragment>
        {

          username !== 'Guest' && (
            <Button id="guestbutton" variant="outlined" startIcon={<AccountCircleIcon style={{ fontSize: 25 }} />} onClick={this.handleGuest}>
              Continue As Guest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Button>
          )
        }

        {
          providerKeys.map((service) => {
            if (providers[service]) return providerMap[service];
            return null;
          })
        }
      </React.Fragment>
    );
  }

}

export default connect(mapStateToProps, actionCreators)(LoginButtons);

LoginButtons.defaultProps = {
  user: {},
};

LoginButtons.propTypes = {
  // redux action to set guest user status on server
  setGuest: PropTypes.func.isRequired,
  // used for reseting back to guest mode in signin
  guest: PropTypes.func.isRequired,
  user: PropTypes.shape(PropTypes.shape),
};
