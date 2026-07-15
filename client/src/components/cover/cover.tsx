import React from 'react';
import LoginButtons from '../signin/loginbuttons';
import './cover.scss';

function Cover() {
  return (
    <div id="cover">
      <div id="logincard">
        <div className="cover-content">
          <div id="logo"><i className="fa fa-th-large" aria-hidden="true" /></div>
          <div id="welcome">Welcome to Pinboard</div>
          <div id="subheader">Discover, save, and share visual ideas</div>
          <div id="disclaimer">An educational visual discovery project.</div>
          <div id="gitsource">
            <a href="https://github.com/Dereje1/Pinterest-Clone" target="_blank" rel="noopener noreferrer">
              <i className="fa fa-github" aria-hidden="true" />
              {' Github'}
            </a>
          </div>
        </div>
        <div className="cover-actions">
          <LoginButtons guest={() => ({})} />
        </div>
      </div>
    </div>
  );
}

export default Cover;
