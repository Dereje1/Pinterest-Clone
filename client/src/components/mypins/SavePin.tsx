import React from 'react';
import PropTypes from 'prop-types';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Fab from '@mui/material/Fab';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';

interface SavePinProps {
  isImageError: boolean
  isDescriptionError: boolean
  isDuplicateError: boolean
  isImageLoaded: boolean
  savePic: () => void
}

function SavePin({
  isImageError,
  isDescriptionError,
  isDuplicateError,
  savePic,
  isImageLoaded,
}: SavePinProps) {
  let validation;
  if (!isImageLoaded) {
    validation = {
      text: 'Image loading...',
      color: '#aa9c9cd9',
    };
  } else if (isImageError && isDescriptionError) {
    validation = {
      text: 'Invalid image and description',
      color: '#f79f9fd9',
    };
  } else if (isImageError) {
    validation = {
      text: 'Invalid image',
      color: '#f79f9fd9',
    };
  } else if (isDescriptionError) {
    validation = {
      text: 'Invalid description',
      color: '#f79f9fd9',
    };
  } else if (isDuplicateError) {
    validation = {
      text: 'Image URL already exists',
      color: '#f79f9fd9',
    };
  } else {
    validation = {
      text: 'Save pin',
      color: 'success',
    };
  }
  const isDisabled = isImageError || isDescriptionError || isDuplicateError || !isImageLoaded;
  return (
    <Fab
      variant="extended"
      aria-label="Pin Image"
      onClick={savePic}
      disabled={isDisabled}
      color="success"
      sx={{
        '&:disabled': {
          backgroundColor: validation.color,
          color: 'white',
          mb: 1,
        },
      }}
    >
      {!isDisabled && <SaveAltIcon sx={{ mr: 1, fontSize: '1.5em' }} />}
      {isDisabled && <FileDownloadOffIcon sx={{ mr: 1, fontSize: '1.5em' }} />}
      {validation.text}
    </Fab>
  );
}

export default SavePin;

SavePin.propTypes = {
  isImageError: PropTypes.bool.isRequired,
  isDescriptionError: PropTypes.bool.isRequired,
  isDuplicateError: PropTypes.bool.isRequired,
  isImageLoaded: PropTypes.bool.isRequired,
  savePic: PropTypes.func.isRequired,
};
