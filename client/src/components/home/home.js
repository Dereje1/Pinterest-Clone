// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/imagebuild';
import SignIn from '../signin/signin';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
      displayPinZoom: false, // for zoom modal
      imageInfo: [], // to send to zoom modal
      imagesLoaded: false, // masonry callback
      displaySignIn: false,
    };
  }

  async componentDidMount() {
    const pinsFromDB = await RESTcall({
      address: '/api/?type=All',
      method: 'get',
    });
    this.setState({
      pinList: this.shuffleImages([...pinsFromDB]),
      fullList: pinsFromDB
    });
  }

  onBrokenImage = (id) => {
    /*
    handles broken image links
    basically same as delete pic function but just
    removes from state and not the databse as image
    could become reactivated in a future time
    still keep in database records until owner deletes
    */
    const { pinList } = this.state;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfDeletion = pinListCopy.findIndex(p => p._id === id);
    // update copy -->no mutation but do not delete from db
    console.log('Broken Image Found - ', pinListCopy[indexOfDeletion].imgDescription);
    pinListCopy = [...pinListCopy.slice(0, indexOfDeletion),
    ...pinListCopy.slice(indexOfDeletion + 1)];
    this.setState({
      pinList: pinListCopy,
    });
  }

  shuffleImages = (arr) => {
    const shuffled = [];
    while (arr.length) {
      const randIndex = Math.floor(Math.random() * arr.length);
      const [removed] = arr.splice(randIndex, 1);
      shuffled.push(removed);
    }
    return shuffled;
  }

  layoutComplete = () => {
    // fired by masonry call back
    const { imagesLoaded } = this.state;
    // only set state on first true loads
    if (imagesLoaded) return;
    this.setState({ imagesLoaded: true }, this.handleBrokenImages);
  }

  handleBrokenImages = async () => {
    const { pinList, fullList } = this.state;
    const loadedListIds = pinList.map(p => p._id);
    const brokenList = fullList
      .filter(pin => !loadedListIds.includes(pin._id))
      .map(pin => ({ pinId: pin._id, imgDescription: pin.imgDescription }))
    if (!brokenList.length) return null
    await RESTcall({
      address: '/api/broken',
      method: 'post',
      payload: brokenList
    });
  }

  imageStatus = (element) => {
    // finds the status of image to determine what kind of button to place on pic
    if (element.hasSaved || element.owns) { // If the user has already saved this pin
      return null; // no button
    }
    // user has not saved this pin show save button
    return (
      <button
        type="submit"
        className="actionbutton save"
        onClick={() => this.savePic(element)}
      >
        <i className="fa fa-thumb-tack" aria-hidden="true" />
        {' Save'}
      </button>
    );
  }

  pinEnlarge = (e, currentImg) => { // calls zoom in modal for the clicked picture
    const { displayPinZoom } = this.state;
    if (e.target.type === 'submit') return;
    if (displayPinZoom) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg, this.imageStatus(currentImg), e.pageY - e.clientY],
    });
  }

  savePic(element) { // saves a pic owned by somebody else into current users profile
    // can not do this unless logged in
    const {
      user: {
        displayname, username, service, userID,
      },
    } = this.props;
    const { pinList } = this.state;
    if (username === 'Guest') {
      this.setState({
        displaySignIn: true,
        displayPinZoom: false,
      });
      return;
    }
    // copy pinlist --> avoid mutation at all cost
    const pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfUpdate = pinListCopy.findIndex(p => p._id === element._id);
    // add current pinner info to saved by array of pin
    const newPinnerInfo = {
      name: displayname,
      service,
      id: userID,
    };
    const updated = [...element.savedBy, displayname];
    // update client then update db
    pinListCopy[indexOfUpdate].savedBy = updated;
    pinListCopy[indexOfUpdate].hasSaved = true;
    this.setState({
      pinList: pinListCopy,
      displayPinZoom: false,
    }, async () => {
      await RESTcall({
        address: `/api/${element._id}`,
        method: 'put',
        payload: newPinnerInfo,
      });
    });
  }


  render() {
    const { user: { authenticated, username } } = this.props;
    const {
      displayPinZoom, imageInfo, pinList, imagesLoaded, displaySignIn,
    } = this.state;
    const userStatus = username !== null;
    if (userStatus) {
      return (
        <React.Fragment>
          {
            !authenticated
              ? (
                <SignIn
                  show={displaySignIn}
                  removeSignin={() => this.setState({ displaySignIn: false })}
                  caller="home"
                />
              )
              : null
          }
          <ImageBuild
            layoutComplete={this.layoutComplete}
            pinEnlarge={this.pinEnlarge}
            onBrokenImage={this.onBrokenImage}
            pinImage={e => this.savePic(e)}
            deletePin={null}
            pinList={pinList}
            imagesLoaded={imagesLoaded}
            displayPinZoom={displayPinZoom}
            resetModal={() => this.setState({ displayPinZoom: false })}
            zoomInfo={imageInfo}
          />
          <div className={displayPinZoom ? 'modal-overlay' : ''} />
        </React.Fragment>
      );
    }
    return null;
  }

}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(Home);

Home.defaultProps = {
  user: {},
};

Home.propTypes = {
  // authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
};
