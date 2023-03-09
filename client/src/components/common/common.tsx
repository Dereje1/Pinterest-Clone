import React, { HTMLAttributes } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { providerIconsType } from '../../interfaces';
import './common.scss';

export const getProviderIcons = ({ fontSize }: {fontSize: number}): providerIconsType => (
  {
    twitter: { icon: <TwitterIcon style={{ fontSize }} />, color: '#1DA1F2' },
    google: { icon: <GoogleIcon style={{ fontSize }} />, color: '#4285F4' },
    github: { icon: <GitHubIcon style={{ fontSize }} />, color: '#1d7b20' },
  }
);

interface LoadingProps {
  imagesLoaded?: boolean,
  ready?: boolean
  marginTop?: number
}

export function Loading({ imagesLoaded, ready, marginTop = 100 }: LoadingProps) {
  return (
    <div id="loadingcontainer" style={{ marginTop }}>
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
  marginTop: undefined,
};

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

interface ProfileLinkProps {
  authenticated: boolean
  userId: string
  title: string | React.ReactElement
  closePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
  displayLogin: () => void
}

export function ProfileLink({
  authenticated,
  userId,
  title,
  closePin,
  displayLogin,
}: ProfileLinkProps) {
  return (
    <Link
      component={RouterLink}
      underline="none"
      to={
        authenticated ? `/profile/${userId}` : ''
      }
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => (authenticated ? closePin(e, true) : displayLogin())}
    >
      {title}
    </Link>
  );
}

interface UserListItemProps {
  providerIcons: providerIconsType,
  service: string,
  profileLinkProps: ProfileLinkProps
  additionalProps?: HTMLAttributes<HTMLLIElement>
}

export function UserListItem({
  providerIcons,
  service,
  profileLinkProps,
  additionalProps,
}: UserListItemProps) {
  return (
    <ListItem
      {...additionalProps}
      key={profileLinkProps.userId}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            width: 26,
            height: 26,
            bgcolor: providerIcons[service as keyof providerIconsType].color,
          }}
        >
          {providerIcons[service as keyof providerIconsType].icon}
        </Avatar>
      </ListItemAvatar>
      <ProfileLink {...profileLinkProps} />
    </ListItem>
  );
}

UserListItem.defaultProps = {
  additionalProps: undefined,
};
