import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

interface ProfileLinkProps {
  authenticated: boolean
  userId: string
  title: string | React.ReactElement
  closePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
  displayLogin: () => void
}

function ProfileLink({
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

export default ProfileLink;
