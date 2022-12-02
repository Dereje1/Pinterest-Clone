// user page only for authenticated users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import PinCreate from './pincreatemodal';
import ImageBuild from '../imagebuild/imagebuild';
import RESTcall from '../../crud'; // pin CRUD
import './mypins.scss';

const getUserName = ({ service, displayName, username }) => {
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
    github:
  <>
    <GitHubIcon style={{ fontSize: 30, color: '#1d7b20' }} />
    <Typography style={{ marginLeft: 15 }}>
      {`@${username}`}
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
        {displayName}
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
      showDeleteImageModal: false,
      deletableImgInfo: null,
      ready: false,
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
      ready: true,
    });
  }

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
      displayPinCreate, showDeleteImageModal,
      deletableImgInfo, allPinLinks, pinList,
      ready,
    } = this.state;
    if (!authenticated) return null;
    if (!ready) {
      return (
        <div id="bubblecontainer" style={{ display: 'flex' }}>
          <div className="bubbles A" />
          <div className="bubbles B" />
          <div className="bubbles C" />
        </div>
      );
    }

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
          </div>
          {
            pinList.length
              ? (
                <ImageBuild
                  pinImage={null}
                  deletePin={(e) => {
                    if (e.owns) {
                      this.setState({
                        showDeleteImageModal: true,
                        deletableImgInfo: e,
                      });
                    } else {
                      this.deletePic(e);
                    }
                  }}
                  pinList={pinList}
                  ready={ready}
                  displayBrokenImage
                />
              )
              : (
                <Box
                  sx={{
                    width: 500,
                    height: 100,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: 10,
                    padding: 2,
                    backgroundColor: '#eeeeee',
                  }}
                >
                  <Typography variant="h4" style={{ textAlign: 'center' }}>
                    Welcome!
                  </Typography>
                  <Typography variant="h6">
                    To get started, you can create your own pin,
                    or save an existing pin from the
                    {' '}
                    <Link exact to="/">home</Link>
                    {' '}
                    page
                  </Typography>
                </Box>
              )
          }

          {displayPinCreate && (
            <PinCreate
              reset={() => this.setState({ displayPinCreate: false })}
              savePin={pinJSON => this.addPic(pinJSON)}
              allPinLinks={allPinLinks}
            />
          )}
          { showDeleteImageModal && (
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
          )}
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
