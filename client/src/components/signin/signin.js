import React from 'react';
import PropTypes from 'prop-types';
import LoginButtons from './loginbuttons';
import {
  delay,
} from '../../utils/utils';
import './signin.scss';

export class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.signInModal = React.createRef();
  }

  componentDidMount() {
    this.signInModal.current.focus();
    this.setState({ show: true });
  }

  resetGuest = () => {
    const { removeSignin } = this.props;
    this.setState({
      show: false,
    }, async () => {
      await delay(1000);
      removeSignin();
    });
  };

  render() {
    const { show } = this.state;
    return (
      <>
        {show && <div className="modal-overlay" />}
        <div
          className={show ? 'signinmodal signshow' : 'signinmodal signhide'}
          ref={this.signInModal}
          onBlur={this.resetGuest}
          tabIndex={0}
          role="menuitem"
        >
          <LoginButtons guest={this.resetGuest} />
        </div>
      </>
    );
  }

}
export default SignIn;

SignIn.propTypes = {
  // callback to toggle login div
  removeSignin: PropTypes.func.isRequired,
  // used for eventlistener targeting to close login div
};
