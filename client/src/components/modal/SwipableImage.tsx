import React from 'react';
import { useSwipeable } from 'react-swipeable';
import CardMedia from '@mui/material/CardMedia';
import { zoomedImageInfoType } from '../../interfaces';

interface SwipableImageProps {
    zoomInfo: zoomedImageInfoType,
    onSwipe: (newIndex: number) => void
}

const config = {
  delta: 10, // min distance(px) before a swipe starts. *See Notes*
  preventScrollOnSwipe: false, // prevents scroll during swipe (*See Details*)
  trackTouch: true, // track touch input
  trackMouse: true, // track mouse input
  rotationAngle: 0, // set a rotation angle
  swipeDuration: Infinity, // allowable duration of a swipe (ms). *See Notes*
  touchEventOptions: { passive: true }, // options for touch listeners (*See Details*)
};

function SwipableImage({ zoomInfo, onSwipe }: SwipableImageProps) {
  const { pin: pinInformation, parentDivStyle } = zoomInfo;
  const handlers = useSwipeable({
    // onSwiped: (eventData) => console.log('User Swiped!', eventData),
    onSwipedLeft: () => onSwipe(zoomInfo.loadedIndex + 1),
    onSwipedRight: () => onSwipe(zoomInfo.loadedIndex - 1),
    ...config,
  });
  console.log({ currentIndex: zoomInfo.loadedIndex });
  return (
    <CardMedia
      component="img"
      image={pinInformation.imgLink}
      id="pin-zoom"
      sx={{
        width: parentDivStyle.imgWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      {...handlers}
    />
  );
}

export default SwipableImage;
