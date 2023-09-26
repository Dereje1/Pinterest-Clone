import React from 'react';
import IconButton from '@mui/material/IconButton';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';
import { PinType } from '../../../../interfaces';

interface GetActionProps{
  element: PinType
  reset: (_: React.SyntheticEvent, forceClose?: boolean) => void
  pinImage: (pin: PinType) => void
  deletePin: ((pin: PinType) => void) | null
}

function GetAction({
  element,
  pinImage,
  deletePin,
  reset,
}: GetActionProps) {
  if (deletePin) { // means called from profile page
    return (
      <Tooltip title={element.owns ? 'Permanently delete image' : 'Unpin image'} placement="bottom">
        <IconButton
          aria-label="settings"
          style={{ margin: '1vh' }}
          onClick={(e) => {
            deletePin(element);
            reset(e);
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {
            element.owns
              ? <DeleteForeverIcon style={{ fontSize: '2em', color: '#d12929' }} />
              : <PushPinIcon style={{ fontSize: '2em', color: '#3a1c1cde' }} />
          }
        </IconButton>
      </Tooltip>
    );
  }

  // finds the status of image to determine what kind of pin to place on image
  if (element.hasSaved || element.owns) { // If the user has already saved this pin
    return (
      <Tooltip title={element.owns ? 'You own this image' : 'Unpin this image'} placement="bottom">
        <IconButton
          aria-label="settings"
          style={{ margin: '1vh' }}
          disableRipple={element.owns}
          onClick={() => {
            if (element.hasSaved) {
              pinImage(element);
            }
          }}
          onMouseDown={(e) => e.preventDefault()}
        >

          <PushPinIcon style={{ fontSize: '2em', color: element.owns ? '#c50000' : '#3a1c1cde' }} />
        </IconButton>
      </Tooltip>
    ); // no button
  }
  // user has not saved this pin show outlined pin
  return (
    <Tooltip title="Pin image" placement="bottom">
      <IconButton
        aria-label="settings"
        style={{ margin: '1vh' }}
        onClick={() => {
          pinImage(element);
        }}
        onMouseDown={(e) => e.preventDefault()}
      >

        <PushPinOutlinedIcon style={{ fontSize: '2em' }} />
      </IconButton>
    </Tooltip>
  );
}

export default GetAction;
