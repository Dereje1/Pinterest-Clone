import React, { ReactElement } from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import {providerIcons} from '../../interfaces'
import './common.scss';


export const getProviderIcons = ({ fontSize }: {fontSize: number}): providerIcons => (
  {
    twitter: { icon: <TwitterIcon style={{ fontSize }} />, color: '#1DA1F2' },
    google: { icon: <GoogleIcon style={{ fontSize }} />, color: '#4285F4' },
    github: { icon: <GitHubIcon style={{ fontSize }} />, color: '#1d7b20' },
  }
);

interface LoadingProps {
  imagesLoaded?: boolean,
  ready?: boolean
}

export function Loading({ imagesLoaded, ready }: LoadingProps) {
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


interface UserPinsSelectorProps {
  displaySetting: string,
  setDisplaySetting: (arg: string) => void,
}

export function UserPinsSelector({ displaySetting, setDisplaySetting }: UserPinsSelectorProps) {
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
