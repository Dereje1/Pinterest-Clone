import React from 'react';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinkIcon from '@mui/icons-material/Link';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Typography from '@mui/material/Typography';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface MediaSelectProps {
    mediaType: 'link' | 'upload' | 'AI'
    totalAiGenratedImages: number
    handleMediaChange: (e: React.SyntheticEvent, imgType: 'link' | 'upload' | 'AI') => void
  }

export function MediaSelect({
  mediaType,
  totalAiGenratedImages,
  handleMediaChange,
}: MediaSelectProps) {
  return (
    <ToggleButtonGroup
      value={mediaType}
      exclusive
      onChange={handleMediaChange}
      aria-label="text alignment"
      sx={{ marginRight: 80, color: '900' }}
    >
      <ToggleButton value="link" aria-label="link type">
        <LinkIcon />
      </ToggleButton>
      <ToggleButton value="upload" aria-label="upload type">
        <DriveFolderUploadIcon />
      </ToggleButton>
      <ToggleButton value="AI" aria-label="AI type" disabled={totalAiGenratedImages >= 5}>
        <PsychologyIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

interface MediaButtonHandlerProps {
    mediaType: 'link' | 'upload' | 'AI'
    totalAiGenratedImages: number
    isError: boolean
    picPreview: string | ArrayBuffer
    description: string
    AIimageStatus: {
        generatedImage: boolean,
        generatingImage: boolean,
        _id: string | null
    }
    handleLinkImage: (e: React.SyntheticEvent) => void
    handleUploadedImage: (e: React.SyntheticEvent<HTMLDivElement>) => void
    handleAIimage: () => void
    showAIResetDialog: () => void
  }

export function MediaButtonHandler({
  mediaType,
  isError,
  picPreview,
  description,
  totalAiGenratedImages,
  AIimageStatus,
  handleLinkImage,
  handleUploadedImage,
  handleAIimage,
  showAIResetDialog,
}: MediaButtonHandlerProps) {
  const handler = {
    upload: (
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        sx={{ margin: '2.3vh' }}
        component="label"
        color={isError ? 'error' : 'secondary'}
      >
        {isError ? 'choose image' : 'replace image'}
        <input hidden accept="image/*" type="file" onChange={handleUploadedImage} />
      </Button>
    ),
    link: (
      <TextField
        id="pin-img-link"
        label="Paste image address here http://..."
        variant="standard"
        onChange={handleLinkImage}
        value={picPreview}
        error={isError}
        color="success"
        style={{ margin: '1.5vh', width: '100%' }}
      />
    ),
    AI: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PsychologyIcon />}
          sx={{ margin: '2.3vh' }}
          component="label"
          color="info"
          onClick={handleAIimage}
          disabled={
            AIimageStatus.generatedImage
                || AIimageStatus.generatingImage
                || !description.trim().length
                || totalAiGenratedImages >= 5
          }
        >
          {AIimageStatus.generatedImage ? 'Generated' : 'Generate Image'}
        </Button>
        <IconButton
          onClick={showAIResetDialog}
          disabled={
            !AIimageStatus.generatedImage
                || AIimageStatus.generatingImage
                || totalAiGenratedImages >= 5
          }
          disableRipple
        >
          <RestartAltIcon />
        </IconButton>
        <Typography>
          {totalAiGenratedImages}
          /5
        </Typography>
      </div>
    ),
  };

  return handler[mediaType];
}
