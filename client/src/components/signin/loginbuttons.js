import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { connect } from 'react-redux';
import { setGuest } from '../../actions/authentication';
import { getProviderIcons } from '../common/common';
import './loginbuttons.scss';

export const mapStateToProps = ({ user }) => ({ user });

const actionCreators = {
  setGuest,
};

const handleLogin = (loc) => { // twitter/ google authentication
  window.location.assign(loc);
};

export const ProviderButton = ({ service }) => {
  const providerIcons = getProviderIcons({ fontSize: 25 });
  return (
    <Button
      id={`${service}loginbutton`}
      variant="outlined"
      startIcon={providerIcons[service].icon}
      onClick={() => handleLogin(`/auth/${service}`)}
      onMouseDown={e => e.preventDefault()}
    >
      {`Continue With ${service.charAt(0).toUpperCase() + service.slice(1)}`}
    </Button>
  );
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
            if (providers[service]) return <ProviderButton key={service} service={service} />;
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

ProviderButton.propTypes = {
  service: PropTypes.string.isRequired,
};
