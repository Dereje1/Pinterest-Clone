import React, { createRef } from 'react';
import LoginButtons from './loginbuttons';
import {
  delay,
} from '../../utils/utils';
import './signin.scss';

interface SignInProps{
  removeSignin: () => void
}

interface SignInState {
  show: boolean
}

export class SignIn extends React.Component<SignInProps, SignInState> {

  private signInModal = createRef<HTMLDivElement>();

  constructor(props: SignInProps) {
    super(props);
    this.state = {
      show: false,
    };
    this.signInModal = React.createRef<HTMLInputElement>();
  }

  componentDidMount() {
    if (this.signInModal.current !== null) {
      this.signInModal.current.focus();
    }
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
