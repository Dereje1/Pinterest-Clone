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
import error from './error.png';

import {
  delay, validateURL, getModalWidth, isDuplicateError,
} from '../../utils/utils';
import './pincreate.scss';


class PinCreate extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      picPreview: '', // on erroneous image links
      description: '',
      isError: true,
      isLoaded: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    this.setState({
      description: '',
      picPreview: '',
    }, async () => { await delay(1000); });
  }

  // disableScroll = () => window.scrollTo(0, 0);

  close = () => {
    const { reset } = this.props;
    this.setState({
      picPreview: '',
      description: '',
      isError: true,
    }, reset);
  };

  processImage = (e) => { // processes picture on change of text box
    const imgLink = validateURL(e.target.value);
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

  onLoad = ({ target }) => {
    this.setState({
      isLoaded: true,
      isError: target.currentSrc === error,
    });
  };

  render() {
    const {
      description, isError, picPreview, isLoaded,
    } = this.state;
    const { allPinLinks } = this.props;
    const modalHeight = window.innerHeight * 0.92;
    const modalWidth = getModalWidth();
    const isDescriptionError = description.trim().length < 5;
    const duplicateError = isDuplicateError(allPinLinks, picPreview);
    return (
      <>
        <div className="pin-create-modal-overlay" />
        <Card sx={{ width: modalWidth, height: modalHeight }} className="pincreate cshow">

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
            image={picPreview === '' ? error : picPreview}
            onError={this.onError}
            onLoad={this.onLoad}
            sx={{ objectFit: 'contain', height: 0.52 * modalHeight }}
            id="new-pin-image"
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            position: 'absolute',
            top: 0.6 * modalHeight,
            width: '100%',
            marginTop: '5vh',
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
              style={{ margin: '1.5vh' }}
            />
            <TextField
              id="pin-img-link"
              label="Paste image address here http://..."
              variant="standard"
              onChange={e => this.processImage(e)}
              value={picPreview}
              error={isError}
              color="success"
              style={{ margin: '1.5vh' }}
            />
            <SavePin
              isImageError={isError || !isLoaded}
              isDescriptionError={isDescriptionError}
              isDuplicateError={duplicateError}
              savePic={this.savePic}
            />
          </div>
        </Card>
      </>
    );
  }

}

export default PinCreate;


PinCreate.propTypes = {
  // data used for pin creation
  allPinLinks: PropTypes.arrayOf(PropTypes.object).isRequired,
  // callback in mypins to turn modal off
  reset: PropTypes.func.isRequired,
  // POST request via axios
  savePin: PropTypes.func.isRequired,
};
