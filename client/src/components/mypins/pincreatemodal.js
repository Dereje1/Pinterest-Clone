// displays modal that creates pin
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CancelIcon from '@mui/icons-material/Cancel';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import SavePin from './SavePin';
import imageBroken from './NO-IMAGE.png';
import './pincreate.scss';

const validateURL = (string) => {
  try {
    const url = new URL(string);
    if (url.protocol === 'data:' || url.protocol === 'https:') return string;
    if (url.protocol === 'http:') {
      // convert to https to avoid mixed content warning in console
      return `${string.split(':')[0]}s:${string.split(':')[1]}`;
    }
  } catch (_) {
    return null;
  }
  return null;
};

const getModalWidth = () => {
  const { innerWidth } = window;
  if (innerWidth < 500) {
    return innerWidth;
  } if (innerWidth > 1000) {
    return innerWidth / 3;
  }
  return innerWidth / 2;
};

class PinCreate extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      picPreview: '', // on erroneous image links
      description: '',
      isError: true,
      showErrorImage: true,
    };
  }

  componentDidMount() {
    this.setState({ justMounted: true });
  }


  componentDidUpdate(prevProps, prevState) { // compare previous props to current efore showing
    const { message } = this.props;
    const { isError } = this.state;
    if ((prevProps.message === false) && (message === true)) {
      window.scrollTo(0, 0);
      this.setState({
        show: true,
        description: '',
        picPreview: imageBroken,
        justMounted: false,
      });
    }
    if (!prevState.isError && isError) {
      this.setState({ showErrorImage: true });
    }
    if (prevState.isError && !isError) {
      this.setState({ showErrorImage: false });
    }
  }

  // disableScroll = () => window.scrollTo(0, 0);

  close = () => {
    const { reset } = this.props;
    this.setState({
      show: false,
      picPreview: '',
      description: '',
      isError: true,
    }, () => reset());
  };

  processImage = (e) => { // processes picture on change of text box
    const imgLink = validateURL(e.target.value);
    if (!imgLink) return;
    this.setState({
      picPreview: imgLink,
      isError: false,
    });
  };

  savePic = () => { // ready to save pin
    const { userInfo, savePin } = this.props;
    const { picPreview, description, showErrorImage } = this.state;
    if (showErrorImage || description.length < 5) return;
    // prepare JSON for POST api
    const pinJSON = {
      owner: {
        name: userInfo.displayname,
        service: userInfo.service,
        id: userInfo.userId,
      },
      imgDescription: description,
      imgLink: picPreview,
    };
    // save into db and close modal
    savePin(pinJSON);
    this.close();
  };

  render() {
    const {
      show, justMounted, description, showErrorImage, isError, picPreview,
    } = this.state;
    if (justMounted) return null;
    const modalHeight = window.innerHeight * 0.92;
    const modalWidth = getModalWidth();
    const isDescriptionError = description.trim().length < 5;
    return (
      <Card sx={{ width: modalWidth, height: modalHeight }} className={show ? 'pincreate cshow' : 'pincreate chide'}>

        <CardHeader
          action={(
            <IconButton aria-label="settings" onClick={this.close}>
              <CancelIcon style={{ fontSize: '1.5em', color: '#3a1c1cde' }} />
            </IconButton>
          )}
          title="Create Pin"
          titleTypographyProps={{ fontSize: '1.5em', fontWeight: 'bold' }}
        />
        <CardMedia
          component="img"
          image={showErrorImage ? imageBroken : picPreview}
          onLoad={this.handleImage}
          onError={() => this.setState({ isError: true })}
          sx={{ objectFit: 'contain', height: 0.55 * modalHeight }}
          id="new-pin-image"
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          position: 'absolute',
          top: 0.6 * modalHeight,
          width: '100%',
          marginTop: 20,
        }}
        >
          <TextField
            id="pin-description"
            label="Description..."
            variant="standard"
            maxLength="28"
            color="success"
            onChange={({ target: { value } }) => value.trim().length <= 20
             && this.setState({ description: value })}
            value={description}
            error={!description || isDescriptionError}
            style={{ margin: 20 }}
          />
          <TextField
            id="pin-img-link"
            label="Paste image address here http://..."
            variant="standard"
            onChange={e => this.processImage(e)}
            value={isError ? '' : picPreview}
            error={isError}
            color="success"
            style={{ margin: 20 }}
          />
          <SavePin
            isImageError={showErrorImage}
            isDescriptionError={isDescriptionError}
            savePic={this.savePic}
          />
        </div>
      </Card>
    );
  }

}

export default PinCreate;


PinCreate.propTypes = {
  // turns modal on/off based on change
  message: PropTypes.bool.isRequired,
  // data used for pin creation
  userInfo: PropTypes.shape(PropTypes.shape).isRequired,
  // callback in mypins to turn modal off
  reset: PropTypes.func.isRequired,
  // POST request via axios
  savePin: PropTypes.func.isRequired,
};
