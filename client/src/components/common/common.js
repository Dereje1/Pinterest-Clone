import React from 'react';
import PropTypes from 'prop-types';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import './common.scss';

export const getProviderIcons = ({ fontSize }) => (
  {
    twitter: { icon: <TwitterIcon style={{ fontSize }} />, color: '#1DA1F2' },
    google: { icon: <GoogleIcon style={{ fontSize }} />, color: '#4285F4' },
    github: { icon: <GitHubIcon style={{ fontSize }} />, color: '#1d7b20' },
  }
);

export function Loading({ imagesLoaded, ready }) {
  return (
    <div id="loadingcontainer">
      {
        imagesLoaded && ready ? <DownloadDoneIcon />
          : (
            <>
              <div className="bubbles A" />
              <div className="bubbles B" />
              <div className="bubbles C" />
            </>
          )
      }
    </div>
  );
}

Loading.defaultProps = {
  imagesLoaded: undefined,
  ready: undefined,
};

Loading.propTypes = {
  imagesLoaded: PropTypes.bool,
  ready: PropTypes.bool,
};

export function UserPinsSelector({ displaySetting, setDisplaySetting }) {
  return (
    <ButtonGroup variant="text" aria-label="text button group" sx={{ mt: 3 }}>
      <Button
        color={displaySetting === 'created' ? 'secondary' : 'primary'}
        onClick={() => setDisplaySetting('created')}
      >
        Pins created
      </Button>
      <Button
        color={displaySetting === 'saved' ? 'secondary' : 'primary'}
        onClick={() => setDisplaySetting('saved')}
      >
        Pins saved
      </Button>
    </ButtonGroup>
  );
}

UserPinsSelector.propTypes = {
  displaySetting: PropTypes.string.isRequired,
  setDisplaySetting: PropTypes.func.isRequired,
};
