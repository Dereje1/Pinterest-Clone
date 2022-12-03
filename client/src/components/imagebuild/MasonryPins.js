import React from 'react';
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
  imagesLoaded,
  ready,
}) => (
  <Masonry
    onImagesLoaded={() => layoutComplete()}
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
            style={{ visibility: imagesLoaded && ready ? 'visible' : 'hidden' }}
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
  ready: PropTypes.bool.isRequired,
  imagesLoaded: PropTypes.bool.isRequired,
};
