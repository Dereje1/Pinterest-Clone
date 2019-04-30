import React from 'react';
import LoginButtons from '../signin/loginbuttons';
import './cover.scss';

const Cover = () => (
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
        <LoginButtons guest={() => {}} />
      </div>
    </div>
  </div>
);

export default Cover;
