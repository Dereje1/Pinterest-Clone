import React from 'react';
import PropTypes from 'prop-types';
import LoginButtons from './loginbuttons';
import './signin.scss';

class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      countShow: 0, // to disable show on load
    };
  }

  componentDidUpdate(prevProps) {
    const { show } = this.props;
    const { countShow } = this.state;

    if (!prevProps.show && show) {
      this.setState({ countShow: countShow + 1 });
      window.addEventListener('click', this.listenForOutClicks);
    }
  }

  listenForOutClicks = (e) => {
    // clicks outside menu will collpase it
    const { removeSignin, caller } = this.props;
    if (!e.target.closest('#sign-in')
    && !e.target.closest('.menu') && caller === 'menu') {
      removeSignin();
      window.removeEventListener('click', this.listenForOutClicks);
    }
    if (!e.target.closest('#sign-in')
    && !e.target.closest('.actionbutton') && caller === 'home') {
      removeSignin();
      window.removeEventListener('click', this.listenForOutClicks);
    }
  }

  resetGuest = () => {
    const { removeSignin } = this.props;
    removeSignin();
    window.removeEventListener('click', this.listenForOutClicks);
  }

  render() {
    const { show } = this.props;
    const { countShow } = this.state;
    if (!countShow) return null;
    return (
      <div id="sign-in" className={show ? 'signshow' : 'signhide'}>
        <LoginButtons guest={this.resetGuest} />
      </div>
    );
  }

}
export default SignIn;

SignIn.propTypes = {
  // shows / hides login div
  show: PropTypes.bool.isRequired,
  // callback to toggle login div
  removeSignin: PropTypes.func.isRequired,
  // used for eventlistener targeting to close login div
  caller: PropTypes.string.isRequired,
};
