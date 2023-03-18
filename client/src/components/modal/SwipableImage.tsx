import React from 'react';
import { useSwipeable } from 'react-swipeable';
import CardMedia from '@mui/material/CardMedia';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforetIcon from '@mui/icons-material/NavigateBefore';
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
    onSwipedLeft: () => onSwipe(zoomInfo.loadedIndex + 1),
    onSwipedRight: () => onSwipe(zoomInfo.loadedIndex - 1),
    ...config,
  });

  return (
    <>
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
      <ImageListItemBar
        position="bottom"
        sx={
          {
            background: 'transparent',
            '& .MuiImageListItemBar-titleWrap': {
              flexGrow: 0,
              display: 'none',
            },
            '& .MuiImageListItemBar-actionIcon': {
              flexGrow: 1,
            },
          }
        }
        actionIcon={(
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            <IconButton
              sx={{ color: 'rgba(255, 255, 255, 1)' }}
              aria-label={`info about ${pinInformation.imgDescription}`}
              onClick={() => onSwipe(zoomInfo.loadedIndex - 1)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <NavigateBeforetIcon />
            </IconButton>
            <IconButton
              sx={{ color: 'rgba(255, 255, 255, 1)' }}
              aria-label={`info about ${pinInformation.imgDescription}`}
              onClick={() => onSwipe(zoomInfo.loadedIndex + 1)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <NavigateNextIcon />
            </IconButton>
          </div>
        )}
      />
    </>
  );
}

export default SwipableImage;
