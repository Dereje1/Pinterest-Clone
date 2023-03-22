import React, { useState, useEffect } from 'react';
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
import {
  PinType, userType, zoomedImageInfoType, imageMetadataType,
} from '../../interfaces';
import './imagebuild.scss';
import error from '../mypins/error.png';

const PINS_DISPLAY_PER_SCROLL = 10;

interface ImageBuildProps {
  pinImage: boolean
  deletePin: ((pin: PinType) => void) | null
  pinList: PinType[]
  displayBrokenImage?: boolean
  ready: boolean
  user: userType
}

const initialLoadedPins: PinType[] = [];
const initialZoomedImageInfo: zoomedImageInfoType | null = null;

// builds images, component shared by both home and mypins
function ImageBuild({
  pinImage,
  deletePin,
  pinList,
  displayBrokenImage,
  ready,
  user,
}: ImageBuildProps) {
  const [zoomedImageInfo, setZoomedImageInfo] = useState(initialZoomedImageInfo);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedPins, setLoadedPins] = useState(initialLoadedPins);
  const [activePins, setActivePins] = useState(initialLoadedPins);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [batchSize, setBatchSize] = useState(initialDisplayPerScroll());
  const [displayLogin, setDisplayLogin] = useState(false);

  useEffect(() => {
    setLoadedPins(pinList);
  }, [pinList]);

  useEffect(() => {
    setActivePins(loadedPins.slice(0, batchSize));
    if (zoomedImageInfo) {
      const { pin } = zoomedImageInfo;
      const [foundpin] = loadedPins.filter((p) => p._id === pin._id);
      if (foundpin) {
        setZoomedImageInfo({
          ...zoomedImageInfo,
          pin: foundpin,
        });
      } else setZoomedImageInfo(null);
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
  const onBrokenImage = (id: string) => {
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

  const handleNewComment = async (newComment: string) => {
    if (zoomedImageInfo) {
      const { pin } = zoomedImageInfo;
      const updatedPin = await RESTcall({
        address: `/api/comment/${pin._id}`,
        method: 'put',
        payload: { comment: newComment },
      });
      setLoadedPins(updatePinList(loadedPins, updatedPin));
    }
  };

  const togglePinImage = async ({ _id, hasSaved }: { _id: string, hasSaved: boolean }) => {
    const { username } = user;
    // can not do this unless logged in
    if (username === 'Guest') {
      setDisplayLogin(true);
      return;
    }

    if (!pinImage) return;

    const updatedPin = await RESTcall({
      address: `/api/${hasSaved ? 'unpin' : 'pin'}/${_id}`,
      method: 'put',
    });

    setLoadedPins(updatePinList(loadedPins, updatedPin));
  };

  const handleTags = async (query: string) => {
    const updatedPin = await RESTcall({
      address: `/api/updateTags/${query}`,
      method: 'put',
    });

    setLoadedPins(updatePinList(loadedPins, updatedPin));
  };

  // Zoom modal takes event and pic info and executes
  const pinEnlarge = (e: React.SyntheticEvent, currentImg: PinType) => {
    const target = e.target as HTMLImageElement;
    const {
      naturalWidth, naturalHeight, className,
    } = target;
    // disregard for save/delete calls or if already zoomed
    if (className.includes('actionbutton') || zoomedImageInfo) return;

    const parentDivStyle = {
      ...getZoomedImageStyle({ naturalWidth, naturalHeight }),
      top: document.body.scrollTop,
      width: '90%',
    };
    const loadedIndex = loadedPins.findIndex((loadedPin) => loadedPin._id === currentImg._id);
    setZoomedImageInfo({
      pin: currentImg,
      parentDivStyle,
      loadedIndex,
    });
  };

  const nextScroll = () => {
    setImagesLoaded(false);
    setBatchSize(batchSize + PINS_DISPLAY_PER_SCROLL);
  };

  const handleSlide = (newIndex: number) => {
    if (newIndex < 0 || newIndex > (loadedPins.length - 1)) return;
    if (zoomedImageInfo) {
      setZoomedImageInfo({
        parentDivStyle: {
          ...zoomedImageInfo.parentDivStyle,
          ...getZoomedImageStyle({
            naturalHeight: 0,
            naturalWidth: 0,
            getStatic: true,
          }),
        },
        pin: loadedPins[newIndex],
        loadedIndex: newIndex,
      });
    }
  };

  const resetParentDivStyle = (metadata: imageMetadataType | null) => {
    if (!metadata || !zoomedImageInfo) return null;
    const parentDivStyle = {
      ...getZoomedImageStyle({ ...metadata }),
      top: document.body.scrollTop,
      width: '90%',
    };
    setZoomedImageInfo({
      ...zoomedImageInfo,
      parentDivStyle,
    });
    return parentDivStyle;
  };

  return (
    <>
      {displayLogin && (
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
          loader={<div />}
        >
          <MasonryPins
            layoutComplete={layoutComplete}
            pinEnlarge={pinEnlarge}
            onBrokenImage={onBrokenImage}
            pinImage={togglePinImage}
            deletePin={deletePin}
            pins={activePins}
          />
        </InfiniteScroll>
        {zoomedImageInfo && (
          <PinZoom
            reset={() => setZoomedImageInfo(null)}
            zoomInfo={zoomedImageInfo}
            pinImage={togglePinImage}
            deletePin={deletePin}
            user={user}
            handleNewComment={handleNewComment}
            updateTags={handleTags}
            displayLogin={() => setDisplayLogin(true)}
            onSlidePin={handleSlide}
            resetParentDivStyle={resetParentDivStyle}
          />
        )}
      </div>
      <Loading imagesLoaded={imagesLoaded} ready={ready} marginTop={0} />
    </>
  );
}
export default ImageBuild;

ImageBuild.defaultProps = {
  displayBrokenImage: undefined,
};
