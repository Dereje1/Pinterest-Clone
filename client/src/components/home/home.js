// homepage for both logged in and guest users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RESTcall from '../../crud';
import ImageBuild from '../imagebuild/imagebuild';
import SignIn from '../signin/signin';
import { shuffleImages, getFilteredPins } from '../../utils/utils';

export class Home extends Component {

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
      pinList: shuffleImages([...pinsFromDB]),
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
  };

  layoutComplete = () => {
    // fired by masonry call back
    const { imagesLoaded } = this.state;
    // only set state on first true loads
    if (imagesLoaded) return;
    this.setState({ imagesLoaded: true });
  };

  pinEnlarge = (e, currentImg) => { // calls zoom in modal for the clicked picture
    const { displayPinZoom } = this.state;
    if (e.target.type === 'submit') return;
    if (displayPinZoom) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg, e.pageY - e.clientY],
    });
  };

  pinImage(element) { // saves a pic owned by somebody else into current users profile
    // can not do this unless logged in
    const {
      user: {
        displayname, username,
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
    // add current pinner info to saved by array of pin
    const updatedPins = pinList.map((pin) => {
      if (pin._id === element._id) {
        return {
          ...pin,
          savedBy: [...pin.savedBy, displayname],
          hasSaved: true,
        };
      }
      return pin;
    });
    // update client then update db
    this.setState({
      pinList: updatedPins,
      displayPinZoom: false,
    }, async () => {
      await RESTcall({
        address: `/api/${element._id}`,
        method: 'put',
      });
    });
  }

  render() {
    const { user: { authenticated, username }, search } = this.props;
    const {
      displayPinZoom, imageInfo, pinList, imagesLoaded, displaySignIn,
    } = this.state;
    const filteredPins = getFilteredPins(pinList, search);
    if (username !== null) {
      return (
        <React.Fragment>
          {
            !authenticated && displaySignIn
              && (
                <SignIn
                  removeSignin={() => this.setState({ displaySignIn: false })}
                  caller="home"
                />
              )
          }
          <ImageBuild
            layoutComplete={this.layoutComplete}
            pinEnlarge={this.pinEnlarge}
            onBrokenImage={this.onBrokenImage}
            pinImage={e => this.pinImage(e)}
            deletePin={null}
            pinList={filteredPins}
            imagesLoaded={imagesLoaded}
            displayPinZoom={displayPinZoom}
            resetModal={() => this.setState({ displayPinZoom: false })}
            zoomInfo={imageInfo}
          />
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
  search: null,
};

Home.propTypes = {
  // authentication info from redux
  user: PropTypes.shape(PropTypes.shape),
  search: PropTypes.string,
};
