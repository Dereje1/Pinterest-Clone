import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import CardMedia from '@mui/material/CardMedia';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforetIcon from '@mui/icons-material/NavigateBefore';
import { zoomedImageInfoType, imageMetadataType } from '../../../interfaces';

interface SwipableImageProps {
  zoomInfo: zoomedImageInfoType,
  onSlidePin: (newIndex: number) => void
  onSetImageMetaData: (metaData: imageMetadataType) => void
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

type slideType = 'left' | 'right' | false

function SwipableImage({ zoomInfo, onSlidePin, onSetImageMetaData }: SwipableImageProps) {
  const { pin: pinInformation, parentDivStyle } = zoomInfo;

  const [slideImage, setSlideImage] = useState(false as slideType);
  const [showImageListItemBar, setShowImageListItemBar] = useState(false);

  useEffect(
    () => {
      if (slideImage === 'left') {
        onSlidePin(zoomInfo.loadedIndex - 1);
      }

      if (slideImage === 'right') {
        onSlidePin(zoomInfo.loadedIndex + 1);
      }

      return () => {
        setSlideImage(false);
      };
    },
    [slideImage],
  );

  const onPinLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = target;
    onSetImageMetaData({ naturalWidth, naturalHeight });
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setSlideImage('left'),
    onSwipedRight: () => setSlideImage('right'),
    ...config,
  });

  return (
    <div
      onMouseOver={() => setShowImageListItemBar(true)}
      onMouseLeave={() => setShowImageListItemBar(false)}
      onFocus={() => ({})}
    >
      <CardMedia
        component="img"
        image={pinInformation.imgLink}
        id="pin-zoom"
        sx={{
          width: parentDivStyle.imgWidth,
          height: parentDivStyle.imgHeight,
          marginLeft: 'auto',
          marginRight: 'auto',
          objectFit: 'contain',
          border: parentDivStyle.border,
        }}
        onLoad={onPinLoad}
        {...handlers}
      />
      {
        showImageListItemBar && (
          <ImageListItemBar
            position="bottom"
            sx={
              {
                background: 'rgba(0, 0, 0, 0.5)',
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
              <div id="actionbuttons" style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 1)' }}
                  aria-label={`info about ${pinInformation.imgDescription}`}
                  onClick={() => setSlideImage('left')}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <NavigateBeforetIcon fontSize="large" />
                </IconButton>
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 1)' }}
                  aria-label={`info about ${pinInformation.imgDescription}`}
                  onClick={() => setSlideImage('right')}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <NavigateNextIcon fontSize="large" />
                </IconButton>
              </div>
            )}
          />
        )
      }

    </div>
  );
}

export default SwipableImage;
