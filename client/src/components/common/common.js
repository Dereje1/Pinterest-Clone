import React from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

// eslint-disable-next-line import/prefer-default-export
export const getProviderIcons = ({ fontSize }) => (
  {
    twitter: { icon: <TwitterIcon style={{ fontSize }} />, color: '#1DA1F2' },
    google: { icon: <GoogleIcon style={{ fontSize }} />, color: '#4285F4' },
    github: { icon: <GitHubIcon style={{ fontSize }} />, color: '#1d7b20' },
  }
);
