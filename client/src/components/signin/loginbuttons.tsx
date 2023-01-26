import React from 'react';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { connect } from 'react-redux';
import { setGuest } from '../../actions/authentication';
import { getProviderIcons } from '../common/common';
import { user, providerIcons, providers } from '../../interfaces'
import './loginbuttons.scss';


export const mapStateToProps = ({ user }: {user: user}) => ({ user });

const actionCreators = {
  setGuest,
};

const handleLogin = (loc: string) => { // twitter/ google authentication
  window.location.assign(loc);
};

export function ProviderButton({ service }: {service: string}) {
  const providerIcons: providerIcons = getProviderIcons({ fontSize: 25 });
  return (
    <Button
      id={`${service}loginbutton`}
      variant="outlined"
      startIcon={providerIcons[service as keyof providerIcons].icon}
      onClick={() => handleLogin(`/auth/${service}`)}
      onMouseDown={(e) => e.preventDefault()}
    >
      {`Continue With ${service.charAt(0).toUpperCase() + service.slice(1)}`}
    </Button>
  );
}

interface LoginButtonsProps{
  user: user
  setGuest: (path: string) => void
  guest: () => void
}

export class LoginButtons extends React.Component<LoginButtonsProps> {

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
      <>
        {

          username !== 'Guest' && (
            <Button id="guestbutton" variant="outlined" startIcon={<AccountCircleIcon style={{ fontSize: 25 }} />} onClick={this.handleGuest}>
              Continue As Guest&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Button>
          )
        }

        {
          providerKeys.map((service) => {
            if (providers[service as keyof providers]) return <ProviderButton key={service} service={service} />;
            return null;
          })
        }
      </>
    );
  }

}

export default connect(mapStateToProps, actionCreators)(LoginButtons);

