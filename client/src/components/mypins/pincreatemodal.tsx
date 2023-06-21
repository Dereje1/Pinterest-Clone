// displays modal that creates pin
import React, { Component } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinkIcon from '@mui/icons-material/Link';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Typography from '@mui/material/Typography';
import RESTcall from '../../crud'; // pin CRUD
import SavePin from './SavePin';
import WarningDialog from './WarningDialog';
import error from '../../assets/error.png';
import loading from '../../assets/giphy.gif';
import {
  validateURL,
  getModalWidth,
  encodeImageFileAsURL,
} from '../../utils/utils';

interface PinCreateProps {
  reset: () => void
  savePin: (pinJSON: {imgDescription: string, imgLink: string | ArrayBuffer}) => void
  totalAiGenratedImages: number
  updateGeneratedImages: () => void
}

interface PinCreateState {
  picPreview: string | ArrayBuffer
  description: string
  isError: boolean
  isLoaded: boolean
  mediaType: 'link' | 'upload' | 'AI'
  AIimageStatus: {
    generatedImage: boolean,
    generatingImage: boolean,
    _id: string | null
  }
  imgKey: number
  showAIResetDialog: boolean
}

const mediaTypeInfo = {
  link: 'Web link',
  upload: 'File/device',
  AI: 'AI',
};

const initialState = {
  picPreview: '', // on erroneous image links
  description: '',
  isError: true,
  isLoaded: false,
  AIimageStatus: {
    generatedImage: false,
    generatingImage: false,
    _id: null,
  },
  imgKey: 0,
  showAIResetDialog: false,
};
class PinCreate extends Component<PinCreateProps, PinCreateState> {

  constructor(props: PinCreateProps) {
    super(props);
    // initialize modal show state to false
    this.state = {
      ...initialState,
      mediaType: 'link',
    };
  }

  close = () => {
    const { reset } = this.props;
    this.setState({
      picPreview: '',
      description: '',
      isError: true,
    }, reset);
  };

  // processes picture on change of text box
  processImage = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const imgLink = validateURL(target.value);
    if (!imgLink) return;
    this.setState({
      picPreview: imgLink,
      isError: false,
      isLoaded: false,
    });
  };

  savePic = () => { // ready to save pin
    const { savePin } = this.props;
    const { picPreview, description, AIimageStatus } = this.state;
    // prepare JSON for POST api
    const pinJSON = {
      imgDescription: description,
      imgLink: picPreview,
      AIgeneratedId: AIimageStatus._id,
    };
    // save into db and close modal
    savePin(pinJSON);
    this.close();
  };

  onError = () => {
    this.setState({
      picPreview: '',
      isLoaded: false,
      isError: true,
    });
  };

  onLoad = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const { imgKey } = this.state;
    const target = e.target as HTMLMediaElement;
    this.setState({
      isLoaded: true,
      isError:
      target.currentSrc === `${window.location.origin}${error}`
      || target.currentSrc === `${window.location.origin}${loading}`,
      imgKey: imgKey + 1,
    });
  };

  encodeImage = async (imgFile: File) => {
    try {
      const value = await encodeImageFileAsURL(imgFile);
      if (value) {
        this.setState({
          picPreview: value,
        });
      }
    } catch (_) {
      this.onError();
    }
  };

  handleUploadedImage = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLInputElement).files;
    if (target !== null) {
      const imgFile = target[0];
      this.setState({ picPreview: '' }, () => this.encodeImage(imgFile));
    }
  };

  handleAIimage = async () => {
    const { description, AIimageStatus } = this.state;
    const { updateGeneratedImages } = this.props;
    this.setState({
      AIimageStatus: {
        ...AIimageStatus,
        generatedImage: false,
        generatingImage: true,
      },
      picPreview: loading,
    });
    const { imgURL, title, _id } = await RESTcall({ address: '/api/AIimage', method: 'post', payload: { description } });
    this.setState({
      picPreview: imgURL,
      description: title.trim(),
      AIimageStatus: {
        _id,
        generatedImage: true,
        generatingImage: false,
      },
    }, updateGeneratedImages);
  };

  handleImageTypes = () => {
    const {
      mediaType, isError, picPreview, AIimageStatus, description,
    } = this.state;
    const { totalAiGenratedImages } = this.props;
    switch (mediaType) {
      case 'upload':
        return (
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            sx={{ margin: '2.3vh' }}
            component="label"
            color={isError ? 'error' : 'secondary'}
          >
            {isError ? 'choose image' : 'replace image'}
            <input hidden accept="image/*" type="file" onChange={this.handleUploadedImage} />
          </Button>
        );
      case 'link':
        return (
          <TextField
            id="pin-img-link"
            label="Paste image address here http://..."
            variant="standard"
            onChange={this.processImage}
            value={picPreview}
            error={isError}
            color="success"
            style={{ margin: '1.5vh', width: '100%' }}
          />
        );
      case 'AI':
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PsychologyIcon />}
              sx={{ margin: '2.3vh' }}
              component="label"
              color="info"
              onClick={this.handleAIimage}
              disabled={
                AIimageStatus.generatedImage
                || AIimageStatus.generatingImage
                || !description.trim().length
              }
            >
              {AIimageStatus.generatedImage ? 'Generated' : 'Generate Image'}
            </Button>
            <IconButton
              onClick={() => this.setState({ showAIResetDialog: true })}
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
        );
      default:
        return null;
    }
  };

  render() {
    const {
      description, isError, picPreview,
      isLoaded, mediaType, AIimageStatus,
      imgKey, showAIResetDialog,
    } = this.state;
    const { totalAiGenratedImages } = this.props;
    const modalWidth = getModalWidth();
    const isDescriptionError = description.trim().length < 5;
    return (
      <>
        <Dialog
          open
          sx={{
            '& .MuiDialog-container': {
              '& .MuiPaper-root': {
                width: '100%',
                maxWidth: modalWidth,
              },
            },
          }}
        >
          <DialogTitle id="pin-create-dialog-title">
            {`Create pin: ${mediaTypeInfo[mediaType]}`}
            <IconButton
              id="close-pin-create-modal"
              aria-label="settings"
              onClick={this.close}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[50],
              }}
            >
              <CancelIcon style={{ fontSize: '1.5em', color: '#3a1c1cde' }} />
            </IconButton>
          </DialogTitle>
          <Card sx={{ width: modalWidth }}>

            <CardHeader
              action={(
                <ToggleButtonGroup
                  value={mediaType}
                  exclusive
                  onChange={(_, imgType) => (imgType
                    ? this.setState({ ...initialState, mediaType: imgType, imgKey: imgKey + 1 })
                    : null)}
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
              )}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CardMedia
                key={imgKey}
                component="img"
                image={picPreview === '' ? error : picPreview}
                onError={this.onError}
                onLoad={this.onLoad}
                sx={{ objectFit: 'contain', height: 240 }}
                id="new-pin-image"
              />
              <SavePin
                isImageError={isError}
                isImageLoaded={isLoaded}
                isDescriptionError={isDescriptionError}
                picPreview={picPreview}
                savePic={this.savePic}
              />
            </div>
            <CardActions>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
                height: '25vh',
              }}
              >
                <TextField
                  id="pin-description"
                  label={mediaType === 'AI' ? 'Describe what you want in detail...' : 'Description...'}
                  variant={mediaType === 'AI' ? 'outlined' : 'standard'}
                  color="success"
                  onChange={({ target: { value } }) => {
                    if (mediaType === 'AI') {
                      this.setState({ description: value });
                      return;
                    }
                    if (value.trim().length <= 20) {
                      this.setState({ description: value });
                    }
                  }}
                  value={description}
                  error={!description || isDescriptionError}
                  style={{ margin: '1.5vh', width: '100%' }}
                  disabled={AIimageStatus.generatedImage || AIimageStatus.generatingImage}
                  multiline={mediaType === 'AI'}
                  minRows={3}
                  maxRows={3}
                />
                {
                  this.handleImageTypes()
                }
              </div>
            </CardActions>

          </Card>
        </Dialog>
        {showAIResetDialog && (
          <WarningDialog
            showDialog={showAIResetDialog}
            handleCancel={() => this.setState({ showAIResetDialog: false })}
            handleContinue={() => this.setState({ ...initialState, mediaType: 'AI' })}
            title={`Warning: Refreshing will permanently delete the generated image, ${description}, and you will have ${5 - totalAiGenratedImages} tries left to generate a new image. Are you sure you want to continue?`}
          />
        )}
      </>
    );
  }

}

export default PinCreate;
