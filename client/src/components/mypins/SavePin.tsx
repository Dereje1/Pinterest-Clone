import React, { useEffect, useState } from 'react';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Fab from '@mui/material/Fab';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import RESTcall from '../../crud'; // pin CRUD

interface SavePinProps {
  isImageError: boolean
  isDescriptionError: boolean
  picPreview: string | ArrayBuffer
  isImageLoaded: boolean
  savePic: () => void
}

function SavePin({
  isImageError,
  isDescriptionError,
  savePic,
  isImageLoaded,
  picPreview,
}: SavePinProps) {
  const [isDuplicateError, setIsDuplicateError] = useState(true);
  const [testingForDuplicates, setTestingForDuplicates] = useState(false);

  const testForDuplicate = async (picInPreview: string | ArrayBuffer) => {
    setTestingForDuplicates(true);
    const { duplicateError } = await RESTcall({
      address: '/api/getDuplicateError/',
      method: 'post',
      payload: { picInPreview },
    });
    setTestingForDuplicates(false);
    setIsDuplicateError(duplicateError);
  };

  useEffect(() => {
    if (!isImageError && !isDescriptionError && isImageLoaded) {
      testForDuplicate(picPreview);
    }
  }, [isImageError, isDescriptionError, isImageLoaded]);

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
  } else if (testingForDuplicates) {
    validation = {
      text: 'Searching duplicates...',
      color: '#aa9c9cd9',
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
  const isDisabled = isImageError
   || isDescriptionError
    || isDuplicateError
     || !isImageLoaded
      || testingForDuplicates;
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
