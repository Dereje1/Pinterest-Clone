import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MasonryPins from './MasonryPins';
import PinZoom from '../modal/modalzoom';
import Loading from './Loading';
import './imagebuild.scss';
import imageBroken from '../mypins/NO-IMAGE.png';

// builds images, component shared by both home and mypins
const ImageBuild = ({
  pinImage,
  deletePin,
  pinList,
  displayBrokenImage,
  ready,
}) => {
  const [displayPinZoom, setDisplayPinZoom] = useState(false);
  const [imageInfo, setImageInfo] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedPins, setLoadedPins] = useState([]);

  useEffect(() => {
    setLoadedPins(pinList);
  }, [pinList]);

  // Masonry callback executes this function
  const layoutComplete = () => {
    // only set state on first true loads
    if (imagesLoaded) return;
    setImagesLoaded(true);
  };

  // img onError callback executes this function
  const onBrokenImage = (id) => {
    /*
    handles broken image links
    basically same as delete pic function but just
    removes from state and not the databse as image
    could become reactivated in a future time
    still keep in database records until owner deletes
    */
    let pinListCopy = JSON.parse(JSON.stringify(loadedPins));
    const indexOfBroken = pinListCopy.findIndex(p => p._id === id);
    const msg = `Broken Img - ${pinListCopy[indexOfBroken].imgDescription}`;
    console.log(msg);
    // update copy -->no mutation but do not delete from db
    if (displayBrokenImage) {
      pinListCopy[indexOfBroken].imgLink = imageBroken;
      pinListCopy[indexOfBroken].imgDescription = msg;
    } else {
      pinListCopy = [...pinListCopy.slice(0, indexOfBroken),
        ...pinListCopy.slice(indexOfBroken + 1)];
    }
    setLoadedPins(pinListCopy);
  };

  // Zoom modal takes event and pic info and executes
  const pinEnlarge = (e, currentImg) => { // calls zoom in modal for the clicked picture
    if (e.target.type === 'submit') return;
    if (displayPinZoom) return;
    setDisplayPinZoom(true);
    setImageInfo([currentImg, e.pageY - e.clientY]);
  };

  return (
    <React.Fragment>
      <Loading imagesLoaded={imagesLoaded} ready={ready} />
      <div id="mainframe">
        <MasonryPins
          layoutComplete={layoutComplete}
          pinEnlarge={pinEnlarge}
          onBrokenImage={onBrokenImage}
          pinImage={pinImage}
          deletePin={deletePin}
          pins={loadedPins}
          imagesLoaded={imagesLoaded}
          ready={ready}
        />
        { displayPinZoom && (
          <PinZoom
            reset={() => setDisplayPinZoom(false)}
            zoomInfo={imageInfo}
            pinImage={pinImage}
            deletePin={deletePin}
          />
        )}
      </div>
    </React.Fragment>
  );
};
export default ImageBuild;

ImageBuild.defaultProps = {
  pinList: [null],
  pinImage: null,
  deletePin: null,
  displayBrokenImage: undefined,
};

ImageBuild.propTypes = {
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
  // caller will send list of pins after AJAX request complete
  pinList: PropTypes.arrayOf(PropTypes.any),
  displayBrokenImage: PropTypes.bool,
  ready: PropTypes.bool.isRequired,
};
