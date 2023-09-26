import React, { useState } from 'react';
import Masonry from 'react-masonry-component';
import { Typography } from '@mui/material';
import HandleThumbnailImage from './HandleThumbnailImage';
import { PinType } from '../../../interfaces';

interface MasonryPinsProps {
  pins: PinType[]
  layoutComplete: () => void
  pinEnlarge: (e: React.SyntheticEvent, pin: PinType) => void
  onBrokenImage: (_id: string) => void
  pinImage: (pin: PinType) => void
  deletePin: ((pin: PinType) => void) | null
}

const initialLoadedImages: string[] = [];

function MasonryPins({
  layoutComplete,
  pinEnlarge,
  onBrokenImage,
  pinImage,
  deletePin,
  pins,
}: MasonryPinsProps) {
  const [loadedImages, setLoadedImages] = useState(initialLoadedImages);

  return (
    <Masonry
      onImagesLoaded={layoutComplete}
      className="my-gallery-class"
      options={{ fitWidth: true }}
    >
      {
        pins.map((pin) => (
          <div
            key={pin._id}
            role="button"
            className="image-box"
            onClick={(e) => pinEnlarge(e, pin)}
            onKeyDown={() => ({})}
            tabIndex={0}
          >
            <img
              alt={pin.imgDescription}
              onError={() => onBrokenImage(pin._id)}
              className="image-format"
              src={pin.imgLink}
              onLoad={() => setLoadedImages([...loadedImages, pin._id])}
              style={{ visibility: loadedImages.includes(pin._id) ? 'visible' : 'hidden' }}
            />
            <div className="description">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{`${pin.imgDescription}`}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{`📌 ${pin.savedBy.length}`}</Typography>
            </div>
            <HandleThumbnailImage
              pin={pin}
              pinImage={pinImage}
              deletePin={deletePin}
            />
            <div className="owner">{`${pin.owner.name}`}</div>
          </div>
        ))
      }
    </Masonry>
  );
}
export default MasonryPins;
