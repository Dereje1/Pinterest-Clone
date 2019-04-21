import React from 'react';
import PropTypes from 'prop-types';
import './cover.scss';

const Cover = ({ handleGuest, handleLogin }) => (
  <div id="cover">
    <div id="logincard">
      <div>
        <div id="logo"><i className="fa fa-pinterest" aria-hidden="true" /></div>
        <div id="welcome">Welcome to Pinterest</div>
        <div id="subheader">Find new ideas to try</div>
        <div id="disclaimer">Cloned For Educational Purposes Only!</div>
        <div id="gitsource">
          <a href="https://github.com/Dereje1/Pinterest-Clone" target="_blank" rel="noopener noreferrer">
            <i className="fa fa-github" aria-hidden="true" />
            {' Github'}
          </a>
        </div>
      </div>
      <div>
        <button
          type="submit"
          id="guestbutton"
          onClick={handleGuest}
        >
          <span id="guest">
            <i className="fa fa-question-circle" aria-hidden="true" />
          </span>
          <span className="buttontext">
            {'Continue As Guest'}
          </span>
        </button>
        <button
          type="submit"
          id="loginbutton"
          onClick={handleLogin}
        >
          <span id="twitter">
            <i className="fa fa-twitter" aria-hidden="true" />
          </span>
          <span className="buttontext">
            {'Continue With Twitter'}
          </span>
        </button>
      </div>
    </div>
  </div>
);

export default Cover;

Cover.propTypes = {
  // callback to menu to initiate, guest and user login respectively
  handleGuest: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
};
