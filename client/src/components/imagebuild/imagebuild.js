import React from 'react';
import Masonry from 'react-masonry-component';
import PropTypes from 'prop-types';
import './imagebuild.scss';
// builds images, component shared by both home and mypins
const ImageBuild = ({
  layoutComplete,
  pinEnlarge,
  onBrokenImage,
  status,
  pinList,
  imagesLoaded,
}) => (
  <React.Fragment>
    <div id="bubblecontainer" style={{ display: imagesLoaded ? 'none' : 'flex' }}>
      <div className="bubbles A" />
      <div className="bubbles B" />
      <div className="bubbles C" />
    </div>
    <div id="mainframe">
      <Masonry
        onImagesLoaded={() => layoutComplete()}
      >
        {
          pinList.map(element => (
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
                style={{ visibility: imagesLoaded ? 'visible' : 'hidden' }}
              />
              <div className="description">
                {element.imgDescription}
              </div>
              {status(element)}
              <div className="owner">{`${element.owner}`}</div>
            </div>
          ))
        }
      </Masonry>
    </div>
  </React.Fragment>

);
export default ImageBuild;

ImageBuild.defaultProps = {
  pinList: [null],
};

ImageBuild.propTypes = {
  // Masonry callback executes this function in caller
  layoutComplete: PropTypes.func.isRequired,
  // Zoom modal caller takes event and pic info and executes in caller
  pinEnlarge: PropTypes.func.isRequired,
  // img onError callback executes this function in caller
  onBrokenImage: PropTypes.func.isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  status: PropTypes.func.isRequired,
  // caller will send list of pins after AJAX request complete
  pinList: PropTypes.arrayOf(PropTypes.any),
  // Turns on once Masonry runs loaded callback
  imagesLoaded: PropTypes.bool.isRequired,
};
