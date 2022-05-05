import React from 'react';
import PropTypes from 'prop-types';
import CardActions from '@mui/material/CardActions';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

const SavePin = ({
  isImageError, isDescriptionError, isDuplicateError, savePic,
}) => {
  let validation;
  if (isImageError && isDescriptionError) {
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
      text: 'Image URL already exists, please choose another',
      color: '#f79f9fd9',
    };
  } else {
    validation = {
      text: 'Save pin',
      color: '#028b02',
    };
  }
  return (
    <CardActions
      disableSpacing
    >
      <IconButton
        aria-label="Pin Image"
        onClick={savePic}
        disabled={isImageError || isDescriptionError || isDuplicateError}
      >
        <SaveAltIcon style={{ fontSize: '1.5em', color: validation.color }} />
      </IconButton>
      <TextField
        id="pin-create-validation"
        value={validation.text}
        variant="standard"
        sx={{
          marginTop: 2,
          width: '100%',
          input: {
            fontSize: '0.75em',
            color: validation.color,
            fontWeight: 'bold',
            caretColor: 'white',
          },
        }}
        InputProps={{
          disableUnderline: true,
        }}
      />

    </CardActions>
  );
};

export default SavePin;

SavePin.propTypes = {
  isImageError: PropTypes.bool.isRequired,
  isDescriptionError: PropTypes.bool.isRequired,
  isDuplicateError: PropTypes.bool.isRequired,
  savePic: PropTypes.func.isRequired,
};
