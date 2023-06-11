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
import RESTcall from '../../crud'; // pin CRUD
import SavePin from './SavePin';
import error from '../../assets/error.png';
import {
  validateURL,
  getModalWidth,
  encodeImageFileAsURL,
} from '../../utils/utils';

interface PinCreateProps {
  reset: () => void
  savePin: (pinJSON: {imgDescription: string, imgLink: string | ArrayBuffer}) => void
}

interface PinCreateState {
  picPreview: string | ArrayBuffer
  description: string
  isError: boolean
  isLoaded: boolean
  type: string
  AIimageStatus: {
    generatedImage: boolean,
    generatingImage: boolean,
  }
}

class PinCreate extends Component<PinCreateProps, PinCreateState> {

  constructor(props: PinCreateProps) {
    super(props);
    // initialize modal show state to false
    this.state = {
      picPreview: '', // on erroneous image links
      description: '',
      isError: true,
      isLoaded: false,
      type: 'link',
      AIimageStatus: {
        generatedImage: false,
        generatingImage: false,
      },
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
    const { picPreview, description } = this.state;
    // prepare JSON for POST api
    const pinJSON = {
      imgDescription: description,
      imgLink: picPreview,
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
    const target = e.target as HTMLMediaElement;
    this.setState({
      isLoaded: true,
      isError: target.currentSrc === `${window.location.origin}${error}`,
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
    const { description } = this.state;
    this.setState({
      AIimageStatus: {
        generatedImage: false,
        generatingImage: true,
      },
    });
    const { imageData, imageTitle } = await RESTcall({ address: '/api/AIimage', method: 'post', payload: { description } });
    this.setState({
      picPreview: imageData.data[0].url,
      description: imageTitle.choices[0].text.trim().replace(/[".]/g, ''),
      AIimageStatus: {
        generatedImage: true,
        generatingImage: false,
      },
    });
  };

  handleImageTypes = () => {
    const {
      type, isError, picPreview, AIimageStatus,
    } = this.state;

    switch (type) {
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
          <Button
            variant="contained"
            startIcon={<PsychologyIcon />}
            sx={{ margin: '2.3vh' }}
            component="label"
            color="info"
            onClick={this.handleAIimage}
            disabled={AIimageStatus.generatedImage || AIimageStatus.generatingImage}
          >
            {AIimageStatus.generatedImage ? 'Generated' : 'Generate Image'}
          </Button>
        );
      default:
        return null;
    }
  };

  render() {
    const {
      description, isError, picPreview, isLoaded, type, AIimageStatus,
    } = this.state;
    const modalWidth = getModalWidth();
    const isDescriptionError = description.trim().length < 5;
    return (
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
          {`Create pin from ${type}`}
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
                value={type}
                exclusive
                onChange={(_, imgType) => (imgType ? this.setState({ type: imgType, picPreview: '' }) : null)}
                aria-label="text alignment"
                sx={{ marginRight: 80, color: '900' }}
              >
                <ToggleButton value="link" aria-label="link type">
                  <LinkIcon />
                </ToggleButton>
                <ToggleButton value="upload" aria-label="upload type">
                  <DriveFolderUploadIcon />
                </ToggleButton>
                <ToggleButton value="AI" aria-label="AI type">
                  <PsychologyIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardMedia
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
            }}
            >
              <TextField
                id="pin-description"
                label={type === 'AI' ? 'Describe what you want in detail...' : 'Description...'}
                variant={type === 'AI' ? 'outlined' : 'standard'}
                color="success"
                onChange={({ target: { value } }) => {
                  if (type === 'AI') {
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
                multiline={type === 'AI'}
                maxRows={3}
              />
              {
                this.handleImageTypes()
              }
            </div>
          </CardActions>

        </Card>
      </Dialog>

    );
  }

}

export default PinCreate;
