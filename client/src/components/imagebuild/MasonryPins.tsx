import React, { useState } from 'react';
import Masonry from 'react-masonry-component';
import { Typography } from '@mui/material';
import HandleThumbnailImage from './HandleThumbnailImage';
import { PinType } from '../../interfaces';

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
        pins.map((element) => (
          <div
            key={element._id}
            role="button"
            className="image-box"
            onClick={(e) => pinEnlarge(e, element)}
            onKeyDown={() => ({})}
            tabIndex={0}
          >
            <img
              alt={element.imgDescription}
              onError={() => onBrokenImage(element._id)}
              className="image-format"
              src={element.imgLink}
              onLoad={() => setLoadedImages([...loadedImages, element._id])}
              style={{ visibility: loadedImages.includes(element._id) ? 'visible' : 'hidden' }}
            />
            <div className="description">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{`${element.imgDescription}`}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{`📌 ${element.savedBy.length}`}</Typography>
            </div>
            <HandleThumbnailImage
              element={element}
              pinImage={pinImage}
              deletePin={deletePin}
            />
            <div className="owner">{`${element.owner.name}`}</div>
          </div>
        ))
      }
    </Masonry>
  );
}
export default MasonryPins;
