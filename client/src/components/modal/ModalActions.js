import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

const GetAction = ({ element, pinImage, deletePin }) => {
  if (!pinImage) { // means called from profile page
    return (
      <IconButton aria-label="settings" style={{ margin: '1vh' }} onClick={() => deletePin(element)}>
        {
          element.owns
            ? (
              <Tooltip title="Permanently delete image" placement="left">
                <DeleteForeverIcon style={{ fontSize: '2em', color: '#d12929' }} />
              </Tooltip>
            ) : (
              <Tooltip title="Unpin image" placement="left">
                <DeleteIcon style={{ fontSize: '2em', color: '#d12929' }} />
              </Tooltip>
            )
        }
      </IconButton>
    );
  }
  // finds the status of image to determine what kind of button to place on pic
  if (element.hasSaved || element.owns) { // If the user has already saved this pin
    return (
      <IconButton aria-label="settings" style={{ margin: '1vh' }} disableRipple>
        <Tooltip title={element.owns ? 'You own this image' : 'You pinned this image'} placement="left">
          <PushPinIcon style={{ fontSize: '2em', color: element.owns ? '#c50000' : '#3a1c1cde' }} />
        </Tooltip>
      </IconButton>
    ); // no button
  }
  // user has not saved this pin show save button
  return (
    <IconButton aria-label="settings" style={{ margin: '1vh' }} onClick={() => pinImage(element)}>
      <Tooltip title="Pin image" placement="left">
        <PushPinOutlinedIcon style={{ fontSize: '2em' }} />
      </Tooltip>
    </IconButton>
  );
};

export default GetAction;

GetAction.defaultProps = {
  pinImage: null,
  deletePin: null,
};

GetAction.propTypes = {
  element: PropTypes.objectOf(PropTypes.any).isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
};
