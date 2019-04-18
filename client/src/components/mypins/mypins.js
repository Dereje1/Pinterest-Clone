// user page only for authenticated users
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';

import PinCreate from './pincreatemodal';
import {
  addPin, getPins, deletePin, updatePin,
} from '../../actions/pinactions'; // pin CRUD
import Menu from '../menu/menu';
import PinZoom from '../modal/modalzoom';
import './mypins.scss';

class Mypins extends Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPinCreate: false, // controls pin creation modal
      pinList: [], // collects the pins user owns and saved
      displayPinZoom: false, // controls pin zoom modal
      imageInfo: [], // used to send to pin zoom
    };
  }

  componentDidMount() {
    // get all pins and filter by owned and saved and then concatenate and set state
    const { user } = this.props;
    getPins('All').then((pinsFromDB) => {
      const ownerFilter = pinsFromDB.filter(pin => pin.owner === user.user.username);
      const savedFilter = pinsFromDB.filter(pin => pin.savedBy.includes(user.user.username));
      this.setState({
        pinList: [...ownerFilter, ...savedFilter],
      });
    });
  }

  onBrokenImage(id) { // handles broken image links on user page
    // if the image is broken it will modify link to placeholder only on client side
    // keeps original link in db, in case image becomes activated in the future
    console.log('Broken Image Found', id);
    const { pinList } = this.state;
    const pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfModification = pinListCopy.findIndex(p => p._id === id);
    // update copy of image link and description
    pinListCopy[indexOfModification].imgLink = '/images/NO-IMAGE.png';
    pinListCopy[indexOfModification].imgDescription = `${pinListCopy[indexOfModification].imgDescription} Is Broken`;

    this.setState({
      pinList: pinListCopy,
    });
  }

  pinForm() { // display pin creation modal
    this.setState({
      displayPinCreate: true,
    });
  }

  pinEnlarge(e, currentImg) { // display pin zoom modal and passes image info
    const { displayPinZoom, displayPinCreate } = this.state;
    if (e.target.type === 'submit') return;
    if (displayPinZoom || displayPinCreate) return;
    this.setState({
      displayPinZoom: true,
      imageInfo: [currentImg,
        <button
          key={currentImg}
          type="submit"
          className="actionbutton"
          onClick={() => this.deletePic(currentImg)}
        >
          {'Delete'}
        </button>,
        e.pageY - e.clientY,
      ],
    });
  }

  deletePic(element) { // deletes a picture
    // however if not owner must only do an update as you MUST be owner to completely delete it from
    // database but can delete from client state
    const { user } = this.props;
    const { pinList, displayPinCreate } = this.state;
    if (displayPinCreate) return;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    const indexOfDeletion = pinListCopy.findIndex(p => p._id === element._id);
    pinListCopy = [...pinListCopy.slice(0, indexOfDeletion),
      ...pinListCopy.slice(indexOfDeletion + 1)];
    if (element.owner !== user.user.username) { // not an owner of the pin
      // ready to update pin
      let toUpdate = [...element.savedBy]; // copy all users who have saved pin
      const indexOfUpdate = toUpdate.findIndex(saved => saved === user.user.username);
      // remove user from list
      toUpdate = [...toUpdate.slice(0, indexOfUpdate), ...toUpdate.slice(indexOfUpdate + 1)];
      // update state with deleted pin but update db with updated pin
      this.setState({
        pinList: pinListCopy,
        displayPinZoom: false,
      }, () => updatePin(element._id, toUpdate));
    } else { // user owns pin can delete both from state and db
      this.setState({
        pinList: pinListCopy,
        displayPinZoom: false,
      }, () => deletePin(element._id));
    }
  }

  addPic(pinJSON) { // adds a pin to the db
    // copy then add pin to db and then update client state (in that order)
    const { pinList } = this.state;
    let pinListCopy = JSON.parse(JSON.stringify(pinList));
    addPin(pinJSON).then((newPin) => {
      pinListCopy = [...pinListCopy, newPin];
      this.setState({
        pinList: pinListCopy,
      });
    });
  }


  buildImages() { // bulds images using masonry very similar to home component (may merge in future)
    const { pinList } = this.state;
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
        />
        <div className="description text-center">
          {element.imgDescription}
        </div>
        <button
          type="submit"
          className="actionbutton"
          onClick={() => this.deletePic(element)}
        >
          {'Delete'}
        </button>
        <div className="owner">{`Linked By: ${element.owner}`}</div>
      </div>
    ));
    return childElements;
  }

  render() {
    const { user } = this.props;
    const { displayPinCreate, displayPinZoom, imageInfo } = this.state;
    if (!user.user.authenticated) window.location.assign('/');
    return (
      <React.Fragment>
        <Menu user={user} message={displayPinZoom || displayPinCreate} />
        <div>
          <div id="mypinframe">
            <h3 id="username">{user.user.displayname}</h3>
            <div
              id="creatpinwrapper"
              onClick={() => this.pinForm()}
              role="button"
              onKeyDown={() => {}}
              tabIndex={0}
            >
              <div id="createpin">
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </div>
              <h3 id="createpintext">Create Pin</h3>
            </div>
            <PinCreate
              message={displayPinCreate}
              reset={() => this.setState({ displayPinCreate: false })}
              userInfo={user.user}
              savePin={pinJSON => this.addPic(pinJSON)}
            />
          </div>
          <div id="mainframe">
            <Masonry>
              {this.buildImages()}
            </Masonry>
          </div>
          <PinZoom
            message={displayPinZoom}
            reset={() => this.setState({ displayPinZoom: false })}
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
  user: PropTypes.shape(PropTypes.shape),
};
