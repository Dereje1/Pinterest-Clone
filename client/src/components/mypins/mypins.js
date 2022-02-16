// user page only for authenticated users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import PinCreate from './pincreatemodal';
import ImageBuild from '../imagebuild/imagebuild';
import RESTcall from '../../crud'; // pin CRUD
import './mypins.scss';
import imageBroken from './NO-IMAGE.png';

const getUserName = ({ service, displayname }) => {
  const obj = {
    twitter: <TwitterIcon style={{ fontSize: 30, marginTop: 80, color: '#1DA1F2' }} />,
    google: <GoogleIcon style={{ fontSize: 30, marginTop: 80, color: '#4285F4' }} />,

  };
  return (
    <>
      {
        obj[service]
      }
      <h3 id="username">
        {displayname}
      </h3>
    </>
  );
};

export class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate: false, // controls pin creation modal
      pinList: [], // collects the pins user owns and saved
      displayPinZoom: false, // controls pin zoom modal
      imageInfo: [], // used to send to pin zoom
      imagesLoaded: false,
    };
  }

  async componentDidMount() {
    // get all pins and filter by owned and saved and then concatenate and set state
    const pinsFromDB = await RESTcall({
      address: '/api/?type=profile',
      method: 'get',
    });
    this.setState({
      pinList: pinsFromDB,
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
      imageInfo: [currentImg,
        <button
          key={currentImg}
          type="submit"
          className="actionbutton"
          onClick={() => this.deletePic(currentImg)}
        >
          Delete
        </button>,
        e.pageY - e.clientY,
      ],
    });
  };

  async addPic(pinJSON) { // adds a pin to the db
    // copy then add pin to db and then update client state (in that order)
    const { pinList } = this.state;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const newPin = await RESTcall({
      address: '/api/newpin',
      method: 'post',
      payload: pinJSON,
    });

    const {
      savedBy, owner, imgLink, imgDescription, _id,
    } = newPin;
    const pinAdd = {
      _id,
      imgDescription,
      imgLink,
      savedBy,
      owner: owner.name,
      owns: true,
      hasSaved: false,
    };
    pinListCopy = [...pinListCopy, pinAdd];
    this.setState({
      pinList: pinListCopy,
    });
  }

  pinForm() { // display pin creation modal
    this.setState({
      displayPinCreate: true,
    });
  }

  deletePic(element) {
    const { pinList, displayPinCreate } = this.state;
    if (displayPinCreate) return;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfDeletion = pinListCopy.findIndex(p => p._id === element._id);
    pinListCopy = [...pinListCopy.slice(0, indexOfDeletion),
      ...pinListCopy.slice(indexOfDeletion + 1)];
    this.setState({
      pinList: pinListCopy, displayPinZoom: false,
    }, async () => {
      await RESTcall({
        address: `/api/${element._id}`,
        method: 'delete',
      });
    });
  }

  render() {
    const { user, user: { authenticated } } = this.props;
    const {
      displayPinCreate, displayPinZoom, imageInfo, pinList, imagesLoaded,
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
            { displayPinCreate && (
              <PinCreate
                reset={() => this.setState({ displayPinCreate: false })}
                userInfo={user}
                savePin={pinJSON => this.addPic(pinJSON)}
              />
            )}
          </div>
          <ImageBuild
            layoutComplete={this.layoutComplete}
            pinEnlarge={this.pinEnlarge}
            onBrokenImage={this.onBrokenImage}
            pinImage={null}
            deletePin={e => this.deletePic(e)}
            pinList={pinList}
            imagesLoaded={imagesLoaded}
            displayPinZoom={displayPinZoom}
            resetModal={() => this.setState({ displayPinZoom: false })}
            zoomInfo={imageInfo}
          />
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
