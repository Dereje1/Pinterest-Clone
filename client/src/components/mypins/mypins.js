// user page only for authenticated users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import PinCreate from './pincreatemodal';
import ImageBuild from '../imagebuild/imagebuild';
import RESTcall from '../../crud'; // pin CRUD
import './mypins.scss';
import imageBroken from './NO-IMAGE.png';

const getUserName = ({ service, displayname, username }) => {
  const serviceObj = {
    twitter:
  <>
    <TwitterIcon style={{ fontSize: 30, color: '#1DA1F2' }} />
    <Typography style={{ marginLeft: 15 }}>
      {`@${username}`}
    </Typography>
  </>,
    google:
  <>
    <GoogleIcon style={{ fontSize: 30, color: '#4285F4' }} />
    <Typography style={{ marginLeft: 15 }}>
      {username}
    </Typography>
  </>,
  };
  return (
    <div style={{
      marginTop: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    >
      <Typography variant="h4">
        {displayname}
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {serviceObj[service]}
      </div>
    </div>
  );
};

export class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate: false, // controls pin creation modal
      pinList: [], // collects the pins user owns and saved
      allPinLinks: [], // URL of all pins in DB
      displayPinZoom: false, // controls pin zoom modal
      imageInfo: [], // used to send to pin zoom
      imagesLoaded: false,
      showDeleteImageModal: false,
      deletableImgInfo: null,
    };
  }

  async componentDidMount() {
    // get all pins and filter by owned and saved and then concatenate and set state
    const { profilePins, allPinLinks } = await RESTcall({
      address: '/api/?type=profile',
      method: 'get',
    });
    this.setState({
      pinList: profilePins,
      allPinLinks,
    });
  }

  onBrokenImage = (id) => { // handles broken image links on user page
    // if the image is broken it will modify link to placeholder only on client side
    // keeps original link in db, in case image becomes activated in the future
    console.log('Broken Image Found', id);
    const { pinList } = this.state;
    const pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfModification = pinListCopy.findIndex(p => p._id === id);
    // update copy of image link and description
    pinListCopy[indexOfModification].imgLink = imageBroken;
    pinListCopy[indexOfModification].imgDescription = `${pinListCopy[indexOfModification].imgDescription} Is Broken`;

    this.setState({
      pinList: pinListCopy,
    });
  };

  layoutComplete = () => {
    const { imagesLoaded } = this.state;
    if (imagesLoaded) return;
    this.setState({ imagesLoaded: true });
  };

  pinEnlarge = (e, currentImg) => { // display pin zoom modal and passes image info
    const { displayPinZoom, displayPinCreate } = this.state;
    if (e.target.type === 'submit' || displayPinZoom || displayPinCreate) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg, e.pageY - e.clientY],
    });
  };

  async addPic(pinJSON) { // adds a pin to the db
    // copy then add pin to db and then update client state (in that order)
    const { pinList, allPinLinks } = this.state;
    const newPin = await RESTcall({
      address: '/api/newpin',
      method: 'post',
      payload: pinJSON,
    });
    const { owner, imgLink, originalImgLink } = newPin;
    const addedPin = {
      ...newPin,
      owner: owner.name,
      owns: true,
      hasSaved: false,
    };
    this.setState({
      pinList: [...pinList, addedPin],
      allPinLinks: [...allPinLinks, { imgLink, originalImgLink }],
    });
  }

  pinForm() { // display pin creation modal
    this.setState({
      displayPinCreate: true,
    });
  }

  deletePic({ _id, imgLink, owns }) {
    const { pinList, displayPinCreate, allPinLinks } = this.state;
    if (displayPinCreate) return;
    this.setState({
      pinList: pinList.filter(p => p._id !== _id),
      displayPinZoom: false,
      showDeleteImageModal: false,
      deletableImgInfo: null,
      allPinLinks: owns ? allPinLinks.filter(links => links.imgLink !== imgLink) : allPinLinks,
    }, async () => {
      await RESTcall({
        address: `/api/${_id}`,
        method: 'delete',
      });
    });
  }

  render() {
    const { user, user: { authenticated } } = this.props;
    const {
      displayPinCreate, displayPinZoom, imageInfo,
      pinList, imagesLoaded, showDeleteImageModal,
      deletableImgInfo, allPinLinks,
    } = this.state;
    if (!authenticated) window.location.assign('/');

    return (
      <React.Fragment>
        <div>
          <div id="mypinframe">
            {getUserName(user)}
            <div
              id="creatpinwrapper"
              onClick={() => this.pinForm()}
              role="button"
              onKeyDown={() => { }}
              tabIndex={0}
            >
              <div id="createpin">
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </div>
              <h3 id="createpintext">Create Pin</h3>
            </div>
            {displayPinCreate && (
              <PinCreate
                reset={() => this.setState({ displayPinCreate: false })}
                savePin={pinJSON => this.addPic(pinJSON)}
                allPinLinks={allPinLinks}
              />
            )}
          </div>
          <ImageBuild
            layoutComplete={this.layoutComplete}
            pinEnlarge={this.pinEnlarge}
            onBrokenImage={this.onBrokenImage}
            pinImage={null}
            deletePin={(e) => {
              if (e.owns) {
                this.setState({
                  showDeleteImageModal: true,
                  deletableImgInfo: e,
                  displayPinZoom: false,
                });
              } else {
                this.deletePic(e);
              }
            }}
            pinList={pinList}
            imagesLoaded={imagesLoaded}
            displayPinZoom={displayPinZoom}
            resetModal={() => this.setState({ displayPinZoom: false })}
            zoomInfo={imageInfo}
          />
          <Dialog
            open={showDeleteImageModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {`Permanently delete ${showDeleteImageModal && deletableImgInfo.imgDescription}?`}
            </DialogTitle>
            <DialogActions>
              <Button
                id="cancel-delete-alert"
                onClick={() => this.setState({
                  showDeleteImageModal: false,
                  deletableImgInfo: null,
                })}
              >
                Cancel
              </Button>
              <Button id="resume-delete-alert" onClick={() => this.deletePic(deletableImgInfo)} autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </React.Fragment>
    );
  }

}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(Mypins);

Mypins.defaultProps = {
  user: {},
};

Mypins.propTypes = {
  // authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
};
