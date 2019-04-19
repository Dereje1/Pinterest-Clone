// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';
import { getPins, deletePin, updatePin } from '../../actions/pinactions'; // adds book to db
import PinZoom from '../modal/modalzoom';
import './home.scss';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pinList: [], // stores all pins in db in state
      displayPinZoom: false, // for zoom modal
      imageInfo: [], // to send to zoom modal
      imagesLoaded: false,
    };
  }

  componentDidMount() {
    getPins('All').then((pinsFromDB) => { // get all pins then setstate
      this.setState({
        pinList: this.shuffleImages([...pinsFromDB]),
      });
    });
  }

  onBrokenImage(id) {
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
      const removed = arr.splice(randIndex, 1);
      shuffled.push(removed[0]);
    }
    return shuffled;
  }

  layoutComplete = () => {
    const { imagesLoaded } = this.state;
    if (imagesLoaded) return;
    this.setState({ imagesLoaded: true });
  }

  savePic(element) { // saves a pic owned by somebody else into current users repo
    // can not do this unless logged in
    const { user } = this.props;
    const { pinList } = this.state;
    if (user.user.username === 'Guest') {
      window.location = '/auth/twitter';
      return;
    }
    // copy pinlist --> avoid mutation at all cost
    const pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfUpdate = pinListCopy.findIndex(p => p._id === element._id);
    // add current username to saved by array of pin
    const updated = [...element.savedBy, user.user.username];
    // update client then update db
    pinListCopy[indexOfUpdate].savedBy = updated;
    this.setState({
      pinList: pinListCopy,
      displayPinZoom: false,
    }, () => updatePin(element._id, updated));
  }

  deletePic(element) { // deletes a pic that user owns
    const { pinList } = this.state;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfDeletion = pinListCopy.findIndex(p => p._id === element._id);
    // update copy -->no mutation and then delete from db
    pinListCopy = [...pinListCopy.slice(0, indexOfDeletion),
      ...pinListCopy.slice(indexOfDeletion + 1)];
    this.setState({
      pinList: pinListCopy,
      displayPinZoom: false,
    }, () => deletePin(element._id));
  }

  imageStatus(element) { // find the status of image to determine what kind of
    // button to place on pic
    const { user } = this.props;
    if (element.owner !== user.user.username) { // If the user is not owner of the pin
      if (element.savedBy.includes(user.user.username)) { // If the user has already saved this pin
        return null; // no button
      } // user has not saved this pin show save button
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
    // user owns pin show delete button
    return (
      <button
        type="submit"
        className="actionbutton delete"
        onClick={() => this.deletePic(element)}
      >
        {'Delete'}
      </button>
    );
  }

  buildImages() { // build the images in frame using masonry
    const { pinList, imagesLoaded } = this.state;
    const childElements = pinList.map(element => (
      <div
        key={element._id}
        role="button"
        className="image-box"
        onClick={e => this.pinEnlarge(e, element)}
        onKeyDown={() => {}}
        tabIndex={0}
      >
        <img
          alt={element.imgDescription}
          onError={() => this.onBrokenImage(element._id)}
          className="image-format"
          src={element.imgLink}
          style={{ visibility: imagesLoaded ? 'visible' : 'hidden' }}
        />
        <div className="description">
          {element.imgDescription}
        </div>
        {this.imageStatus(element)}
        <div className="owner">{`Linked By: ${element.owner}`}</div>
      </div>
    ));
    return childElements;
  }

  pinEnlarge(e, currentImg) { // calls zoom in modal for the clicked picture
    const { displayPinZoom } = this.state;
    if (e.target.type === 'submit') return;
    if (displayPinZoom) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg, this.imageStatus(currentImg), e.pageY - e.clientY],
    });
  }

  render() {
  // render nothing if no guest or authenticated status
    const { user } = this.props;
    const { displayPinZoom, imageInfo } = this.state;
    const userStatus = user.user.username !== null;
    if (userStatus) {
      return (
        <React.Fragment>
          <div id="mainframe">
            <Masonry
              onImagesLoaded={() => this.layoutComplete()}
            >
              {this.buildImages()}
            </Masonry>
          </div>
          <PinZoom
            message={displayPinZoom}
            reset={() => this.setState({ displayPinZoom: false })}
            zoomInfo={imageInfo}
          />
        </React.Fragment>
      );
    }

    return (null);
  }

}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(Home);

Home.defaultProps = {
  user: {},
};

Home.propTypes = {
  user: PropTypes.shape(PropTypes.shape),
};
