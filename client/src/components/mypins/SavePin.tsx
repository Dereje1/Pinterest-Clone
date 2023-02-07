import React, { useEffect, useState } from 'react';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Button from '@mui/material/Button';
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
  const [
    testingForDuplicates,
    setTestingForDuplicates,
  ] = useState({ waiting: false, error: false });

  const testForDuplicate = async (picInPreview: string | ArrayBuffer) => {
    setTestingForDuplicates({ waiting: true, error: false });
    try {
      const { duplicateError } = await RESTcall({
        address: '/api/getDuplicateError/',
        method: 'post',
        payload: { picInPreview },
      });
      setTestingForDuplicates({ waiting: false, error: false });
      setIsDuplicateError(duplicateError);
    } catch (error) {
      setTestingForDuplicates({ waiting: false, error: true });
      setIsDuplicateError(true);
    }
  };

  useEffect(() => {
    if (!isImageError && isImageLoaded) {
      testForDuplicate(picPreview);
    }
  }, [isImageError, isImageLoaded]);

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
  } else if (testingForDuplicates.waiting) {
    validation = {
      text: 'Processing...',
      color: '#aa9c9cd9',
    };
  } else if (testingForDuplicates.error) {
    validation = {
      text: 'Error processing...',
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
  const isDisabled = isImageError
   || isDescriptionError
    || isDuplicateError
     || !isImageLoaded
      || testingForDuplicates.waiting
       || testingForDuplicates.error;
  return (
    <Button
      variant={isDisabled ? 'text' : 'contained'}
      startIcon={
        isDisabled
          ? <FileDownloadOffIcon sx={{ mr: 1, fontSize: '1.5em' }} />
          : <SaveAltIcon sx={{ mr: 1, fontSize: '1.5em' }} />
      }
      aria-label="Pin Image"
      onClick={savePic}
      disabled={isDisabled}
      color="success"
      sx={{
        '&:disabled': {
          backgroundColor: validation.color,
          color: 'white',
        },
        borderRadius: 0,
        mt: 1,
      }}
    >
      {validation.text}
    </Button>
  );
}

export default SavePin;
