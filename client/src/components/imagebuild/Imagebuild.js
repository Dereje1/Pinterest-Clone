import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import MasonryPins from './MasonryPins';
import PinZoom from '../modal/modalzoom';
import Loading from './Loading';
import SignIn from '../signin/signin';
import RESTcall from '../../crud';
import { initialDisplayPerScroll, updatePinList } from '../../utils/utils';
import './imagebuild.scss';
import error from '../mypins/error.png';

const PINS_DISPLAY_PER_SCROLL = 10;

// builds images, component shared by both home and mypins
function ImageBuild({
  pinImage,
  deletePin,
  pinList,
  displayBrokenImage,
  ready,
  user,
}) {
  const [displayPinZoom, setDisplayPinZoom] = useState(false);
  const [imageInfo, setImageInfo] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedPins, setLoadedPins] = useState([]);
  const [activePins, setActivePins] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [batchSize, setBatchSize] = useState(initialDisplayPerScroll());
  const [displayLogin, setDisplayLogin] = useState(false);

  useEffect(() => {
    setLoadedPins(pinList);
  }, [pinList]);

  useEffect(() => {
    setActivePins(loadedPins.slice(0, batchSize));
    if (displayPinZoom) {
      const [zoomedImg, ...rest] = imageInfo;
      const [pin] = loadedPins.filter((p) => p._id === zoomedImg._id);
      if (pin) setImageInfo([pin, ...rest]);
      else setImageInfo([]);
    }
  }, [loadedPins, batchSize]);

  useEffect(() => {
    if (imageInfo.length) {
      setDisplayPinZoom(true);
    } else {
      setDisplayPinZoom(false);
    }
  }, [imageInfo]);

  // Masonry callback executes this function
  const layoutComplete = () => {
    // only set state on first true loads
    if (imagesLoaded) return;
    setImagesLoaded(true);
    setScrollPosition(document.body.scrollTop);
  };

  // img onError callback executes this function
  const onBrokenImage = (id) => {
    let pinListCopy = JSON.parse(JSON.stringify(loadedPins));
    const indexOfBroken = pinListCopy.findIndex((p) => p._id === id);
    const msg = `Broken Img - ${pinListCopy[indexOfBroken].imgDescription}`;
    console.log(msg);
    // update copy -->no mutation but do not delete from db
    if (displayBrokenImage) {
      pinListCopy[indexOfBroken].imgLink = error;
      pinListCopy[indexOfBroken].imgDescription = msg;
    } else {
      pinListCopy = [...pinListCopy.slice(0, indexOfBroken),
        ...pinListCopy.slice(indexOfBroken + 1)];
    }
    setLoadedPins(pinListCopy);
  };

  const handleNewComment = async (newComment) => {
    const [pin] = imageInfo;

    const updatedPin = await RESTcall({
      address: `/api/comment/${pin._id}`,
      method: 'put',
      payload: { comment: newComment },
    });

    setLoadedPins(updatePinList(loadedPins, updatedPin));
  };

  const togglePinImage = async ({ _id, hasSaved }) => {
    const { username } = user;
    // can not do this unless logged in
    if (username === 'Guest') {
      setDisplayLogin(true);
      return;
    }
    const updatedPin = await RESTcall({
      address: `/api/${hasSaved ? 'unpin' : 'pin'}/${_id}`,
      method: 'put',
    });

    setLoadedPins(updatePinList(loadedPins, updatedPin));
  };

  // Zoom modal takes event and pic info and executes
  const pinEnlarge = (e, currentImg) => {
    const { target: { naturalWidth, naturalHeight } } = e;
    // disregard for save/delete calls or if already zoomed
    if (e.target.className.includes('actionbutton') || displayPinZoom) return;
    setImageInfo([currentImg, document.body.scrollTop, { naturalWidth, naturalHeight }]);
  };

  const nextScroll = () => {
    setImagesLoaded(false);
    setBatchSize(batchSize + PINS_DISPLAY_PER_SCROLL);
  };

  return (
    <>
      { displayLogin && (
        <SignIn
          removeSignin={() => setDisplayLogin(false)}
        />
      )}
      <div id="mainframe">
        <InfiniteScroll
          dataLength={activePins.length}
          next={nextScroll}
          hasMore={activePins.length < loadedPins.length}
          initialScrollY={scrollPosition}
        >
          <MasonryPins
            layoutComplete={layoutComplete}
            pinEnlarge={pinEnlarge}
            onBrokenImage={onBrokenImage}
            pinImage={pinImage && togglePinImage}
            deletePin={deletePin}
            pins={activePins}
          />
        </InfiniteScroll>
        { displayPinZoom && (
          <PinZoom
            reset={() => setImageInfo([])}
            zoomInfo={imageInfo}
            pinImage={pinImage && togglePinImage}
            deletePin={deletePin}
            user={user}
            handleNewComment={handleNewComment}
          />
        )}
      </div>
      <Loading imagesLoaded={imagesLoaded} ready={ready} />
    </>
  );
}
export default ImageBuild;

ImageBuild.defaultProps = {
  pinList: [null],
  pinImage: undefined,
  deletePin: null,
  displayBrokenImage: undefined,
};

ImageBuild.propTypes = {
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.bool,
  deletePin: PropTypes.func,
  // caller will send list of pins after AJAX request complete
  pinList: PropTypes.arrayOf(PropTypes.shape),
  displayBrokenImage: PropTypes.bool,
  ready: PropTypes.bool.isRequired,
  user: PropTypes.objectOf(PropTypes.shape).isRequired,
};
