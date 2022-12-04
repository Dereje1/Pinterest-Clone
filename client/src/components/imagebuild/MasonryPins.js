import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-component';
import HandleThumbnailImage from './HandleThumbnailImage';

const MasonryPins = ({
  layoutComplete,
  pinEnlarge,
  onBrokenImage,
  pinImage,
  deletePin,
  pins,
}) => {
  const [loadedImages, setLoadedImages] = useState([]);

  return (
    <Masonry
      onImagesLoaded={layoutComplete}
      className="my-gallery-class"
      options={{ fitWidth: true }}
    >
      {
        pins.map(element => (
          <div
            key={element._id}
            role="button"
            className="image-box"
            onClick={e => pinEnlarge(e, element)}
            onKeyDown={() => {}}
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
              {element.imgDescription}
            </div>
            <HandleThumbnailImage
              element={element}
              pinImage={pinImage}
              deletePin={deletePin}
            />
            <div className="owner">{`${element.owner}`}</div>
          </div>
        ))
      }
    </Masonry>
  );
};
export default MasonryPins;

MasonryPins.defaultProps = {
  pins: [null],
  pinImage: null,
  deletePin: null,
};

MasonryPins.propTypes = {
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
  layoutComplete: PropTypes.func.isRequired,
  pinEnlarge: PropTypes.func.isRequired,
  onBrokenImage: PropTypes.func.isRequired,
  pins: PropTypes.arrayOf(PropTypes.any),
};
