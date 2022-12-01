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
  }

  componentDidMount() {
    this.setState({ show: true });
    window.addEventListener('click', this.listenForOutClicks);
  }

  listenForOutClicks = (e) => {
    // clicks outside menu will collpase it
    const { caller } = this.props;
    if (!e.target.closest('#sign-in')
      && !e.target.closest('.items')
      && caller === 'menu') {
      this.resetGuest();
    }
    if (!e.target.closest('#sign-in')
      && !e.target.closest('.actionbutton')
      && !e.target.closest('.MuiButtonBase-root')
      && caller === 'home') {
      this.resetGuest();
    }
  };

  resetGuest = () => {
    const { removeSignin } = this.props;
    this.setState({
      show: false,
    }, async () => {
      await delay(1000);
      window.removeEventListener('click', this.listenForOutClicks);
      removeSignin();
    });
  };

  render() {
    const { show } = this.state;
    return (
      <>
        {show && <div className="modal-overlay" />}
        <div id="sign-in" className={show ? 'signshow' : 'signhide'}>
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
  caller: PropTypes.string.isRequired,
};
