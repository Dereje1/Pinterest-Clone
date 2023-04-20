// displays modal that creates pin
import React, { Component } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import SavePin from './SavePin';
import error from './error.png';
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
  upload: boolean
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
      upload: false,
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

  render() {
    const {
      description, isError, picPreview, isLoaded, upload,
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
          {`Create pin from ${upload ? 'file' : 'link'}`}
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
              <FormControlLabel
                control={(
                  <Switch
                    checked={upload}
                    onChange={() => this.setState({ upload: !upload, picPreview: '' })}
                  />
                )}
                label={<DriveFolderUploadIcon />}
                sx={{ marginRight: 80, color: '900' }}
              />
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
                label="Description..."
                variant="standard"
                color="success"
                onChange={({ target: { value } }) => value.trim().length <= 20
     && this.setState({ description: value })}
                value={description}
                error={!description || isDescriptionError}
                style={{ margin: '1.5vh', width: '100%' }}
              />
              {
                upload
                  ? (
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
                  )
                  : (
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
                  )
              }
            </div>
          </CardActions>

        </Card>
      </Dialog>

    );
  }

}

export default PinCreate;
