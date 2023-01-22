import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import MasonryPins from './MasonryPins';
import PinZoom from '../modal/modalzoom';
import { Loading } from '../common/common';
import SignIn from '../signin/signin';
import RESTcall from '../../crud';
import {
  initialDisplayPerScroll,
  updatePinList,
  getZoomedImageStyle,
} from '../../utils/utils';
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
  const [zoomedImageInfo, setZoomedImageInfo] = useState(null);
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
    if (zoomedImageInfo) {
      const [zoomedImg, ...rest] = zoomedImageInfo;
      const [pin] = loadedPins.filter((p) => p._id === zoomedImg._id);
      if (pin) setZoomedImageInfo([pin, ...rest]);
      else setZoomedImageInfo(null);
    }
    // cleanup function to avoid memory leakage warning
    return () => {
      setZoomedImageInfo(null);
    };
  }, [loadedPins, batchSize]);

  useEffect(() => {
    if (!zoomedImageInfo) {
      document.body.style.overflowY = 'scroll';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [zoomedImageInfo]);

  // Masonry callback executes this function
  const layoutComplete = () => {
    // only set state on first true loads
    if (imagesLoaded) return;
    setImagesLoaded(true);
    setScrollPosition(document.body.scrollTop);
  };

  // img onError callback executes this function
  const onBrokenImage = (id) => {
    const indexOfBroken = loadedPins.findIndex((p) => p._id === id);
    const msg = `Broken Img - ${loadedPins[indexOfBroken].imgDescription}`;
    console.log(msg);
    // show error img on profile page but remove from home
    if (displayBrokenImage) {
      setLoadedPins(
        updatePinList(
          loadedPins,
          {
            ...loadedPins[indexOfBroken],
            imgLink: error,
            imgDescription: msg,
          },
        ),
      );
    } else {
      setLoadedPins([
        ...loadedPins.slice(0, indexOfBroken),
        ...loadedPins.slice(indexOfBroken + 1)]);
    }
  };

  const handleNewComment = async (newComment) => {
    const [pin] = zoomedImageInfo;

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

  const handleTags = async (query) => {
    const updatedPin = await RESTcall({
      address: `/api/updateTags/${query}`,
      method: 'put',
    });

    setLoadedPins(updatePinList(loadedPins, updatedPin));
  };

  // Zoom modal takes event and pic info and executes
  const pinEnlarge = (e, currentImg) => {
    const { target: { naturalWidth, naturalHeight, className } } = e;
    // disregard for save/delete calls or if already zoomed
    if (className.includes('actionbutton') || zoomedImageInfo) return;

    const parentDivStyle = {
      ...getZoomedImageStyle({ naturalWidth, naturalHeight }),
      top: document.body.scrollTop,
      width: '90%',
    };
    setZoomedImageInfo([
      currentImg,
      parentDivStyle,
    ]);
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
        { zoomedImageInfo && (
          <PinZoom
            reset={() => setZoomedImageInfo(null)}
            zoomInfo={zoomedImageInfo}
            pinImage={pinImage && togglePinImage}
            deletePin={deletePin}
            user={user}
            handleNewComment={handleNewComment}
            updateTags={handleTags}
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
