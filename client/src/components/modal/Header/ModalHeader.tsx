import React from 'react';
import { styled } from '@mui/styles';
import Badge from '@mui/material/Badge';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import Typography from '@mui/material/Typography';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ModalActions from './ModalActions';
import { ProfileLink } from '../../common/common';
import { formatDate, getFormattedDescription } from '../../../utils/utils';
import {
  PinType, zoomedImageInfoType,
} from '../../../interfaces';

const fontStyles = {
  description: {
    fontWeight: { xs: 900 },
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
  },
  owner: {
    fontWeight: { xs: 900 },
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
  },
  date: {
    fontWeight: { xs: 600 },
    fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem' },
  },
};

export const StyledBadge = styled(Badge)(({ name }: { name: string }) => ({
  '& .MuiBadge-badge': {
    right: name === 'pin' ? 32 : 43,
    top: name === 'pin' ? 17 : 13,
    border: '2px solid grey',
    padding: '0 4px',
  },
}));

interface ModalHeaderProps {
    authenticated: boolean
    commentsShowing: boolean
    pinInformation: zoomedImageInfoType['pin']
    toggleComments: () => void
    pinImage: (pin: PinType) => void
    deletePin: ((pin: PinType) => void) | null
    displayLogin: () => void
    closePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
}

function ModalHeader({
  pinInformation,
  toggleComments,
  commentsShowing,
  pinImage,
  deletePin,
  displayLogin,
  authenticated,
  closePin,
}: ModalHeaderProps) {
  const formattedDescription = getFormattedDescription(pinInformation.imgDescription);
  return (
    <CardHeader
      action={(
        <>
          <StyledBadge badgeContent={pinInformation.comments.length} color="primary" showZero name="comments">
            <IconButton
              onClick={toggleComments}
              onMouseDown={(e) => e.preventDefault()}
            >
              {commentsShowing
                ? <CommentIcon style={{ fontSize: '1.7em' }} />
                : <CommentOutlinedIcon style={{ fontSize: '1.7em' }} />}
            </IconButton>
          </StyledBadge>
          <StyledBadge badgeContent={pinInformation.savedBy.length} color="secondary" showZero name="pin">
            <ModalActions
              element={pinInformation}
              pinImage={pinImage}
              deletePin={deletePin}
              reset={closePin}
            />
          </StyledBadge>
        </>
      )}
      title={formattedDescription}
      subheader={(
        <>
          <ProfileLink
            authenticated={authenticated}
            closePin={closePin}
            displayLogin={displayLogin}
            title={(
              <Typography sx={{ color: '#3752ff', ...fontStyles.owner }} noWrap>
                {`${pinInformation.owner.name}`}
              </Typography>
            )}
            userId={pinInformation.owner.userId}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ marginLeft: 0, ...fontStyles.date }}>
              {formatDate(pinInformation.createdAt)}
            </Typography>
            {
              pinInformation.AIgenerated && <PsychologyIcon sx={{ color: 'green', ml: 1, ...fontStyles.date }} />
            }
          </div>
        </>
      )}
      titleTypographyProps={{ ...fontStyles.description }}
      subheaderTypographyProps={{ maxWidth: 300 }}
      sx={{
        background: 'white',
      }}
    />
  );
}

export default ModalHeader;
